"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Sparkles, MessageSquare, ArrowRight, BrainCircuit, Heart, Activity as ActivityIcon, Brain, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "../../../lib/context/session-context";
import { AnxietyGames } from "../../../components/games/anxiety-games";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { MoodForm } from "../../../components/mood/mood-form";
import { ActivityLogger } from "../../../components/activities/activity-logger";
import { StressSurveyModal } from "@/components/stress/stress-survey";
import { fetchStressSummary, submitBaseline, submitDaily } from "@/lib/api/stress";
import { logActivity as logActivityApi } from "@/lib/api/activity";
import { combinedScore as combineScores, labelScore } from "@/lib/stress-questions";
import { MoodTrend } from "@/components/mood/mood-trend";

interface DailyStats {
    moodScore: number | null;
    completionRate: number;
    mindfulnessCount: number;
    totalActivities: number;
    lastUpdated: Date;
}

// renamed to avoid collision with Activity icon import
interface ActivityItem {
    id: string;
    userId: string | null;
    type: string;
    name: string;
    description: string | null;
    timestamp: Date;
    duration: number | null;
    completed: boolean;
    moodScore: number | null;
    moodNote: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface StressSummary {
    hasBaseline: boolean;
    baselineScore: number | null;
    baselineCompletedAt: string | null;
    latestDaily: {
        dailyScore: number;
        combinedScore: number;
        label: string;
        createdAt: string;
    } | null;
}

export default function DashboardPage() {
    const { checkSession } = useSession();
     const {isAuthenticated,logout,user} = useSession();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showMoodModal, setShowMoodModal] = useState(false);
    const router = useRouter();
    const [showActivityLogger, setShowActivityLogger] = useState(false);
    const [stressSummary, setStressSummary] = useState<StressSummary | null>(null);
    const [loadingStress, setLoadingStress] = useState(true);
    const [showBaselineModal, setShowBaselineModal] = useState(false);
    const [showDailyModal, setShowDailyModal] = useState(false);
    const [journalEntry, setJournalEntry] = useState("");
    const [journalPrompt, setJournalPrompt] = useState<string>("Write one thing that felt heavy today, and one small thing that helped.");
    const [isSavingJournal, setIsSavingJournal] = useState(false);

    const isToday = (isoDate: string | null | undefined) => {
        if (!isoDate) return false;
        const target = new Date(isoDate);
        const now = new Date();
        return (
            target.getFullYear() === now.getFullYear() &&
            target.getMonth() === now.getMonth() &&
            target.getDate() === now.getDate()
        );
    };

