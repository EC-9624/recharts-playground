export type TrafficPoint = {
  date: string; // 表示用 m/d 形式（例: 8/1）
  pv: number;
  uu: number;
};

export type DatasetKey = "press" | "story" | "both";

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function formatMonthDay(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}/${day}`;
}

// 90日分の架空データを生成（開始日は 2025-08-01）
export function generateTrafficData(
  kind: DatasetKey,
  startIso: string = "2025-08-01",
  days: number = 90
): TrafficPoint[] {
  const startDate = new Date(startIso);
  const points: TrafficPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = addDays(startDate, i);
    const label = formatMonthDay(d);

    // 週末は少し落ちる係数
    const weekday = d.getDay(); // 0:Sun ... 6:Sat
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.9 : 1.0;

    if (kind === "press") {
      // プレス: 値レンジは小さめ。UUはPVと同一か少しだけ小さい（差0〜3）
      const spike = i < 5 ? 1.2 : i < 10 ? 1.1 : 1.0;
      const base = 30 + 8 * Math.sin(i / 6) + 6 * Math.sin(i / 3);
      const pv = Math.max(0, Math.round(base * weekendFactor * spike));
      const delta =
        i % 6 === 0
          ? 0
          : Math.min(
              3,
              Math.max(1, Math.abs(Math.round(3 * Math.sin(i * 1.3))))
            );
      const uu = Math.max(0, pv - delta);
      points.push({ date: label, pv, uu });
    } else {
      // ストーリー: 穏やかな上昇。UUは常にPV以下で差は0〜3
      const growth = 22 + Math.min(i * 0.18, 16);
      const wave = 7 * Math.sin(i / 7) + 4 * Math.sin(i / 3.2);
      const pv = Math.max(0, Math.round((growth + wave) * weekendFactor));
      const delta =
        i % 5 === 0
          ? 0
          : Math.min(
              3,
              Math.max(1, Math.abs(Math.round(2 * Math.sin(i * 1.5))))
            );
      const uu = Math.max(0, pv - delta);
      points.push({ date: label, pv, uu });
    }
  }
  return points;
}

export const pressTraffic90: TrafficPoint[] = generateTrafficData("press");
export const storyTraffic90: TrafficPoint[] = generateTrafficData("story");
