"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();

  const [callStatus, setCallStatus] = useState<CallStatus>(
    CallStatus.INACTIVE
  );
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  /* =========================
     VAPI EVENT LISTENERS
  ========================== */

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = async () => {
      setCallStatus(CallStatus.FINISHED);
      setIsGeneratingFeedback(true);

      // Give VAPI's saveInterviewResult tool time to POST to our webhook
      // and for our webhook to save the feedback to Firestore.
      // The tool fires at the end of the conversation before the call ends,
      // but there's a small network delay.
      await new Promise((resolve) => setTimeout(resolve, 5000));

      setIsGeneratingFeedback(false);
      router.push(`/summary/${userId}`);
    };

    const onMessage = (message: any) => {
      if (
        message.type === "transcript" &&
        message.transcriptType === "final"
      ) {
        const newMessage = {
          role: message.role,
          content: message.transcript,
        };

        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
    };
  }, [router, userId]);

  /* =========================
     START CALL
  ========================== */

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    try {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } catch (error) {
      console.error("Vapi start error:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    vapi.stop();
  };

  const latestMessage = messages[messages.length - 1]?.content;

  const isInactiveOrFinished =
    callStatus === CallStatus.INACTIVE ||
    callStatus === CallStatus.FINISHED;

  /* =========================
     UI
  ========================== */

  // Show a generating feedback overlay
  if (isGeneratingFeedback) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="feedback-loader" />
        <h3 className="text-2xl font-semibold text-white">
          Analyzing your interview...
        </h3>
        <p className="text-gray-400 text-center max-w-md">
          Our AI is reviewing your responses and generating detailed
          feedback. This usually takes a few seconds.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="call-view">
        {/* AI Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="AI"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user.png"
              alt="User"
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {latestMessage && (
        <div className="transcript-border">
          <div className="transcript">
            <p className="animate-fadeIn">{latestMessage}</p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="btn-call" onClick={handleCall}>
            {isInactiveOrFinished ? "Call" : "..."}
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;