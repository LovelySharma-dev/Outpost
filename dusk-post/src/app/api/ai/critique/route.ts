import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  essayText: z.string().trim().min(20, "Write at least a few sentences before asking the coach.").max(8000),
  scholarshipTitle: z.string().trim().min(2).max(160),
});

const critiqueSchema = z.object({
  strengths: z.array(z.string().min(1)).min(1).max(4),
  improvements: z.array(z.string().min(1)).min(1).max(4),
  score: z.number().min(0).max(100),
});

const simulated = {
  strengths: [
    "Clear demonstration of leadership in community tech.",
    "Strong alignment with the core prompt.",
  ],
  improvements: ["Quantify impact (for example, students mentored).", "Tighten the conclusion."],
  score: 88,
  mode: "simulation" as const,
};

const fallback = {
  strengths: ["Compelling personal voice and a clear career roadmap."],
  improvements: ["Add one concrete project with a result you can count."],
  score: 85,
  mode: "fallback" as const,
};

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("no json");
  return JSON.parse(raw.slice(start, end + 1)) as unknown;
}

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "The draft is not ready." },
        { status: 400 },
      );
    }

    const { essayText, scholarshipTitle } = parsed.data;
    const apiKey = process.env.GEMINI_API_KEY || process.env.gemini_API;
    if (!apiKey) return NextResponse.json(simulated);

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        cache: "no-store",
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this student essay for "${scholarshipTitle}". Return JSON with strengths (1-3 short strings), improvements (1-3 short strings), and score (0-100).\n\n${essayText}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 512,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
    );

    if (!res.ok) return NextResponse.json(fallback);
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const critique = critiqueSchema.parse(extractJson(text));
    return NextResponse.json({ ...critique, mode: "live" });
  } catch {
    return NextResponse.json(fallback);
  }
}