    useEffect(() => {
        const loadStress = async () => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (!token) {
                setLoadingStress(false);
                return;
            }
            try {
                const summary = await fetchStressSummary();
                setStressSummary(summary);
                if (!summary.hasBaseline) {
                    setShowBaselineModal(true);
                } else if (!isToday(summary.latestDaily?.createdAt ?? null)) {
                    setShowDailyModal(true);
                }
            } catch (error) {
                console.error("Failed to load stress summary", error);
            } finally {
                setLoadingStress(false);
            }
        };

        loadStress();
    }, []);
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    const [isSavingMood, setIsSavingMood] = useState(false);

    const combinedValue = stressSummary?.latestDaily?.combinedScore ?? null;
    const baselineScore = stressSummary?.baselineScore ?? null;
    const dailyScore = stressSummary?.latestDaily?.dailyScore ?? null;
    const stressLabel =
        stressSummary?.latestDaily?.label ??
        (stressSummary?.hasBaseline ? "Baseline captured" : "Baseline needed");
    const resolvedMoodScore = combinedValue ?? dailyScore ?? baselineScore ?? null;

    const wellnessStats = useMemo(() => {
        const moodValue =
            combinedValue !== null
                ? `${Math.round(combinedValue * 100)}%`
                : dailyScore !== null
                ? `${Math.round(dailyScore * 100)}%`
                : baselineScore !== null
                ? `${Math.round(baselineScore * 100)}%`
                : "No data";

        return [
            {
                title: "Mood Score",
                value: moodValue,
                icon: Brain,
                color: "text-purple-500",
                bgColor: "bg-purple-500/10",
                description: "Blended baseline + today",
            },
            {
                title: "Completion Rate",
                value: stressSummary?.latestDaily ? "100%" : "0%",
                icon: Trophy,
                color: "text-yellow-500",
                bgColor: "bg-yellow-500/10",
                description: "Daily check-in completion",
            },
            {
                title: "Therapy Sessions",
                value: "0 sessions",
                icon: Heart,
                color: "text-rose-500",
                bgColor: "bg-rose-500/10",
                description: "Total sessions completed",
            },
            {
                title: "Total Activities",
                value: "0",
                icon: ActivityIcon,
                color: "text-blue-500",
                bgColor: "bg-blue-500/10",
                description: "Planned for today",
            },
        ] as {
            title: string;
            value: string;
            icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
            color: string;
            bgColor: string;
            description: string;
        }[];
    }, [baselineScore, combinedValue, dailyScore, stressSummary?.latestDaily]);

    const [dailyStats, setDailyStats] = useState<DailyStats>({
        moodScore: null,
        completionRate: 100,
        mindfulnessCount: 0,
        totalActivities: 0,
        lastUpdated: new Date(),
    });

    // removed insights state as it wasn't used; re-add if you plan to show it
    // const [insights, setInsights] = useState<...>([]);

    const handleMoodSubmit = async (data: { moodScore: number }) => {
        setIsSavingMood(true);
        try {
            // TODO: actually save mood to your backend/storage here
            setShowMoodModal(false);
        } catch (error) {
            console.error("Error saving mood:", error);
        } finally {
            setIsSavingMood(false);
        }
    };

    const handleAICheckIn = () => {
        setShowActivityLogger(true);
    };
   const handleStartTherapy = async () => {
  try {
    console.log("Attempting client navigation to /therapy/new");
    await router.push("/therapy/new");
    console.log("router.push resolved — check URL and page render");
  } catch (err) {
    console.error("router.push threw:", err);
    // fallback: force a full page load
    window.location.href = "/therapy/new";
  }
};

    const handleBaselineSubmit = async (payload: { answers: Record<string, number>; baselineScore?: number }) => {
        try {
            const res = await submitBaseline(payload.answers);
            const updated: StressSummary = {
                hasBaseline: true,
                baselineScore: res.baselineScore,
                baselineCompletedAt: new Date().toISOString(),
                latestDaily: null,
            };
            setStressSummary(updated);
            setShowBaselineModal(false);
            setShowDailyModal(true);
        } catch (error) {
            console.error("Failed to save baseline", error);
        }
    };

    const handleDailySubmit = async (payload: { answers: Record<string, number>; dailyScore?: number }) => {
        try {
            if (!stressSummary?.baselineScore && stressSummary?.baselineScore !== 0) {
                setShowBaselineModal(true);
                return;
            }
            const res = await submitDaily(payload.answers);
            const combined =
                res.combinedScore ??
                combineScores(stressSummary.baselineScore ?? 0, payload.dailyScore ?? 0);
            const label = res.label ?? labelScore(combined);
            const updated: StressSummary = {
                hasBaseline: true,
                baselineScore: res.baselineScore ?? stressSummary.baselineScore ?? 0,
                baselineCompletedAt: stressSummary.baselineCompletedAt,
                latestDaily: {
                    dailyScore: res.dailyScore,
                    combinedScore: combined,
                    label,
                    createdAt: new Date().toISOString(),
                },
            };
            setStressSummary(updated);
            setShowDailyModal(false);
        } catch (error) {
            console.error("Failed to save daily check-in", error);
        }
    };

    const lastMoodLoggedAt =
        stressSummary?.latestDaily?.createdAt ?? stressSummary?.baselineCompletedAt ?? null;

    return (
        <div className="min-h-screen bg-background p-8">
            <Container className="pt-20 pb-8 space-y-6">
                <div className="flex flex-col gap-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                    >
                        <h1 className="text-3xl font-bold">
                            Welcome back, {user?.name || "there"}
                        </h1>
                        <p className="text-muted-foreground text-sm ">
                            {currentTime.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </motion.div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                        <Card className="border-primary/10">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Stress & Mood</CardTitle>
                                        <CardDescription>
                                            {stressSummary?.hasBaseline
                                                ? "Baseline ready"
                                                : "Complete baseline to personalize"}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <p className="text-xl font-semibold">{stressLabel}</p>
                                    </div>
                                    {combinedValue !== null && (
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Combined</p>
                                            <p className="text-2xl font-bold">
                                                {Math.round(combinedValue * 100)}%
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="rounded-lg border border-border/60 p-2">
                                        <p className="text-muted-foreground">Baseline</p>
                                        <p className="font-semibold">
                                            {baselineScore !== null
                                                ? `${Math.round(baselineScore * 100)}%`
                                                : "Pending"}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-border/60 p-2">
                                        <p className="text-muted-foreground">Today</p>
                                        <p className="font-semibold">
                                            {dailyScore !== null
                                                ? `${Math.round(dailyScore * 100)}%`
                                                : "Not logged"}
                                        </p>
                                    </div>
                                </div>
                                {lastMoodLoggedAt && (
                                    <p className="text-xs text-muted-foreground">
                                        Last mood score logged:{" "}
                                        {format(new Date(lastMoodLoggedAt), "MMM d, yyyy · h:mm a")}
                                    </p>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1"
                                        variant="outline"
                                        onClick={() => setShowBaselineModal(true)}
                                    >
                                        Baseline
                                    </Button>
                                    <Button className="flex-1" onClick={() => setShowDailyModal(true)}>
                                        Daily
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        <MoodTrend />
                        <Card className="border-primary/10">
                            <CardHeader>
                                <CardTitle>Journaling</CardTitle>
                                <CardDescription>
                                    {journalPrompt}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span>Capture how you feel in your own words.</span>
                                    <Button
                                        variant="ghost"
                                        size="xs"
                                        onClick={() => {
                                            const prompts = [
                                                "Write about one thing that is worrying you right now.",
                                                "List three things you&apos;re grateful for today.",
                                                "Describe how your body feels when you&apos;re stressed.",
                                                "What is one kind thing you can say to yourself right now?",
                                                "If your best friend felt like you do, what would you tell them?",
                                            ];
                                            const next =
                                                prompts[Math.floor(Math.random() * prompts.length)];
                                            setJournalPrompt(next);
                                        }}
                                    >
                                        New prompt
                                    </Button>
                                </div>
                                <textarea
                                    className="w-full min-h-[140px] rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Write a few thoughts to lighten the load..."
                                    value={journalEntry}
                                    onChange={(e) => setJournalEntry(e.target.value)}
                                />
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                                        <span>Need a break?</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="xs"
                                            onClick={() => {
                                                if (typeof window === "undefined") return;
                                                const el = document.getElementById("anxiety-games");
                                                el?.scrollIntoView({ behavior: "smooth", block: "start" });
                                            }}
                                        >
                                            Try a breathing exercise
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="xs"
                                            onClick={() => {
                                                if (typeof window === "undefined") return;
                                                const el = document.getElementById("anxiety-games");
                                                el?.scrollIntoView({ behavior: "smooth", block: "start" });
                                            }}
                                        >
                                            Listen to ocean waves
                                        </Button>
                                    </div>
                                    <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={async () => {
                                            if (!journalEntry.trim() || isSavingJournal) return;
                                            try {
                                                setIsSavingJournal(true);
                                                await logActivityApi({
                                                    type: "journaling",
                                                    name: "Journal entry",
                                                    description: journalEntry.trim(),
                                                });
                                                setJournalEntry("");
                                                alert("Journal entry saved");
                                            } catch (error) {
                                                console.error("Failed to save journal entry", error);
                                                alert("Could not save your note. Please try again.");
                                            } finally {
                                                setIsSavingJournal(false);
                                            }
                                        }}
                                        disabled={!journalEntry.trim() || isSavingJournal}
                                    >
                                        {isSavingJournal ? "Saving..." : "Save note"}
                                    </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-primary/10 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
                            <CardContent className="p-6 relative">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Quick Actions</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Start your wellness journey
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-3">
                                        <Button
                                            variant="default"
                                            className={cn(
                                                "w-full justify-between items-center p-6 h-auto group/button",
                                                "bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90",
                                                "transition-all duration-200 group-hover:translate-y-[-2px]"
                                            )}
                                            onClick={handleStartTherapy}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                    <MessageSquare className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-semibold text-white">
                                                        Start Therapy
                                                    </div>
                                                    <div className="text-xs text-white/80">
                                                        Begin a new session
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover/button:opacity-100 transition-opacity">
                                                <ArrowRight className="w-5 h-5 text-white" />
                                            </div>
                                        </Button>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "flex flex-col h-[120px] px-4 py-3 group/mood hover:border-primary/50",
                                                    "justify-center items-center text-center",
                                                    "transition-all duration-200 group-hover:translate-y-[-2px]"
                                                )}
                                                onClick={() => setShowMoodModal(true)}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
                                                    <motion.div
                                                        animate={{
                                                            scale: [1, 1.2, 1],
                                                        }}
                                                        transition={{
                                                            duration: 0.9,
                                                            repeat: Infinity,
                                                            ease: "easeInOut",
                                                        }}
                                                    >
                                                        <Heart className="w-5 h-5 text-rose-500" />
                                                    </motion.div>
                                                </div>

                                                <div>
                                                    <div className="font-medium text-sm">Track Mood</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        How are you feeling?
                                                    </div>
                                                </div>
                                            </Button>

                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "flex flex-col h-[120px] px-4 py-3 group/ai hover:border-primary/50",
                                                    "justify-center items-center text-center",
                                                    "transition-all duration-200 group-hover:translate-y-[-2px]"
                                                )}
                                                onClick={handleAICheckIn}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                                                    <BrainCircuit className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">Check-in</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        Quick wellness check
                                                    </div>
                                                </div>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-primary/10">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Today's Overview</CardTitle>
                                        <CardDescription>
                                            Your wellness metrics for{" "}
                                            {format(new Date(), "MMMM d, yyyy")}
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                    >
                                        <Loader2 className={cn("h-4 w-4", "animate-spin")} />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3">
                                    {wellnessStats.map((stat) => (
                                        <div
                                            key={stat.title}
                                            className={cn(
                                                "p-4 rounded-lg transition-all duration-200 hover:scale-[1.02]",
                                                stat.bgColor
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                                                <p className="text-sm font-medium">{stat.title}</p>
                                            </div>
                                            <p className="text-2xl font-bold mt-2">{stat.value}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {stat.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/*Content grid for games*/}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-3 space-y-6">
                            <AnxietyGames />
                        </div>
                    </div>
                </div>
            </Container>

            {/* Mood tracking modal */}
            <Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>How are you feeling?</DialogTitle>
                        <DialogDescription>
                            Move the slider to track your current mood
                        </DialogDescription>
                    </DialogHeader>
                    <MoodForm onSubmit={handleMoodSubmit} isLoading={isSavingMood} />
                </DialogContent>
            </Dialog>

            <ActivityLogger
                open={showActivityLogger}
                onOpenChange={setShowActivityLogger}
            />

            <StressSurveyModal
                mode="baseline"
                open={showBaselineModal}
                onOpenChange={setShowBaselineModal}
                onSubmit={handleBaselineSubmit}
            />
            <StressSurveyModal
                mode="daily"
                open={showDailyModal}
                onOpenChange={setShowDailyModal}
                onSubmit={handleDailySubmit}
            />
        </div>
    );
}
