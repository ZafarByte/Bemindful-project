import { NextRequest,NextResponse } from "next/server";

const BACKEND_API_URL = process.env.API_URL || "http://localhost:3001";

export  async function POST(req: NextRequest){
    try {
        const authHeader = req.headers.get("Authorization");
        if(!authHeader){
            return NextResponse.json({ message: "Authorization header missing" }, { status: 401 });
        }
        const response = await fetch(`${BACKEND_API_URL}/chat/sessions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader,
            },
        });
        if(!response.ok){
            const error = await response.json();
            console.error("Error creating chat session:", error);
            return NextResponse.json(
                { message: "Failed to create chat session", error },
                 { status: response.status }
                );
        }
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Error creating chat session:", error);
        return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 });
    }
}