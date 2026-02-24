import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
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
    const { jobDescription, skillsSummary, category, portfolioLinks, tone, variations, maxChars } = body;

    if (!jobDescription?.trim() || !skillsSummary?.trim() || !category) {
      return NextResponse.json(
        { error: "Job description, skills summary, and category are required" },
        { status: 400 }
      );
    }

    const validCategories = ["qa", "sap", "dev", "devops"];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const systemPrompt = buildSystemPrompt(category, tone);
    const userPrompt = buildUserPrompt(jobDescription, skillsSummary, {
      portfolioLinks,
      variations: !!variations,
      maxChars: maxChars || undefined,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
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
      variations?: Array<{ hook?: string; pain_points?: string[]; proposal?: string; cta?: string }>;
    };
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    const matchScore = typeof parsed.match_score === "number" ? Math.min(100, Math.max(0, parsed.match_score)) : null;
    const importantKeywords = Array.isArray(parsed.important_keywords) ? parsed.important_keywords.join(", ") : null;
    const missingKeywords = Array.isArray(parsed.missing_keywords) ? parsed.missing_keywords.join(", ") : null;

    let primaryHook = parsed.hook ?? "";
    let primaryPainPoints = parsed.pain_points ?? [];
    let primaryProposal = parsed.proposal ?? "";
    let primaryCta = parsed.cta ?? "";
    let variationsList: Array<{ hook: string; pain_points: string[]; proposal: string; cta: string }> = [];

    if (parsed.variations && Array.isArray(parsed.variations) && parsed.variations.length > 0) {
      variationsList = parsed.variations.map((v) => ({
        hook: v.hook ?? "",
        pain_points: Array.isArray(v.pain_points) ? v.pain_points : [],
        proposal: v.proposal ?? "",
        cta: v.cta ?? "",
      }));
      primaryHook = variationsList[0].hook;
      primaryPainPoints = variationsList[0].pain_points;
      primaryProposal = variationsList[0].proposal;
      primaryCta = variationsList[0].cta;
    }

    // Save proposal to database (primary/first variation)
    const { error: insertError } = await supabase.from("proposals").insert({
      user_id: user.id,
      job_description: jobDescription,
      category,
      skills_summary: skillsSummary,
      portfolio_links: portfolioLinks || null,
      generated_proposal: primaryProposal,
      generated_hook: primaryHook,
      generated_pain_points: primaryPainPoints.join("\n"),
      generated_cta: primaryCta,
      match_score: matchScore,
      important_keywords: importantKeywords,
      missing_keywords: missingKeywords,
    });

    if (insertError) {
      console.error("Failed to save proposal:", insertError);
      // Still return the result - saving failed but generation succeeded
    }

    return NextResponse.json({
      hook: primaryHook,
      pain_points: primaryPainPoints,
      proposal: primaryProposal,
      cta: primaryCta,
      variations: variationsList.length > 0 ? variationsList : undefined,
      match_score: matchScore,
      important_keywords: parsed.important_keywords ?? [],
      missing_keywords: parsed.missing_keywords ?? [],
    });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
