import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FC } from "react";
import "./App.css";
import type { DatasetKey } from "./data/traffic";
import { pressTraffic90, storyTraffic90 } from "./data/traffic";

type CombinedPoint = {
  date: string;
  pvPress: number;
  uuPress: number;
  pvStory: number;
  uuStory: number;
};

function App() {
  const [dataset, setDataset] = useState<DatasetKey>("press");
  const combinedData: CombinedPoint[] = useMemo(() => {
    const len = Math.min(pressTraffic90.length, storyTraffic90.length);
    const combined: CombinedPoint[] = [];
    for (let i = 0; i < len; i++) {
      combined.push({
        date: pressTraffic90[i].date,
        pvPress: pressTraffic90[i].pv,
        uuPress: pressTraffic90[i].uu,
        pvStory: storyTraffic90[i].pv,
        uuStory: storyTraffic90[i].uu,
      });
    }
    return combined;
  }, []);
  const data = useMemo(() => {
    if (dataset === "press") return pressTraffic90;
    if (dataset === "story") return storyTraffic90;
    return combinedData;
  }, [dataset, combinedData]);

  const [colors, setColors] = useState({
    pvPress: "#3b82f6",
    uuPress: "#10b981",
    pvStory: "#a855f7",
    uuStory: "#f59e0b",
  });

  const isValidHex = (v: string) => /^#([0-9a-fA-F]{6})$/.test(v.trim());
  const normalizeHex = (v: string) => {
    let s = v.trim();
    if (s && !s.startsWith("#")) s = "#" + s;
    return s;
  };
  const getColor = (v: string, fallback: string) =>
    isValidHex(v) ? v : fallback;

  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle"
  );
  const buildHexText = () => {
    const json = JSON.stringify(colors, null, 2);
    return [
      `PV（プレス）: ${getColor(colors.pvPress, "#3b82f6")}`,
      `UU（プレス）: ${getColor(colors.uuPress, "#10b981")}`,
      `PV（ストーリー）: ${getColor(colors.pvStory, "#a855f7")}`,
      `UU（ストーリー）: ${getColor(colors.uuStory, "#f59e0b")}`,
      "",
      "JSON:",
      json,
    ].join("\n");
  };
  const copyColors = async () => {
    const text = buildHexText();
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 1500);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopyStatus("copied");
        setTimeout(() => setCopyStatus("idle"), 1500);
      } catch {
        setCopyStatus("error");
        setTimeout(() => setCopyStatus("idle"), 2000);
      }
    }
  };

  type AnyRecord = Record<string, unknown>;
  type ContentArg = {
    active?: boolean;
    payload?: AnyRecord[];
    label?: string | number;
  };
  const CustomTooltip: FC<Record<string, unknown>> = (props) => {
    const { active, payload, label } = props as ContentArg;
    if (!active || !payload || payload.length === 0) return null;
    const items = payload.filter((p) => {
      const name = (p && (p as AnyRecord).name) as unknown as
        | string
        | undefined;
      return (
        typeof name === "string" &&
        (name.startsWith("PV") || name.startsWith("UU"))
      );
    }) as Array<{ name?: string; value?: number | string; color?: string }>;
    if (items.length === 0) return null;
    return (
      <div
        style={{
          background: "rgba(0,0,0,0.75)",
          color: "#fff",
          padding: 8,
          borderRadius: 6,
          fontSize: 12,
        }}
      >
        <div style={{ marginBottom: 6 }}>日付: {String(label ?? "")}</div>
        {items.map((it, idx) => (
          <div
            key={idx}
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                background: it.color,
                display: "inline-block",
                borderRadius: 2,
              }}
            />
            <span>{it.name}</span>
            <span style={{ marginLeft: "auto" }}>{it.value}</span>
          </div>
        ))}
      </div>
    );
  };

  type LegendItem = { value?: string; color?: string };
  const CustomLegend: FC<Record<string, unknown>> = (props) => {
    const payload = (props as Record<string, unknown>).payload as
      | LegendItem[]
      | undefined;
    if (!payload) return null;
    const items = payload.filter((e) => {
      const v = e && e.value;
      return (
        typeof v === "string" && (v.startsWith("PV") || v.startsWith("UU"))
      );
    });
    if (items.length === 0) return null;
    return (
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12 }}>
        {items.map((it, idx) => (
          <div
            key={idx}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                background: it.color,
                display: "inline-block",
                borderRadius: 2,
              }}
            />
            <span>{it.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container">
      <h1 className="title">Recharts LineChart Playground</h1>
      <div className="playground">
        <section className="controls">
          <div className="control-row">
            <label className="label">データセット</label>
            <select
              value={dataset}
              onChange={(e) => setDataset(e.target.value as DatasetKey)}
            >
              <option value="press">セット1：プレスリリース</option>
              <option value="story">セット2：ストーリー</option>
              <option value="both">セット3：両方表示</option>
            </select>
          </div>
          <div className="control-row">
            <label className="label">PV（プレス）HEX</label>
            <input
              type="text"
              placeholder="#3b82f6"
              value={colors.pvPress}
              onChange={(e) =>
                setColors((c) => ({
                  ...c,
                  pvPress: normalizeHex(e.target.value),
                }))
              }
            />
            <input
              type="color"
              aria-label="PV（プレス）color picker"
              value={getColor(colors.pvPress, "#3b82f6")}
              onChange={(e) =>
                setColors((c) => ({ ...c, pvPress: e.target.value }))
              }
            />
          </div>
          <div className="control-row">
            <label className="label">UU（プレス）HEX</label>
            <input
              type="text"
              placeholder="#10b981"
              value={colors.uuPress}
              onChange={(e) =>
                setColors((c) => ({
                  ...c,
                  uuPress: normalizeHex(e.target.value),
                }))
              }
            />
            <input
              type="color"
              aria-label="UU（プレス）color picker"
              value={getColor(colors.uuPress, "#10b981")}
              onChange={(e) =>
                setColors((c) => ({ ...c, uuPress: e.target.value }))
              }
            />
          </div>
          <div className="control-row">
            <label className="label">PV（ストーリー）HEX</label>
            <input
              type="text"
              placeholder="#a855f7"
              value={colors.pvStory}
              onChange={(e) =>
                setColors((c) => ({
                  ...c,
                  pvStory: normalizeHex(e.target.value),
                }))
              }
            />
            <input
              type="color"
              aria-label="PV（ストーリー）color picker"
              value={getColor(colors.pvStory, "#a855f7")}
              onChange={(e) =>
                setColors((c) => ({ ...c, pvStory: e.target.value }))
              }
            />
          </div>
          <div className="control-row">
            <label className="label">UU（ストーリー）HEX</label>
            <input
              type="text"
              placeholder="#f59e0b"
              value={colors.uuStory}
              onChange={(e) =>
                setColors((c) => ({
                  ...c,
                  uuStory: normalizeHex(e.target.value),
                }))
              }
            />
            <input
              type="color"
              aria-label="UU（ストーリー）color picker"
              value={getColor(colors.uuStory, "#f59e0b")}
              onChange={(e) =>
                setColors((c) => ({ ...c, uuStory: e.target.value }))
              }
            />
          </div>
        </section>

        <section className="chart">
          <div className="control-row" style={{ marginBottom: 8 }}>
            <button onClick={copyColors}>HEXセットをコピー</button>
            {copyStatus === "copied" && (
              <span className="label" style={{ marginLeft: 8 }}>
                コピーしました
              </span>
            )}
            {copyStatus === "error" && (
              <span
                className="label"
                style={{ marginLeft: 8, color: "#f87171" }}
              >
                コピーに失敗しました
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                content={<CustomLegend />}
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              />

              {dataset !== "both" ? (
                <defs>
                  <linearGradient id="fillUU" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={getColor(
                        dataset === "press" ? colors.uuPress : colors.uuStory,
                        dataset === "press" ? "#10b981" : "#f59e0b"
                      )}
                      stopOpacity={0.9}
                    />
                    <stop
                      offset="100%"
                      stopColor={getColor(
                        dataset === "press" ? colors.uuPress : colors.uuStory,
                        dataset === "press" ? "#10b981" : "#f59e0b"
                      )}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
              ) : (
                <defs>
                  <linearGradient id="fillUUPress" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={getColor(colors.uuPress, "#10b981")}
                      stopOpacity={0.9}
                    />
                    <stop
                      offset="100%"
                      stopColor={getColor(colors.uuPress, "#10b981")}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="fillUUStory" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={getColor(colors.uuStory, "#f59e0b")}
                      stopOpacity={0.9}
                    />
                    <stop
                      offset="100%"
                      stopColor={getColor(colors.uuStory, "#f59e0b")}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
              )}

              {dataset !== "both" ? (
                <Area
                  type="linear"
                  dataKey="uu"
                  stroke="none"
                  fill="url(#fillUU)"
                />
              ) : (
                <>
                  <Area
                    type="linear"
                    dataKey="uuPress"
                    stroke="none"
                    fill="url(#fillUUPress)"
                  />
                  <Area
                    type="linear"
                    dataKey="uuStory"
                    stroke="none"
                    fill="url(#fillUUStory)"
                  />
                </>
              )}

              {dataset !== "both" ? (
                <>
                  {/* UU線を先に描画（PVを最前面にするため） */}
                  <Line
                    type="linear"
                    dataKey="uu"
                    name="UU"
                    stroke={getColor(
                      dataset === "press" ? colors.uuPress : colors.uuStory,
                      dataset === "press" ? "#10b981" : "#f59e0b"
                    )}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="linear"
                    dataKey="pv"
                    name="PV"
                    stroke={getColor(
                      dataset === "press" ? colors.pvPress : colors.pvStory,
                      dataset === "press" ? "#3b82f6" : "#a855f7"
                    )}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </>
              ) : (
                <>
                  {/* 両方表示時もPV系を最後に描画 */}
                  <Line
                    type="linear"
                    dataKey="uuPress"
                    name="UU（プレス）"
                    stroke={getColor(colors.uuPress, "#10b981")}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="linear"
                    dataKey="uuStory"
                    name="UU（ストーリー）"
                    stroke={getColor(colors.uuStory, "#f59e0b")}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="linear"
                    dataKey="pvPress"
                    name="PV（プレス）"
                    stroke={getColor(colors.pvPress, "#3b82f6")}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="linear"
                    dataKey="pvStory"
                    name="PV（ストーリー）"
                    stroke={getColor(colors.pvStory, "#a855f7")}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </section>
      </div>

      <footer className="footer">
        <span>
          Docs:{" "}
          <a
            href="https://recharts.org/en-US/api/LineChart"
            target="_blank"
            rel="noreferrer"
          >
            LineChart API
          </a>
        </span>
      </footer>
    </div>
  );
}

export default App;
