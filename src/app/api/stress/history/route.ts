import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    const url = new URL(request.url);
    const queryParams = url.searchParams.toString();

    const response = await fetch(
      `${BACKEND_URL}/api/stress/history${queryParams ? `?${queryParams}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying stress history request:", error);
    return NextResponse.json(
      { error: "Failed to fetch stress history" },
      { status: 500 }
    );
  }
}

