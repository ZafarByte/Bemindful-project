export type SliderItem = { id: string; label: string; reverse?: boolean };

export const baselineItems: SliderItem[] = [
  { id: "cheerful", label: "I generally feel cheerful." },
  { id: "anxious", label: "I generally feel nervous or anxious." },
  { id: "tired", label: "I often feel tired or low on energy." },
  { id: "sleep", label: "I sleep well most nights.", reverse: true },
  { id: "irritable", label: "I easily get irritated or angry." },
  { id: "focus", label: "I feel able to concentrate on tasks.", reverse: true },
  { id: "social", label: "I enjoy social interactions.", reverse: true },
  { id: "worry", label: "I worry about things more than others do." },
  { id: "exercise", label: "I exercise regularly.", reverse: true },
  { id: "meals", label: "I eat balanced meals regularly.", reverse: true },
  { id: "overwhelmed", label: "I feel overwhelmed by responsibilities." },
  { id: "recover", label: "I can recover quickly from a stressful day.", reverse: true },
  { id: "tension", label: "I frequently have physical tension (neck/back)." },
  { id: "optimistic", label: "I feel optimistic about the future.", reverse: true },
  { id: "relax", label: "I find it hard to relax in my free time." },
];

export const dailyItems: SliderItem[] = [
  { id: "stress", label: "How stressed did you feel today?" },
  { id: "anxiety", label: "How anxious/worried did you feel today?" },
  { id: "energy", label: "How energetic did you feel today?", reverse: true },
  { id: "sleep", label: "How well did you sleep last night?", reverse: true },
  { id: "social", label: "How connected did you feel socially today?", reverse: true },
  { id: "mood", label: "Overall mood today?", reverse: true },
];

export const normalize = (v: number) => v / 4;
export const flip = (v: number) => 1 - normalize(v);

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export const scoreBaseline = (answers: Record<string, number>) => {
  const values = baselineItems.map((item) =>
    item.reverse ? flip(answers[item.id]) : normalize(answers[item.id])
  );
  return avg(values);
};

export const scoreDaily = (answers: Record<string, number>) => {
  const values = dailyItems.map((item) => {
    if (item.id === "stress" || item.id === "anxiety") return flip(answers[item.id]);
    return item.reverse ? flip(answers[item.id]) : normalize(answers[item.id]);
  });
  return avg(values);
};

export const combinedScore = (baseline: number, daily: number, alpha = 0.7) =>
  alpha * daily + (1 - alpha) * baseline;

export const labelScore = (v: number) => {
  if (v < 0.3) return "High stress / Low mood";
  if (v < 0.5) return "Moderate stress";
  if (v < 0.7) return "Mild stress / Neutral mood";
  return "Low stress / Good mood";
};

