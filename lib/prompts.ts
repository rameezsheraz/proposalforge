const TONE_GUIDANCE: Record<string, string> = {
  formal: "Use a formal, professional tone. Avoid contractions. Be polished and business-like.",
  casual: "Use a friendly, conversational tone. Contractions are fine. Be approachable and warm.",
  confident: "Use a confident, assertive tone. Highlight expertise. Be direct and self-assured.",
  concise: "Use a brief, punchy tone. Short sentences. Get to the point quickly.",
};

const CATEGORY_CONTEXT: Record<string, string> = {
  qa: `You are helping a QA tester / QA engineer. Emphasize: test strategy, test cases, automation (Selenium, Cypress, Playwright), manual testing, regression testing, bug reporting, CI/CD integration, quality assurance processes.`,
  business_analysis: `You are helping a Business Analyst. Emphasize: requirements gathering, stakeholder management, process mapping, gap analysis, user stories, use cases, documentation, Agile/Scrum, business process improvement, data analysis.`,
  product_owner: `You are helping a Product Owner. Emphasize: backlog prioritization, user stories, acceptance criteria, sprint planning, stakeholder alignment, product vision, roadmap, Agile ceremonies, value delivery, cross-functional collaboration.`,
  product_manager: `You are helping a Product Manager. Emphasize: product strategy, roadmap, market research, user research, prioritization frameworks, metrics/KPIs, go-to-market, stakeholder management, product lifecycle, competitive analysis.`,
  project_manager: `You are helping a Project Manager. Emphasize: project planning, scope management, timelines, risk management, resource allocation, stakeholder communication, Agile/Waterfall, delivery, status reporting, PMP/PRINCE2 if relevant.`,
  dev: `You are helping a software developer. Emphasize: tech stack, architecture, scalability, code quality, delivery timeline, relevant frameworks and languages, problem-solving approach.`,
  devops: `You are helping a DevOps engineer. Emphasize: CI/CD pipelines, cloud (AWS/GCP/Azure), infrastructure as code (Terraform, etc.), containerization (Docker, Kubernetes), monitoring, reliability, automation.`,
};

export function buildSystemPrompt(category: string, tone?: string): string {
  const context = CATEGORY_CONTEXT[category] ?? CATEGORY_CONTEXT.dev;
  const toneGuide = tone ? ` ${TONE_GUIDANCE[tone] ?? TONE_GUIDANCE.formal}` : "";
  return `You are an expert Upwork proposal writer for tech freelancers. ${context}${toneGuide}

Your job is to analyze a job description and the freelancer's skills, then generate:
1. A compelling opening HOOK (1-2 sentences that grab attention and show you understand the client's pain)
2. CLIENT PAIN POINTS (3-5 bullet points showing you understand what they really need)
3. The main PROPOSAL (2-4 short paragraphs: relevant experience, how you'd approach the work, why you're the right fit)
4. A strong CALL-TO-ACTION (1-2 sentences inviting them to discuss next steps)

Rules:
- Be specific, not generic
- Match the client's language and tone
- Highlight skills that directly address their needs
- Keep it concise - Upwork proposals have character limits
- Sound human and professional, not robotic
- No fluff or filler`;
}

export function buildUserPrompt(
  jobDescription: string,
  skillsSummary: string,
  options?: { portfolioLinks?: string; variations?: boolean; maxChars?: number }
): string {
  let prompt = `JOB DESCRIPTION:\n${jobDescription}\n\nFREELANCER'S SKILLS/PROFILE:\n${skillsSummary}`;
  if (options?.portfolioLinks?.trim()) {
    prompt += `\n\nPORTFOLIO LINKS (mention if relevant):\n${options.portfolioLinks}`;
  }
  if (options?.maxChars && options.maxChars > 0) {
    prompt += `\n\nIMPORTANT: Keep the total proposal (hook + pain points + proposal + cta) under ${options.maxChars} characters. Upwork has strict limits.`;
  }
  if (options?.variations) {
    prompt += `\n\nGenerate TWO variations in this JSON format. Variation A: formal and professional. Variation B: conversational and friendly.
{
  "variations": [
    { "hook": "...", "pain_points": ["..."], "proposal": "...", "cta": "..." },
    { "hook": "...", "pain_points": ["..."], "proposal": "...", "cta": "..." }
  ],
  "match_score": 85,
  "important_keywords": ["..."],
  "missing_keywords": ["..."]
}`;
  } else {
    prompt += `\n\nGenerate the proposal in this exact JSON format:
{
  "hook": "opening hook here",
  "pain_points": ["point 1", "point 2", "point 3"],
  "proposal": "main proposal text here",
  "cta": "call to action here",
  "match_score": 85,
  "important_keywords": ["keyword1", "keyword2", "keyword3"],
  "missing_keywords": ["keyword not in proposal"]
}

For match_score: 0-100, how well the proposal matches the job (consider relevance, client needs, skills alignment).
For important_keywords: 5-10 key terms from the job that clients care about (skills, tools, requirements).
For missing_keywords: any important_keywords that are NOT clearly addressed in the proposal (can be empty array if all covered).`;
  }
  return prompt;
}

export function buildMatchScorePrompt(
  jobDescription: string,
  skillsSummary: string,
  category: string,
  portfolioLinks?: string
): string {
  const context = CATEGORY_CONTEXT[category] ?? CATEGORY_CONTEXT.dev;
  let prompt = `Analyze how well this freelancer's profile matches the job.\n\nJOB DESCRIPTION:\n${jobDescription}\n\nFREELANCER'S SKILLS/PROFILE:\n${skillsSummary}`;
  if (portfolioLinks?.trim()) {
    prompt += `\n\nPORTFOLIO: ${portfolioLinks}`;
  }
  prompt += `\n\nContext: ${context}

Return JSON only:
{
  "score": 78,
  "summary": "2-3 sentence summary of fit. What matches well, what might be gaps.",
  "fit": "strong" | "moderate" | "weak"
}

Score 0-100: How well does the freelancer's experience and skills align with the job requirements?
- 80-100: strong fit (key skills match, relevant experience)
- 50-79: moderate fit (some overlap, may need to highlight transferable skills)
- 0-49: weak fit (significant gaps, consider if worth applying)`;
  return prompt;
}

export function buildImprovePrompt(
  currentProposal: string,
  jobDescription: string,
  skillsSummary: string,
  feedback?: string
): string {
  let prompt = `CURRENT PROPOSAL (to improve):\n${currentProposal}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nFREELANCER'S SKILLS:\n${skillsSummary}`;
  if (feedback?.trim()) {
    prompt += `\n\nIMPROVEMENT REQUEST: ${feedback}`;
  } else {
    prompt += `\n\nImprove this proposal: make it stronger, more relevant, and more likely to win. Address any gaps.`;
  }
  prompt += `\n\nReturn the improved proposal in this JSON format:
{
  "hook": "improved hook",
  "pain_points": ["..."],
  "proposal": "improved proposal",
  "cta": "improved cta",
  "match_score": 90,
  "important_keywords": ["..."],
  "missing_keywords": ["..."]
}`;
  return prompt;
}
