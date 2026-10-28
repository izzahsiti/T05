import { loadData } from "./data.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// This file contains mean annual energy use grouped by screen technology.
const config = {
  fileName: "data/Ex5_TV_energy_Allsizes_byScreenType.csv",
  columnHeadings: ["Screen_Tech", "Mean(Labelled energy consumption (kWh/year))"],
};

const palette = ["#536b4c", "#b86648", "#c09547", "#9aa88b", "#6f837a", "#cf9b7d"];

async function renderChart() {
  if (!config.fileName || !config.columnHeadings.length) return;
  const rows = await loadData(config.fileName, config.columnHeadings);
  const [labelColumn, valueColumn] = config.columnHeadings;
  const data = rows.map((row) => ({
    label: row[labelColumn],
    value: Number(row[valueColumn]),
  })).filter((item) => Number.isFinite(item.value));
  const container = d3.select("#chart-2");
  const bounds = container.node().getBoundingClientRect();
  const width = Math.max(bounds.width, 280);
  const height = Math.max(bounds.height, 220);
  const legendHeight = 38;
  const radius = Math.max(20, Math.min(width / 2 - 20, (height - legendHeight) / 2 - 8));
  const centerX = width / 2;
  const centerY = (height - legendHeight) / 2;

  // The viewBox lets the doughnut resize along with the card's plot area.
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("aria-hidden", "true");

  // A pie layout converts each technology's mean energy use into a slice angle.
  const pie = d3.pie()
    .sort(null)
    .value((item) => item.value);
  const arc = d3.arc()
    .innerRadius(radius * 0.66)
    .outerRadius(radius);

  // Each arc is one technology; the center opening gives this pie its doughnut form.
  svg.append("g")
    .attr("transform", `translate(${centerX},${centerY})`)
    .selectAll("path")
    .data(pie(data))
    .join("path")
    .attr("d", arc)
    .attr("fill", (_, index) => palette[index % palette.length])
    .attr("stroke", "#faf9f5")
    .attr("stroke-width", 3);

  // A compact key maps each slice color back to its screen technology.
  const legend = svg.append("g")
    .attr("transform", `translate(12,${height - 20})`);
  const itemWidth = (width - 24) / Math.max(data.length, 1);
  const legendItems = legend.selectAll("g")
    .data(data)
    .join("g")
    .attr("transform", (_, index) => `translate(${index * itemWidth},0)`);
  legendItems.append("circle")
    .attr("r", 4)
    .attr("fill", (_, index) => palette[index % palette.length]);
  legendItems.append("text")
    .attr("x", 8)
    .attr("y", 3)
    .attr("fill", "#77796d")
    .attr("font-size", 9)
    .text((item) => item.label);
}

renderChart().catch((error) => console.error("Chart 2:", error));