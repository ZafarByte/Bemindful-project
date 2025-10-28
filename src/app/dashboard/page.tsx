"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Sparkles, MessageSquare, ArrowRight, BrainCircuit, Heart, Activity, Brain, Trophy, Loader2, Calendar, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { AnxietyGames } from "@/games/anxiety-games";
import { 
    format,
    subDays,
} from "date-fns";
interface DailyStats {
    moodScore: number | null;
    completionRate: number;
    mindfulnessCount: number;
    totalActivities: number;
    lastUpdated: Date;
}
interface Activity {
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
export default function DashboardPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showMoodModal, setShowMoodModal] = useState(false);
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const wellnessStats = [
        {
            title: "Mood Score",
            value: "No data",
            icon: Brain,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            description: "Today's average mood",
        },
        {
            title: "Completion Rate",
            value: "100%",
            icon: Trophy,
            color: "text-yellow-500",
            bgColor: "bg-yellow-500/10",
            description: "Perfect completion rate",
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
            icon: Activity,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            description: "Planned for today",
        },
    ];
    const [dailyStats, setDailyStats] = useState<DailyStats>({
        moodScore: null,
        completionRate: 100,
        mindfulnessCount: 0,
        totalActivities: 0,
        lastUpdated: new Date(),
    });
    const [insights, setInsights] = useState<
        {
            title: string;
            description: string;
            icon: any;
            priority: "low" | "medium" | "high";
        }[]
    >([]);

    return (
        <div className="min-h-screen bg-background p-8">
            <Container className="pt-20 pb-8 space-y-6">
                <div className="flex flex-col gap-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                    >
                        <h1 className="text-3xl font-bold">Welcome back</h1>
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
                             <AnxietyGames  />
                        </div>
                    </div>
                </div>
            </Container >

            {/* Mood tracking modal */}
            <Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>How are you feeling?</DialogTitle>
                        <DialogDescription>
                            Move the slider to track your current mood
                        </DialogDescription>
                    </DialogHeader>
                    {/*Mood form*/}

                </DialogContent>
            </Dialog>
        </div >
    );
}
