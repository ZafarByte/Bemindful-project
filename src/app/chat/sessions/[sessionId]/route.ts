import { NextRequest,NextResponse } from "next/server";
const BACKEND_API_URL = process.env.API_URL || "http://localhost:3001";

export async function GET(
    req: NextRequest,
    { params }: { params: { sessionId: string } })
    {
        try {
            const {sessionId} = params;
            const response = await fetch(`${BACKEND_API_URL}/chat/sessions/${sessionId}/history`);
            if(!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return NextResponse.json(data, { status: 200 });

        } catch (error) {
            console.error("Error fetching session history:", error);
            return NextResponse.json({ message: "Error fetching session history" }, { status: 500 });
        }

}

export async function POST(
    req: NextRequest,
    {params}:{params:{sessionId:string}}
){
    try {
        const {sessionId} = params;
        const {message}=await req.json();
        if(!message){
            return NextResponse.json(
                {message:"Message is required"}, 
                {status:400}
            );
        }
        const response = await fetch(
            `${BACKEND_API_URL}/chat/sessions/${sessionId}/messages`,
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({message}),
        }
    );
    if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);

    } catch (error) {
        console.error("Error sending chat API:", error);
        return NextResponse.json(
            { message: "Error sending chat message" },
             { status: 500 }
     );
    }
}