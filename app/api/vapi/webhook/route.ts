import { db } from "@/firebase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("FULL WEBHOOK BODY:", JSON.stringify(body, null, 2));

    const message = body?.message;
    const messages = message?.messages;

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ ignored: true });
    }

    // Find the assistant message that contains tool_calls
    const toolMessage = messages.find(
      (msg: any) => msg.tool_calls && msg.tool_calls.length > 0
    );

    if (!toolMessage) {
      return Response.json({ ignored: true });
    }

    const toolCall = toolMessage.tool_calls[0];

    if (!toolCall?.function?.arguments) {
      return Response.json({ ignored: true });
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    const feedback = parsed.feedback;

    const userId =
      body?.message?.assistant?.variableValues?.userid;

    if (!userId || !feedback) {
      return Response.json({ error: "Missing data" }, { status: 400 });
    }

    await db.collection("feedback").add({
      userId,
      feedback,
      createdAt: new Date().toISOString(),
    });

    console.log("🔥 Feedback saved successfully");

    return Response.json({ success: true });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Webhook failed" }, { status: 500 });
  }
}