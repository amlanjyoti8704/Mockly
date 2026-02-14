import { db } from "@/firebase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("VAPI WEBHOOK:", body);

    const transcript = body.messages;
    const userId = body.metadata?.userid;

    // 🔥 IMPORTANT:
    // The final assistant message should contain the JSON evaluation
    const finalMessage = transcript?.[transcript.length - 1]?.content;

    if (!userId || !finalMessage) {
      return Response.json({ error: "Missing data" }, { status: 400 });
    }

    let feedback;

    try {
      feedback = JSON.parse(finalMessage);
    } catch (err) {
      console.error("Invalid JSON from Vapi:", finalMessage);
      return Response.json({ error: "Invalid evaluation format" }, { status: 400 });
    }

    await db.collection("feedback").add({
      userId,
      feedback,
      createdAt: new Date().toISOString(),
    });

    return Response.json({ success: true });

  } catch (error: any) {
    console.error("Webhook error:", error.message);
    return Response.json({ error: "Webhook failed" }, { status: 500 });
  }
}