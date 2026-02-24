import { createClient } from "@/lib/supabase/server";
import { buildImprovePrompt } from "@/lib/prompts";
import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentProposal, jobDescription, skillsSummary, feedback, category } = body;

    if (!currentProposal?.trim() || !jobDescription?.trim() || !skillsSummary?.trim()) {
      return NextResponse.json(
        { error: "Current proposal, job description, and skills are required" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const userPrompt = buildImprovePrompt(
      currentProposal,
      jobDescription,
      skillsSummary,
      feedback
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert Upwork proposal writer. Improve proposals to be more compelling and likely to win.",
        },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    let parsed: {
      hook?: string;
      pain_points?: string[];
      proposal?: string;
      cta?: string;
      match_score?: number;
      important_keywords?: string[];
      missing_keywords?: string[];
    };
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    const matchScore =
      typeof parsed.match_score === "number"
        ? Math.min(100, Math.max(0, parsed.match_score))
        : null;

    // Save improved proposal to database
    await supabase.from("proposals").insert({
      user_id: user.id,
      job_description: jobDescription,
      category: category || "dev",
      skills_summary: skillsSummary,
      generated_proposal: parsed.proposal ?? "",
      generated_hook: parsed.hook ?? "",
      generated_pain_points: Array.isArray(parsed.pain_points)
        ? parsed.pain_points.join("\n")
        : "",
      generated_cta: parsed.cta ?? "",
      match_score: matchScore,
      important_keywords: Array.isArray(parsed.important_keywords)
        ? parsed.important_keywords.join(", ")
        : null,
      missing_keywords: Array.isArray(parsed.missing_keywords)
        ? parsed.missing_keywords.join(", ")
        : null,
    });

    return NextResponse.json({
      hook: parsed.hook ?? "",
      pain_points: parsed.pain_points ?? [],
      proposal: parsed.proposal ?? "",
      cta: parsed.cta ?? "",
      match_score: matchScore,
      important_keywords: parsed.important_keywords ?? [],
      missing_keywords: parsed.missing_keywords ?? [],
    });
  } catch (err) {
    console.error("Improve error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Improvement failed" },
      { status: 500 }
    );
  }
}
