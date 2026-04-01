import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";

type FindingType =
  | "raw-input"
  | "raw-select"
  | "placeholder-class"
  | "baseInputClasses"
  | "toggle-switch"
  | "ui-input-class";

type Finding = {
  type: FindingType;
  file: string;
  line: number;
  text: string;
};

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const SRC_ROOT = path.join(PROJECT_ROOT, "src");

function toPosix(p: string) {
  return p.split(path.sep).join("/");
}

function addFinding(findings: Finding[], finding: Finding) {
  findings.push({
    ...finding,
    file: toPosix(path.relative(PROJECT_ROOT, finding.file)),
  });
}

function scanFile(filePath: string, findings: Finding[]) {
  const contents = fs.readFileSync(filePath, "utf8");
  const lines = contents.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i] ?? "";

    if (lineText.includes("baseInputClasses")) {
      addFinding(findings, { type: "baseInputClasses", file: filePath, line: i + 1, text: lineText.trim() });
    }

    if (lineText.includes("toggle-switch")) {
      addFinding(findings, { type: "toggle-switch", file: filePath, line: i + 1, text: lineText.trim() });
    }

    if (lineText.includes("placeholder-")) {
      addFinding(findings, { type: "placeholder-class", file: filePath, line: i + 1, text: lineText.trim() });
    }

    // raw tags
    if (lineText.includes("<input") && !lineText.includes("<Input")) {
      addFinding(findings, { type: "raw-input", file: filePath, line: i + 1, text: lineText.trim() });
    }

    if (lineText.includes("<select") && !lineText.includes("<Select")) {
      addFinding(findings, { type: "raw-select", file: filePath, line: i + 1, text: lineText.trim() });
    }

    // direct DS class usage (usually fine, but indicates bypassing primitives)
    if (lineText.includes("ui-input") && lineText.includes("className") && !lineText.includes("ui-search__control")) {
      addFinding(findings, { type: "ui-input-class", file: filePath, line: i + 1, text: lineText.trim() });
    }
  }
}

function groupBy<T extends string>(items: Finding[], key: (f: Finding) => T) {
  const map = new Map<T, Finding[]>();
  for (const item of items) {
    const k = key(item);
    const list = map.get(k) ?? [];
    list.push(item);
    map.set(k, list);
  }
  return map;
}

function printSection(title: string, items: Finding[], maxItems = 40) {
  console.log("\n" + title);
  console.log("-".repeat(title.length));

  if (items.length === 0) {
    console.log("(none)");
    return;
  }

  const shown = items.slice(0, maxItems);
  for (const f of shown) {
    console.log(`${f.file}:${f.line}  ${f.text}`);
  }

  if (items.length > maxItems) {
    console.log(`... and ${items.length - maxItems} more`);
  }
}

function main() {
  const files = globSync("**/*.tsx", {
    cwd: SRC_ROOT,
    absolute: true,
    ignore: [
      "**/*.d.ts",
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
    ],
  });

  const findings: Finding[] = [];
  for (const file of files) scanFile(file, findings);

  const byType = groupBy(findings, (f) => f.type);

  const counts = {
    files: files.length,
    rawInputs: (byType.get("raw-input") ?? []).length,
    rawSelects: (byType.get("raw-select") ?? []).length,
    placeholderClasses: (byType.get("placeholder-class") ?? []).length,
    baseInputClasses: (byType.get("baseInputClasses") ?? []).length,
    toggleSwitch: (byType.get("toggle-switch") ?? []).length,
    uiInputClass: (byType.get("ui-input-class") ?? []).length,
  };

  console.log("UI Consistency Audit");
  console.log("====================");
  console.log(`Scanned TSX files: ${counts.files}`);
  console.log(`Raw <input>: ${counts.rawInputs}`);
  console.log(`Raw <select>: ${counts.rawSelects}`);
  console.log(`placeholder-* classes: ${counts.placeholderClasses}`);
  console.log(`baseInputClasses patterns: ${counts.baseInputClasses}`);
  console.log(`toggle-switch patterns: ${counts.toggleSwitch}`);
  console.log(`Direct 'ui-input' className usage: ${counts.uiInputClass}`);

  printSection("Raw <input> usages (likely not using DS Input)", byType.get("raw-input") ?? []);
  printSection("Raw <select> usages (likely not using DS Select)", byType.get("raw-select") ?? []);
  printSection("placeholder-* class usage (inconsistent placeholder styling risk)", byType.get("placeholder-class") ?? []);
  printSection("baseInputClasses occurrences (local style systems)", byType.get("baseInputClasses") ?? []);
  printSection("toggle-switch occurrences (non-DS switch)", byType.get("toggle-switch") ?? []);
  printSection("Direct ui-input className usage (bypassing Input primitive)", byType.get("ui-input-class") ?? []);

  console.log("\nRecommendation");
  console.log("--------------");
  console.log(
    "Pick ONE source of truth for form controls (DS primitives recommended). Replace raw <input>/<select> + local baseInputClasses with src/ds/primitives/Input + Select. If you need a fully consistent dropdown placeholder across browsers, consider replacing native <select> with a Radix/shadcn-style Select, but still wired to DS tokens." 
  );
}

main();
