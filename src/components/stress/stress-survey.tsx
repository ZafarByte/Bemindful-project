"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  baselineItems,
  dailyItems,
  SliderItem,
  scoreBaseline,
  scoreDaily,
} from "@/lib/stress-questions";

type Props = {
  mode: "baseline" | "daily";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    answers: Record<string, number>;
    baselineScore?: number;
    dailyScore?: number;
  }) => Promise<void> | void;
};

const makeDefaultAnswers = (items: SliderItem[]) =>
  Object.fromEntries(items.map((item) => [item.id, 2]));

export function StressSurveyModal({ mode, open, onOpenChange, onSubmit }: Props) {
  const items = useMemo(() => (mode === "baseline" ? baselineItems : dailyItems), [mode]);
  const [answers, setAnswers] = useState<Record<string, number>>(makeDefaultAnswers(items));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAnswers(makeDefaultAnswers(items));
  }, [items, open]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (mode === "baseline") {
        const baselineScore = scoreBaseline(answers);
        await onSubmit({ answers, baselineScore });
      } else {
        const dailyScore = scoreDaily(answers);
        await onSubmit({ answers, dailyScore });
      }
      setAnswers(makeDefaultAnswers(items));
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "baseline" ? "Build your baseline" : "Daily check-in"}
          </DialogTitle>
          <DialogDescription>
            {mode === "baseline"
              ? "15 quick sliders to set your stress/mood baseline."
              : "A 6-question pulse to capture how you feel today."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
          {items.map((item) => (
            <div key={item.id} className="space-y-2 rounded-xl border border-border/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium leading-tight">{item.label}</p>
                {item.reverse && (
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    Positive high
                  </span>
                )}
              </div>
              <div className="px-2">
                <Slider
                  value={[answers[item.id] ?? 2]}
                  min={0}
                  max={4}
                  step={1}
                  onValueChange={([val]) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [item.id]: val,
                    }))
                  }
                />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                  <span>0</span>
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

