import { NextRequest, NextResponse } from "next/server";
const BACKEND_API_URL = process.env.API_URL || "http://localhost:3001";

export async function GET(
    req: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const { sessionId } = params;
        console.log("Fetching history for sessionId:", sessionId);

        const response = await fetch(
            `${BACKEND_API_URL}/chat/sessions/${sessionId}/history`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
        );
        if (!response.ok) {
            const error = await response.json();
            console.error("Error fetching session history:", error);
            return NextResponse.json(
                { error: error.error || "Failed to fetch session history" },
                { status: response.status }
            );
        }

        const data = await response.json();
        const formattedMessages = data.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
        }));
        return NextResponse.json(formattedMessages, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Error fetching session history" }, { status: 500 });
    }
}