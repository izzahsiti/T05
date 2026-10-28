import { loadData } from "./data.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// CSV columns used for the scatter plot: energy is x, star rating is y.
const config = {
  fileName: "data/Ex5_TV_energy.csv",
  columnHeadings: ["energy_consumpt", "star2"],
};

const colors = { moss: "#536b4c", clay: "#b86648", grid: "#e6e2d8", ink: "#77796d" };

async function renderChart() {
  if (!config.fileName || config.columnHeadings.length < 2) return;
  const rows = await loadData(config.fileName, config.columnHeadings);
  const [xColumn, yColumn] = config.columnHeadings;
  // Convert CSV strings to numeric coordinates and skip incomplete observations.
  const points = rows
    .map((row) => ({ x: Number(row[xColumn]), y: Number(row[yColumn]) }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  const container = d3.select("#chart-1");
  const bounds = container.node().getBoundingClientRect();
  const width = Math.max(bounds.width, 320);
  const height = Math.max(bounds.height, 220);
  const margin = { top: 12, right: 18, bottom: 48, left: 62 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Linear scales map each measured value to a position in the SVG plot area.
  const xScale = d3.scaleLinear()
    .domain(d3.extent(points, (point) => point.x)).nice()
    .range([0, innerWidth]);
  const yScale = d3.scaleLinear()
    .domain(d3.extent(points, (point) => point.y)).nice()
    .range([innerHeight, 0]);

  // The viewBox makes the SVG scale with its responsive container.
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("aria-hidden", "true");
  const plot = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // The bottom axis labels energy use and the left axis labels star rating.
  plot.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale))
    .call((axis) => axis.selectAll("text").attr("fill", colors.ink))
    .call((axis) => axis.selectAll("line, .domain").attr("stroke", colors.grid));
  plot.append("g")
    .call(d3.axisLeft(yScale).tickSize(-innerWidth))
    .call((axis) => axis.selectAll("text").attr("fill", colors.ink))
    .call((axis) => axis.select(".domain").remove())
    .call((axis) => axis.selectAll("line").attr("stroke", colors.grid));

  // Axis titles explain the units and ratings shown on each scale.
  svg.append("text")
    .attr("x", margin.left + innerWidth / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .attr("fill", colors.ink)
    .text("Energy consumption (kWh/year)");
  svg.append("text")
    .attr("transform", `translate(16,${margin.top + innerHeight / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .attr("fill", colors.ink)
    .text("Star rating");

  // Each circle shows one TV's energy consumption and star rating.
  plot.selectAll("circle")
    .data(points)
    .join("circle")
    .attr("cx", (point) => xScale(point.x))
    .attr("cy", (point) => yScale(point.y))
    .attr("r", 3)
    .attr("fill", `${colors.clay}aa`)
    .attr("stroke", colors.clay);
}

renderChart().catch((error) => console.error("Chart 1:", error));