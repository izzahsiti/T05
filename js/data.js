import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function loadData(fileName, columnHeadings) {
  if (!fileName) throw new Error("Set a data filename in this chart's config.");
  if (!Array.isArray(columnHeadings) || columnHeadings.length === 0) {
    throw new Error("Set the required column headings in this chart's config.");
  }

  const rows = await d3.csv(fileName);
  if (!rows.length) return [];

  const missing = columnHeadings.filter((heading) => !(heading in rows[0]));
  if (missing.length) {
    throw new Error(`Missing column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}. Found: ${Object.keys(rows[0]).join(", ")}.`);
  }

  return rows.map((row) => Object.fromEntries(
    columnHeadings.map((heading) => [heading, row[heading] ?? ""]),
  ));
}