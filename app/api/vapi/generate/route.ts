import {generateText} from 'ai'
import { google } from '@ai-sdk/google'
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function GET(){
    return Response.json({success: true, data: 'THANK YOU'}, {status:200})
}
let lastRequestTime = 0;
export async function POST(request: Request) {
    const { type, role, level, techstack, amount, userid } = await request.json();

    const now = Date.now();

    if (now - lastRequestTime < 15000) {
        return Response.json(
        { success: false, error: "Too many requests. Please wait." },
        { status: 429 }
        );
    }

    lastRequestTime = now;

    try {
        const { text:questions } = await generateText({
            // Use this EXACT string. 'gemini-1.5-flash-latest' is the 
            // most reliable way to hit the current free tier v1beta endpoint.
            model: google("gemini-2.5-flash"),
            prompt: `Prepare interview questions for a job.
            The job role is: ${role}
            The experience level is: ${level}
            The tech stack is: ${techstack}
            The interview focus (Behavioural/Technical/Mixed): ${type}
            Total questions required: ${amount}

            CRITICAL VOICE GUIDELINES:
            1. These questions will be read by a voice assistant (Vapi). 
            2. DO NOT use special characters like "/", "*", "#", "_", or "---".
            3. Write out symbols as words if necessary (e.g., use "and" instead of "&").
            4. Keep the language natural and conversational for a phone call.
            5. Return ONLY a plain JSON array of strings. Do not include markdown code blocks or additional text.
            Example: ["First question here?", "Second question here?"]`,
            // Set maxRetries to 0 so we see the REAL error immediately 
            // instead of waiting 64 seconds for a timeout.
            maxRetries: 0, 
        });

        // Parse and save
        // const cleanText = text.replace(/```json|```/g, "").trim();
        // const questionsArray = JSON.parse(cleanText);

        const interview = {
            role, type, level,
            techstack: techstack.split(","),
            // questions: questionsArray,
            questions: JSON.parse(questions),
            userId: userid,
            finalized: true,
            source: "AI",
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
        };

        await db.collection("interviews").add(interview);
        return Response.json({ success: true, source: "AI" }, { status: 200 });

    } catch (error: any) {
        // Log the exact error to your terminal so we can see the real culprit
        console.error("CRITICAL AI FAILURE:", error.message);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}