import {generateText} from 'ai'
import { google } from '@ai-sdk/google'
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function GET(){
    return Response.json({success: true, data: 'THANK YOU'}, {status:200})
}

export async function POST(request: Request){
    const { type, role, level, techstack, amount, userid }=await request.json();
    try{
        const baseQuestions = [
            `Can you briefly introduce yourself and describe your experience relevant to the ${role} role?`,
            `What projects have you worked on using ${techstack}, and what was your specific contribution?`,
            `Explain a key ${type} concept related to ${techstack} at ${level} level.`,
            `Can you explain a challenging technical problem you faced and how you solved it?`
        ];

        const questions = JSON.stringify(
            Array.from({ length: Number(amount) }, (_, i) =>
                `${baseQuestions[i % baseQuestions.length]} Question ${i + 1}`
            )
        );

        console.log("RAW QUESTIONS:", questions);

        const interview = {
            role: role,
            type: type,
            level: level,
            techstack: techstack.split(","),
            questions: JSON.parse(questions),
            userId: userid,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
        };

        await db.collection("interviews").add(interview);

        return Response.json({ success: true }, { status: 200 });

    }catch(error){
        console.error(error);
        return Response.json({success: false, error}, {status: 500})
    }
}