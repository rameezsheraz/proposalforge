import { createClient } from "@/lib/supabase/server";
import { buildMatchScorePrompt } from "@/lib/prompts";
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
    const { jobDescription, skillsSummary, category, portfolioLinks } = body;

    if (!jobDescription?.trim() || !skillsSummary?.trim() || !category) {
      return NextResponse.json(
        { error: "Job description, skills, and category are required" },
        { status: 400 }
      );
    }

    const validCategories = ["qa", "sap", "dev", "devops"];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const userPrompt = buildMatchScorePrompt(
      jobDescription,
      skillsSummary,
      category,
      portfolioLinks
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at matching freelancer profiles to job postings. Be honest and helpful. Return only valid JSON.",
        },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    let parsed: { score?: number; summary?: string; fit?: string };
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
    }

    const score =
      typeof parsed.score === "number"
        ? Math.min(100, Math.max(0, Math.round(parsed.score)))
        : 50;
    const fit = ["strong", "moderate", "weak"].includes(parsed.fit ?? "")
      ? parsed.fit
      : score >= 80
        ? "strong"
        : score >= 50
          ? "moderate"
          : "weak";

    return NextResponse.json({
      score,
      summary: parsed.summary ?? "",
      fit,
    });
  } catch (err) {
    console.error("Match score error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Match check failed" },
      { status: 500 }
    );
  }
}
