import { db } from "@/firebase/admin";
import Link from "next/link";

interface PageProps {
  params: Promise<{ userId: string }>;
}

function getVerdict(score: number): string {
  if (score >= 80) return "Excellent Performance";
  if (score >= 60) return "Good Performance";
  if (score >= 40) return "Average Performance";
  return "Needs Improvement";
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#49de50";
  if (score >= 60) return "#cac5fe";
  if (score >= 40) return "#f5a623";
  return "#f75353";
}

export default async function Page({ params }: PageProps) {
  try {
    const { userId } = await params;

    const snapshot = await db
      .collection("feedback")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <h2 className="text-2xl font-semibold text-white">
            No feedback found
          </h2>
          <p className="text-gray-400 text-center max-w-md">
            It looks like your interview feedback hasn&apos;t been generated
            yet. Try completing an interview first.
          </p>
          <Link
            href="/"
            className="btn-primary mt-4 inline-flex items-center px-6 py-3"
          >
            Back to Home
          </Link>
        </div>
      );
    }

    const doc = snapshot.docs[0].data();

    // VAPI saves: { userId, feedback: { strengths, improvements, communication, technicalScore, summary }, createdAt }
    const feedbackData = doc.feedback ?? doc;

    const strengths: string[] = feedbackData.strengths ?? [];
    const improvements: string[] = feedbackData.improvements ?? [];
    const communication: string = feedbackData.communication ?? "";
    const technicalScore: number = feedbackData.technicalScore ?? 0;
    const summary: string = feedbackData.summary ?? "";

    const circumference = 2 * Math.PI * 58;
    const offset =
      circumference - (technicalScore / 100) * circumference;
    const scoreColor = getScoreColor(technicalScore);

    return (
      <div className="feedback-container py-10 px-4">
        {/* Header */}
        <div className="feedback-header">
          <h1>Interview Feedback</h1>
          <p>
            Here&apos;s a detailed breakdown of your interview
            performance
          </p>
        </div>

        {/* Technical Score */}
        <div className="score-hero">
          <div className="score-ring">
            <svg viewBox="0 0 128 128">
              <circle
                className="score-ring-bg"
                cx="64"
                cy="64"
                r="58"
              />
              <circle
                className="score-ring-fill"
                cx="64"
                cy="64"
                r="58"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ stroke: scoreColor }}
              />
            </svg>
            <div className="score-ring-text">
              <span className="score-number">{technicalScore}</span>
              <span className="score-label">out of 100</span>
            </div>
          </div>
          <span className="score-verdict">
            {getVerdict(technicalScore)}
          </span>
        </div>

        {/* Communication Skills */}
        {communication && (
          <div className="final-assessment">
            <h3>💬 Communication Skills</h3>
            <p>{communication}</p>
          </div>
        )}

        {/* Strengths & Areas for Improvement */}
        <div className="feedback-lists">
          {strengths.length > 0 && (
            <div className="feedback-list-card strengths">
              <h3>✅ Strengths</h3>
              <ul>
                {strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {improvements.length > 0 && (
            <div className="feedback-list-card improvements">
              <h3>🔧 Areas for Improvement</h3>
              <ul>
                {improvements.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Overall Summary */}
        {summary && (
          <div className="final-assessment">
            <h3>📋 Overall Summary</h3>
            <p>{summary}</p>
          </div>
        )}

        {/* Actions */}
        <div className="feedback-actions">
          <Link
            href="/"
            className="btn-primary inline-flex items-center px-8 py-3"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error("SUMMARY PAGE ERROR:", error);
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <h2 className="text-xl font-semibold text-red-400">
          Something went wrong
        </h2>
        <p className="text-gray-400">
          We couldn&apos;t load your feedback. Please try again.
        </p>
        <Link
          href="/"
          className="btn-primary mt-4 inline-flex items-center px-6 py-3"
        >
          Back to Home
        </Link>
      </div>
    );
  }
}