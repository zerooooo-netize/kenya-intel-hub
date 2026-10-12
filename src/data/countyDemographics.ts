import { KENYA_COUNTIES } from "./kenyaCounties";

export type CountyDemographic = {
  county: string;
  group: string;
  percentage: number;
  year: number;
  source: string;
};

// Colors identify groups only; they do not represent parties or voting preferences.
export function demographicColor(group: string) {
  const key = group.trim().toLowerCase();
  const hash = [...key].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0);
  return `var(--demographic-${hash % 12})`;
}

export function parseDemographicCsv(text: string): CountyDemographic[] {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const split = (line: string) => {
    const fields: string[] = [];
    let field = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (quoted && line[i + 1] === '"') { field += '"'; i++; }
        else quoted = !quoted;
      } else if (char === ',' && !quoted) { fields.push(field.trim()); field = ""; }
      else field += char;
    }
    if (quoted) throw new Error("Unclosed quotation mark in CSV.");
    fields.push(field.trim());
    return fields;
  };
  if (split(lines[0] ?? "").join(",").toLowerCase() !== "county,group,percentage,year,source") {
    throw new Error("CSV columns must be county,group,percentage,year,source.");
  }
  const rows = lines.slice(1).filter((line) => line.trim()).map((line, index) => {
    const values = split(line);
    const [countyInput, group, percent, yearInput, source] = values;
    const county = KENYA_COUNTIES.find((name) => name.toLowerCase() === countyInput?.toLowerCase());
    const percentage = Number(percent);
    const year = Number(yearInput);
    let validSource = false;
    try { validSource = new URL(source).protocol === "https:"; } catch { /* invalid URL */ }
    if (values.length !== 5 || !county || !group || !percent || !Number.isFinite(percentage) || percentage < 0 || percentage > 100 || !Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() || !validSource) {
      throw new Error(`Row ${index + 2}: use a Kenyan county, group, percentage 0–100, valid year and HTTPS source.`);
    }
    return { county, group, percentage, year, source };
  });
  if (!rows.length) throw new Error("The CSV contains no demographic records.");
  const totals = new Map<string, number>();
  const groups = new Set<string>();
  const editions = new Map<string, string>();
  for (const row of rows) {
    const key = `${row.county}:${row.group.toLowerCase()}`;
    if (groups.has(key)) throw new Error(`Duplicate group in ${row.county}.`);
    groups.add(key);
    const edition = `${row.year}:${row.source}`;
    if (editions.has(row.county) && editions.get(row.county) !== edition) throw new Error(`Use one year and source per county: ${row.county}.`);
    editions.set(row.county, edition);
    const total = (totals.get(row.county) ?? 0) + row.percentage;
    if (total > 100.05) throw new Error(`Percentages exceed 100% in ${row.county}.`);
    totals.set(row.county, total);
  }
  return rows;
}

export function normalizeCounty(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z]/g, "");
  return KENYA_COUNTIES.find((county) => county.toLowerCase().replace(/[^a-z]/g, "") === normalized) ?? null;
}