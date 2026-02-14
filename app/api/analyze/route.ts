import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";

export async function POST(request: Request) {
  try {
    const { transcript, userId } = await request.json();

    if (!transcript || !userId) {
      return Response.json(
        { error: "Missing transcript or userId" },
        { status: 400 }
      );
    }

    // 🧠 Prevent unnecessary AI calls
    if (!Array.isArray(transcript) || transcript.length < 3) {
      return Response.json(
        { error: "Transcript too short for analysis" },
        { status: 400 }
      );
    }

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      maxRetries: 0,
      prompt: `
You are an interview performance evaluator.

Analyze this interview transcript:

${JSON.stringify(transcript)}

Return STRICTLY valid JSON.
Do NOT include markdown.
Do NOT include explanations.

Format:
{
  "strengths": ["point1", "point2"],
  "improvements": ["point1", "point2"],
  "communication": "short paragraph",
  "technicalScore": 7,
  "summary": "final evaluation paragraph"
}
`,
    });

    // 🔥 Clean AI response
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let feedback;

    try {
      feedback = JSON.parse(cleanText);
    } catch (err) {
      console.error("JSON Parse Error:", cleanText);

      return Response.json(
        { error: "AI returned invalid JSON" },
        { status: 500 }
      );
    }

    await db.collection("feedback").add({
      userId,
      feedback,
      createdAt: new Date().toISOString(),
    });

    return Response.json({ success: true });

  } catch (error: any) {
    console.error("ANALYZE ERROR:", error.message);

    // 🔥 Handle Gemini quota cleanly
    if (error.message?.includes("quota")) {
      return Response.json(
        { error: "AI quota exceeded. Please try again later." },
        { status: 200 } // prevent frontend crash
      );
    }

    return Response.json(
      { error: "Server error during analysis" },
      { status: 500 }
    );
  }
}