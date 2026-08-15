import { readFile } from "node:fs/promises";
import path from "node:path";

export interface QualitySummary {
  duplicate_rows: number;
  empty_text: number;
  impossible_dates: number;
  invalid_engagement: number;
  language_uncertainty: number;
  malformed_urls: number;
  missing_platform: number;
  missing_timestamps: number;
  rows_checked: number;
}

export interface QualityReport {
  generated_at: string;
  datasets: Array<Record<string, unknown>>;
  totals: QualitySummary;
  quality_status: string;
  note: string;
}

export async function readQualityReport(): Promise<QualityReport> {
  const reportPath = path.resolve(process.cwd(), "../data/data_quality_report.json");
  const content = await readFile(reportPath, "utf-8");
  return JSON.parse(content) as QualityReport;
}
