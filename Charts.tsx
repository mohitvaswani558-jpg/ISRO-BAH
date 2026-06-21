import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, RadialLinearScale, ArcElement, Tooltip, Legend, Filler, Title,
} from "chart.js";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  RadialLinearScale, ArcElement, Tooltip, Legend, Filler, Title
);

const GRID = "rgba(2,132,199,0.12)";
const TICK = "#0369a1";
const CYAN = "#22d3ee";
const BLUE = "#0ea5e9";

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: TICK, font: { family: "Rajdhani", size: 12, weight: 600 }, usePointStyle: true, pointStyle: "circle" } },
    tooltip: {
      backgroundColor: "rgba(255,255,255,0.92)", titleColor: "#04263a", bodyColor: "#0369a1",
      borderColor: "rgba(34,211,238,0.5)", borderWidth: 1, padding: 10, cornerRadius: 10,
      titleFont: { family: "Orbitron", size: 11 }, bodyFont: { family: "Rajdhani", size: 13 },
    },
  },
  scales: {
    x: { ticks: { color: TICK, font: { family: "Rajdhani", size: 11 } }, grid: { color: GRID } },
    y: { ticks: { color: TICK, font: { family: "Rajdhani", size: 11 } }, grid: { color: GRID }, beginAtZero: true },
  },
};

export function LineChart({ labels, data, label, color = CYAN, height = 240, fill = true, suffix = "" }: {
  labels: string[]; data: number[]; label: string; color?: string; height?: number; fill?: boolean; suffix?: string;
}) {
  const grad = (ctx: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { bottom: number; top: number } } }) => {
    const { ctx: c, chartArea } = ctx.chart;
    if (!chartArea) return color + "22";
    const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    g.addColorStop(0, color + "55");
    g.addColorStop(1, color + "05");
    return g;
  };
  return (
    <div style={{ height }}>
      <Line
        data={{
          labels,
          datasets: [{
            label, data, borderColor: color, borderWidth: 2.5, tension: 0.4,
            pointRadius: 3, pointBackgroundColor: color, pointBorderColor: "#fff", pointHoverRadius: 6,
            fill, backgroundColor: fill ? (ctx) => grad(ctx) : "transparent",
          }],
        }}
        options={{ ...baseOpts, scales: { ...baseOpts.scales, y: { ...baseOpts.scales.y, ticks: { ...baseOpts.scales.y.ticks, callback: (v: number) => v + suffix } } } } as never}
      />
    </div>
  );
}

export function MultiLineChart({ labels, datasets, height = 260 }: {
  labels: string[];
  datasets: { label: string; data: number[]; color: string; fill?: boolean }[];
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <Line
        data={{
          labels,
          datasets: datasets.map((d) => ({
            label: d.label, data: d.data, borderColor: d.color, backgroundColor: d.color + "22",
            borderWidth: 2.5, tension: 0.4, pointRadius: 2.5, pointBackgroundColor: d.color,
            fill: d.fill ?? false,
          })),
        }}
        options={baseOpts as never}
      />
    </div>
  );
}

export function BarChart({ labels, data, label, colors, height = 240, horizontal = false }: {
  labels: string[]; data: number[]; label: string; colors?: string[]; height?: number; horizontal?: boolean;
}) {
  return (
    <div style={{ height }}>
      <Bar
        data={{
          labels,
          datasets: [{
            label, data,
            backgroundColor: colors ?? data.map(() => CYAN + "cc"),
            borderRadius: 8, borderSkipped: false,
          }],
        }}
        options={{ ...baseOpts, indexAxis: horizontal ? "y" : "x" } as never}
      />
    </div>
  );
}

export function DoughnutChart({ labels, data, colors, height = 220, cutout = "68%" }: {
  labels: string[]; data: number[]; colors: string[]; height?: number; cutout?: string;
}) {
  return (
    <div style={{ height }} className="grid place-items-center">
      <Doughnut
        data={{ labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: "#fff", hoverOffset: 10 }] }}
        options={{
          responsive: true, maintainAspectRatio: false, cutout,
          plugins: { legend: { position: "bottom", labels: { color: TICK, font: { family: "Rajdhani", size: 11 }, usePointStyle: true } },
            tooltip: baseOpts.plugins.tooltip },
        } as never}
      />
    </div>
  );
}

export function RadarChart({ labels, datasets, height = 260 }: {
  labels: string[];
  datasets: { label: string; data: number[]; color: string }[];
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <Radar
        data={{
          labels,
          datasets: datasets.map((d) => ({
            label: d.label, data: d.data, borderColor: d.color, backgroundColor: d.color + "22",
            borderWidth: 2, pointBackgroundColor: d.color, pointRadius: 3,
          })),
        }}
        options={{
          responsive: true, maintainAspectRatio: false,
          scales: { r: { angleLines: { color: GRID }, grid: { color: GRID }, pointLabels: { color: TICK, font: { family: "Rajdhani", size: 11 } }, ticks: { color: TICK, backdropColor: "transparent", font: { size: 9 } }, beginAtZero: true, max: 100 } },
          plugins: { legend: baseOpts.plugins.legend, tooltip: baseOpts.plugins.tooltip },
        } as never}
      />
    </div>
  );
}

export { CYAN, BLUE };
