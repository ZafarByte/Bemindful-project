export type SliderAnswer = Record<string, number>;

const withAuth = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function submitBaseline(answers: SliderAnswer) {
  const res = await fetch("/api/stress/baseline", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(),
    },
    body: JSON.stringify({ answers }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to submit baseline");
  }
  return data as { baselineScore: number; success: boolean };
}

export async function submitDaily(answers: SliderAnswer) {
  const res = await fetch("/api/stress/daily", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(),
    },
    body: JSON.stringify({ answers }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to submit daily check-in");
  }
  return data as {
    dailyScore: number;
    combinedScore: number;
    label: string;
    baselineScore: number;
    success: boolean;
  };
}

export async function fetchStressSummary() {
  const res = await fetch("/api/stress/summary", {
    headers: {
      "Content-Type": "application/json",
      ...withAuth(),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to fetch summary");
  }
  return data as {
    hasBaseline: boolean;
    baselineScore: number | null;
    baselineCompletedAt: string | null;
    latestDaily: {
      dailyScore: number;
      combinedScore: number;
      label: string;
      createdAt: string;
    } | null;
  };
}

export async function getDailyCheckinHistory(params?: {
  limit?: number;
}): Promise<{ success: boolean; data: Array<{ timestamp: string; score: number; dailyScore: number }> }> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const res = await fetch(`/api/stress/history?${queryParams.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...withAuth(),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to fetch daily check-in history");
  }
  return data;
}

