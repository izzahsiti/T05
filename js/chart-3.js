import { loadData } from "./data.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// This pre-aggregated file contains mean energy use for 55-inch TVs only.
const config = {
  fileName: "data/Ex5_TV_energy_55inchtv_byScreenType.csv",
  columnHeadings: ["Screen_Tech", "Mean(Labelled energy consumption (kWh/year))"],
};

async function renderChart() {
  if (!config.fileName || !config.columnHeadings.length) return;
  const rows = await loadData(config.fileName, config.columnHeadings);
  const [labelColumn, valueColumn] = config.columnHeadings;
  const data = rows.map((row) => ({
    label: row[labelColumn],
    value: Number(row[valueColumn]),
  })).filter((item) => Number.isFinite(item.value));
  const palette = ["#536b4c", "#b86648", "#c09547", "#9aa88b", "#6f837a", "#cf9b7d"];
  const container = d3.select("#chart-3");
  const bounds = container.node().getBoundingClientRect();
  const width = Math.max(bounds.width, 280);
  const height = Math.max(bounds.height, 220);
  const margin = { top: 12, right: 14, bottom: 42, left: 58 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // A band scale spaces the screen technology categories evenly along x.
  const xScale = d3.scaleBand()
    .domain(data.map((item) => item.label))
    .range([0, innerWidth])
    .padding(0.22);
  // A linear scale maps mean kWh/year values to bar heights.
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, (item) => item.value)])
    .nice()
    .range([innerHeight, 0]);

  // The viewBox lets the SVG fit the responsive chart container.
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("aria-hidden", "true");
  const plot = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // The bottom axis names technologies; the left axis adds light reading guides.
  plot.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale))
    .call((axis) => axis.selectAll("text").attr("fill", "#77796d"))
    .call((axis) => axis.selectAll("line, .domain").attr("stroke", "#77796d"));
  plot.append("g")
    .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth))
    .call((axis) => axis.selectAll("text").attr("fill", "#77796d"))
    .call((axis) => axis.select(".domain").remove())
    .call((axis) => axis.selectAll("line").attr("stroke", "#e6e2d8"));

  // Bars compare each technology's average annual energy consumption.
  plot.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (item) => xScale(item.label))
    .attr("y", (item) => yScale(item.value))
    .attr("width", Math.min(xScale.bandwidth(), 42))
    .attr("height", (item) => innerHeight - yScale(item.value))
    .attr("fill", (_, index) => palette[index % palette.length]);

  // The y-axis title states the units represented by the bar heights.
  svg.append("text")
    .attr("transform", `translate(15,${margin.top + innerHeight / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .attr("fill", "#77796d")
    .text("Mean energy consumption (kWh/year)");
}

renderChart().catch((error) => console.error("Chart 3:", error));