import { loadData } from "./data.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Plot the average spot price column against the year in the source CSV.
const config = {
  fileName: "data/Ex5_ARE_Spot_Prices.csv",
  columnHeadings: ["Year", "Average Price (notTas-Snowy)"],
};

// Swap this curve for another d3.curve* interpolation when comparing shapes.
const curveType = d3.curveCatmullRom;

async function renderChart() {
  if (!config.fileName || config.columnHeadings.length < 2) return;
  const rows = await loadData(config.fileName, config.columnHeadings);
  const [yearColumn, priceColumn] = config.columnHeadings;
  // Some years have no average, so omit them instead of drawing invalid values.
  const plottedRows = rows.filter((row) => Number.isFinite(Number(row[priceColumn])));
  const data = plottedRows.map((row) => ({ year: Number(row[yearColumn]), price: Number(row[priceColumn]) }));
  const container = d3.select("#chart-4");
  const bounds = container.node().getBoundingClientRect();
  const width = Math.max(bounds.width, 320);
  const height = Math.max(bounds.height, 220);
  const margin = { top: 12, right: 18, bottom: 48, left: 62 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Linear scales translate data values into positions within the plot area.
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, (point) => point.year))
    .range([0, innerWidth]);
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, (point) => point.price)])
    .nice()
    .range([innerHeight, 0]);

  // The viewBox lets the SVG scale to its container while keeping the chart proportions.
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("aria-hidden", "true");
  const plot = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Bottom axis labels years; the small tick count avoids crowding.
  plot.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(10, "d"))
    .call((axis) => axis.selectAll("text").attr("fill", "#77796d"))
    .call((axis) => axis.select(".domain").attr("stroke", "#77796d"))
    .call((axis) => axis.selectAll("line").attr("stroke", "#77796d"));

  // Left axis draws light horizontal grid lines; x-axis grid lines stay hidden.
  plot.append("g")
    .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth))
    .call((axis) => axis.selectAll("text").attr("fill", "#77796d"))
    .call((axis) => axis.select(".domain").remove())
    .call((axis) => axis.selectAll("line").attr("stroke", "#e6e2d8"));

  // Axis titles describe the units shown on each scale.
  svg.append("text")
    .attr("x", margin.left + innerWidth / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .attr("fill", "#77796d")
    .text("Year");
  svg.append("text")
    .attr("transform", `translate(16,${margin.top + innerHeight / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .attr("fill", "#77796d")
    .text("Average spot price ($/MWh)");

  // Show the source observations first so they remain visible against the curve.
  plot.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (point) => xScale(point.year))
    .attr("cy", (point) => yScale(point.price))
    .attr("r", 2)
    .attr("fill", "#b86648");

  // Both generators use the same configurable curve interpolation.
  const line = d3.line()
    .x((point) => xScale(point.year))
    .y((point) => yScale(point.price))
    .curve(curveType);
  const area = d3.area()
    .x((point) => xScale(point.year))
    .y0(innerHeight)
    .y1((point) => yScale(point.price))
    .curve(curveType);

  plot.append("path")
    .datum(data)
    .attr("fill", "#536b4c")
    .attr("fill-opacity", 0.12)
    .attr("d", area);
  plot.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#536b4c")
    .attr("stroke-width", 2)
    .attr("d", line);
}

renderChart().catch((error) => console.error("Chart 4:", error));