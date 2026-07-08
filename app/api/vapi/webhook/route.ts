import { db } from "@/firebase/admin";

export async function GET() {
  return Response.json({ success: true }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("WEBHOOK RECEIVED:", JSON.stringify(body, null, 2));

    let feedback: any = null;
    let userId: string | null = null;

    // ──────────────────────────────────────────────
    // FORMAT 1: Direct VAPI tool API Request
    // Body shape: { message: { type: "tool-calls", toolCallList: [...], ... } }
    // The tool arguments contain the feedback object.
    // ──────────────────────────────────────────────
    if (body?.message?.type === "tool-calls") {
      const toolCallList = body.message.toolCallList;

      if (Array.isArray(toolCallList) && toolCallList.length > 0) {
        const toolCall = toolCallList[0];
        const args = toolCall?.function?.arguments;

        if (typeof args === "string") {
          try {
            const parsed = JSON.parse(args);
            feedback = parsed.feedback ?? parsed;
          } catch {
            feedback = null;
          }
        } else if (typeof args === "object") {
          feedback = args.feedback ?? args;
        }
      }

      // userId from assistant variable values
      userId =
        body.message?.call?.assistantOverrides?.variableValues?.userid ??
        body.message?.call?.assistant?.variableValues?.userid ??
        null;
    }

    // ──────────────────────────────────────────────
    // FORMAT 2: End-of-call report
    // Body shape: { message: { type: "end-of-call-report", messages: [...], ... } }
    // ──────────────────────────────────────────────
    if (!feedback && body?.message?.type === "end-of-call-report") {
      const messages = body.message.messages;

      if (Array.isArray(messages)) {
        const toolMessage = messages.find(
          (msg: any) => msg.tool_calls && msg.tool_calls.length > 0
        );

        if (toolMessage) {
          const toolCall = toolMessage.tool_calls[0];
          if (toolCall?.function?.arguments) {
            try {
              const parsed =
                typeof toolCall.function.arguments === "string"
                  ? JSON.parse(toolCall.function.arguments)
                  : toolCall.function.arguments;
              feedback = parsed.feedback ?? parsed;
            } catch {
              feedback = null;
            }
          }
        }
      }

      userId =
        body.message?.call?.assistantOverrides?.variableValues?.userid ??
        body.message?.assistant?.variableValues?.userid ??
        null;
    }

    // ──────────────────────────────────────────────
    // FORMAT 3: Structured output / analysis data
    // Body shape: { message: { type: "end-of-call-report", analysis: { structuredData: { ... } } } }
    // ──────────────────────────────────────────────
    if (!feedback && body?.message?.analysis?.structuredData) {
      const structured = body.message.analysis.structuredData;
      feedback = structured.feedback ?? structured;

      userId =
        body.message?.call?.assistantOverrides?.variableValues?.userid ??
        body.message?.assistant?.variableValues?.userid ??
        null;
    }

    // ──────────────────────────────────────────────
    // FORMAT 4: Flat body (simple tool request body)
    // Body shape: { feedback: { ... } }
    // ──────────────────────────────────────────────
    if (!feedback && body?.feedback) {
      feedback = body.feedback;
      // In this format, userId might not be available in the body.
      // Try to extract from any available field.
      userId = body.userid ?? body.userId ?? null;
    }

    // ──────────────────────────────────────────────
    // Validate and save
    // ──────────────────────────────────────────────
    if (!feedback) {
      console.log("No feedback found in webhook body, ignoring.");
      return Response.json({ ignored: true });
    }

    // If feedback is a string (e.g., from structured output), try to parse it
    if (typeof feedback === "string") {
      try {
        feedback = JSON.parse(feedback);
      } catch {
        console.error("Failed to parse feedback string:", feedback);
        return Response.json(
          { error: "Invalid feedback format" },
          { status: 400 }
        );
      }
    }

    if (!userId) {
      console.warn(
        "No userId found in webhook body. Saving feedback without userId."
      );
    }

    const feedbackDoc: Record<string, any> = {
      feedback,
      createdAt: new Date().toISOString(),
    };

    if (userId) {
      feedbackDoc.userId = userId;
    }

    await db.collection("feedback").add(feedbackDoc);

    console.log("🔥 Feedback saved successfully for user:", userId);

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error.message || error);
    return Response.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}