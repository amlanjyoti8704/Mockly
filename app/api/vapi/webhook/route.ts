import { db } from "@/firebase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("FULL WEBHOOK BODY:", JSON.stringify(body, null, 2));

    const event = body.message;

    // We only care about tool calls
    if (event?.type !== "tool-call") {
      return Response.json({ ignored: true });
    }

    const userId = event?.assistant?.variableValues?.userid;

    const feedback = event?.toolCall?.arguments?.feedback;

    if (!userId || !feedback) {
      console.log("Missing tool data");
      return Response.json({ error: "Missing data" }, { status: 400 });
    }

    await db.collection("feedback").add({
      userId,
      feedback,
      createdAt: new Date().toISOString(),
    });

    console.log("Feedback saved successfully");

    return Response.json({ success: true });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Webhook failed" }, { status: 500 });
  }
}