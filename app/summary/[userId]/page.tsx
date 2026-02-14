import { db } from "@/firebase/admin";

interface PageProps {
  params: Promise<{ userId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { userId } = await params; // 🔥 REQUIRED in Next 15+

  const snapshot = await db
    .collection("feedback")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) {
    return (
      <div className="p-10 text-center text-gray-500">
        No feedback found.
      </div>
    );
  }

  const feedback = snapshot.docs[0].data().feedback;

  const strengths = feedback?.strengths ?? [];
  const improvements = feedback?.improvements ?? [];
  const communication = feedback?.communication ?? "";
  const summary = feedback?.summary ?? "";
  const technicalScore = Number(feedback?.technicalScore ?? 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold">Interview Performance Report</h1>

        <p>Technical Score: {technicalScore}/10</p>

        <h2>Strengths</h2>
        <ul>
          {strengths.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>Areas of Improvement</h2>
        <ul>
          {improvements.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>Communication</h2>
        <p>{communication}</p>

        <h2>Summary</h2>
        <p>{summary}</p>
      </div>
    </div>
  );
};

export default Page;