"use client";

import { useEffect, useMemo, useState } from "react";
import { getDailyCheckinHistory } from "@/lib/api/stress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type MoodPoint = {
  timestamp: string;
  score: number;
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export function MoodTrend() {
  const [data, setData] = useState<MoodPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    point: MoodPoint;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch mood scores from daily check-ins (stress surveys) instead of mood tracking entries
        const res = await getDailyCheckinHistory({ limit: 14 });
        const points = res.data
          .map((d: any) => ({
            timestamp: d.timestamp,
            score: d.score, // Combined mood score (0-100) from stress surveys
          }))
          .filter((point: MoodPoint) => point.score != null && !isNaN(point.score)) // Ensure valid mood scores
          .reverse(); // oldest first for graph
        setData(points);
      } catch (err: any) {
        setError(err.message || "Failed to load mood score history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const svgPoints = useMemo(() => {
    if (!data.length) return "";
    const width = 260;
    const height = 120;
    const maxScore = 100;
    const step = width / Math.max(data.length - 1, 1);
    return data
      .map((point, idx) => {
        const x = idx * step;
        const y = height - (point.score / maxScore) * height;
        return `${x},${y}`;
      })
      .join(" ");
  }, [data]);

  return (
    <Card className="border-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mood Trend</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading mood score history...
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No mood scores yet. Complete daily check-ins to see your mood score trend.
          </p>
        ) : (
          <>
            <div className="w-full overflow-visible rounded-lg border border-border/40 py-6 px-3 bg-card/50 cursor-pointer relative">
              <svg viewBox="0 0 260 120" className="w-full h-28 cursor-pointer">
                <defs>
                  <linearGradient id="moodArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  fill="url(#moodArea)"
                  stroke="none"
                  points={`0,120 ${svgPoints} 260,120`}
                />
                <polyline
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  points={svgPoints}
                />
                {data.map((point, idx) => {
                  const width = 260;
                  const height = 120;
                  const step = width / Math.max(data.length - 1, 1);
                  const x = idx * step;
                  const y = height - (point.score / 100) * height;
                  return (
                    <circle
                      key={point.timestamp}
                      cx={x}
                      cy={y}
                      r={3.5}
                      fill="var(--card-foreground)"
                      stroke="var(--primary)"
                      strokeWidth="2"
                      onMouseEnter={() => setHover({ x, y, point })}
                      onMouseLeave={() => setHover(null)}
                    >
                      <title>{`${formatDateTime(point.timestamp)} • Mood Score: ${point.score}`}</title>
                    </circle>
                  );
                })}
              </svg>
              {hover && (
                <div
                  className="pointer-events-none absolute z-10 rounded-md border bg-popover px-2 py-1 text-[11px] shadow-md"
                  style={{
                    left: `${(hover.x / 260) * 100}%`,
                    top: `${(hover.y / 120) * 100}%`,
                    transform: "translate(-50%, -120%)",
                  }}
                >
                  <div className="font-medium">
                    Mood Score: {hover.point.score}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {formatDateTime(hover.point.timestamp)}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Oldest</span>
              <span>Newest</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

