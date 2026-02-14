import { db } from "@/firebase/admin";

interface PageProps {
  params: Promise<{ userId: string }>;
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
        <div className="p-10 text-center text-gray-500">
          No feedback found.
        </div>
      );
    }

    const feedback = snapshot.docs[0].data()?.feedback;

    if (!feedback) {
      return (
        <div className="p-10 text-center text-gray-500">
          Feedback exists but is malformed.
        </div>
      );
    }

    return (
      <div className="p-10 text-white">
        <h1 className="text-3xl font-bold mb-6">
          Interview Summary
        </h1>

        <pre className="bg-black p-6 rounded-lg overflow-auto">
          {JSON.stringify(feedback, null, 2)}
        </pre>
      </div>
    );

  } catch (error) {
    console.error("SUMMARY PAGE ERROR:", error);
    return (
      <div className="p-10 text-red-500">
        Something went wrong loading summary.
      </div>
    );
  }
}