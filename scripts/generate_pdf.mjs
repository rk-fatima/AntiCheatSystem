import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { LEETCODE_REGISTRY } from "../frontend/src/data/leetcodeRegistry.js";
import { getProblemHint } from "../frontend/src/data/hints.js";

const execAsync = promisify(exec);

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getDiffClass(diff) {
  const d = (diff || "").toLowerCase();
  if (d.includes("easy")) return "diff-easy";
  if (d.includes("medium")) return "diff-medium";
  if (d.includes("hard")) return "diff-hard";
  return "diff-easy";
}

async function run() {
  console.log("Loading problem data...");
  const rawProblems = JSON.parse(await fs.readFile("frontend/src/data/problems.json", "utf8"));
  const problems = rawProblems.problems;

  console.log(`Found ${problems.length} problems.`);

  const easyCount = problems.filter(p => p.diff === 'Easy').length;
  const medCount = problems.filter(p => p.diff === 'Medium').length;
  const hardCount = problems.filter(p => p.diff === 'Hard').length;
  const totalPts = problems.reduce((acc, p) => acc + (p.pts || 0), 0);

  // Generate Table of Contents rows
  const tocRows = problems.map((p, idx) => {
    const diffClass = getDiffClass(p.diff);
    return `
      <tr>
        <td class="text-center font-mono">${idx + 1}</td>
        <td class="font-mono font-bold">${escapeHtml(p.id)}</td>
        <td class="font-mono text-muted">${escapeHtml(p.origId || '-')}</td>
        <td class="font-semibold">${escapeHtml(p.title)}</td>
        <td><span class="badge ${diffClass}">${escapeHtml(p.diff)}</span></td>
        <td class="text-sm text-secondary">${escapeHtml(p.cat || 'General')}</td>
        <td class="text-right font-mono font-bold">${p.pts || 0}</td>
      </tr>
    `;
  }).join("\n");

  // Generate Problem Cards
  const problemCards = problems.map((p, idx) => {
    const diffClass = getDiffClass(p.diff);
    const reg = LEETCODE_REGISTRY[p.id] || {};
    const hint = getProblemHint(p);

    // Function signature
    let sigPy = "";
    let sigCpp = "";
    if (reg.fn && reg.args && reg.ret) {
      const argsPy = reg.args.map(a => `${a.name}: ${a.py}`).join(", ");
      sigPy = `def ${reg.fn}(${argsPy}) -> ${reg.ret.py}:`;
      const argsCpp = reg.args.map(a => `${a.cpp} ${a.name}`).join(", ");
      sigCpp = `${reg.ret.cpp} ${reg.fn}(${argsCpp})`;
    }

    // Examples
    let examplesHtml = "";
    if (reg.examples && reg.examples.length > 0) {
      examplesHtml = reg.examples.map((ex, eIdx) => `
        <div class="example-box">
          <div class="example-title">Example ${eIdx + 1}</div>
          <div class="code-line"><span class="code-label">Input:</span> <code>${escapeHtml(ex.input)}</code></div>
          <div class="code-line"><span class="code-label">Output:</span> <code>${escapeHtml(ex.output)}</code></div>
          ${ex.explanation ? `<div class="code-line"><span class="code-label">Explanation:</span> <span class="explanation-text">${escapeHtml(ex.explanation)}</span></div>` : ""}
        </div>
      `).join("\n");
    } else if (p.si || p.so) {
      examplesHtml = `
        <div class="example-box">
          <div class="example-title">Sample I/O</div>
          <div class="code-line"><span class="code-label">Input (stdin):</span> <code>${escapeHtml(p.si)}</code></div>
          <div class="code-line"><span class="code-label">Output (stdout):</span> <code>${escapeHtml(p.so)}</code></div>
        </div>
      `;
    }

    // Raw Stdin / Stdout if available
    let stdioHtml = "";
    if (p.si || p.so) {
      stdioHtml = `
        <div class="stdio-grid">
          <div class="stdio-col">
            <span class="stdio-label">Standard Input (stdin):</span>
            <pre class="stdio-code">${escapeHtml(p.si || 'None')}</pre>
          </div>
          <div class="stdio-col">
            <span class="stdio-label">Standard Output (stdout):</span>
            <pre class="stdio-code">${escapeHtml(p.so || 'None')}</pre>
          </div>
        </div>
      `;
    }

    return `
      <section class="problem-card" id="problem-${p.id}">
        <div class="problem-header">
          <div class="header-left">
            <span class="problem-num font-mono">#${idx + 1}</span>
            <span class="problem-id-tag font-mono">${escapeHtml(p.id)}</span>
            ${p.origId ? `<span class="leetcode-badge font-mono">${escapeHtml(p.origId)}</span>` : ""}
            <h2 class="problem-title">${escapeHtml(p.title)}</h2>
          </div>
          <div class="header-right">
            <span class="badge ${diffClass}">${escapeHtml(p.diff)}</span>
            <span class="badge pts-badge font-mono">${p.pts || 0} PTS</span>
          </div>
        </div>

        <div class="meta-row">
          <span class="cat-pill">📁 ${escapeHtml(p.cat || 'General')}</span>
          ${reg.fn ? `<span class="cat-pill font-mono">⚡ fn: ${escapeHtml(reg.fn)}()</span>` : ""}
        </div>

        ${sigPy ? `
          <div class="signatures-box">
            <div class="sig-header">Function Signature</div>
            <div class="sig-code"><code>${escapeHtml(sigPy)}</code></div>
            ${sigCpp ? `<div class="sig-code sig-cpp"><code>${escapeHtml(sigCpp)}</code></div>` : ""}
          </div>
        ` : ""}

        <div class="section-block">
          <div class="section-heading">Problem Statement</div>
          <p class="problem-desc">${escapeHtml(p.desc)}</p>
        </div>

        ${p.con ? `
          <div class="section-block">
            <div class="section-heading">Constraints</div>
            <div class="constraints-box">
              <code>${escapeHtml(p.con)}</code>
            </div>
          </div>
        ` : ""}

        ${examplesHtml ? `
          <div class="section-block">
            <div class="section-heading">Examples</div>
            ${examplesHtml}
          </div>
        ` : ""}

        ${stdioHtml}

        <div class="section-block hint-block">
          <div class="hint-heading">💡 Algorithmic Strategy &amp; Intuition</div>
          <p class="hint-text">${escapeHtml(hint)}</p>
        </div>
      </section>
    `;
  }).join("\n");

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>QUBIT Anti-Cheat System - Complete Problem Catalogue</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 15mm 15mm 15mm;
      @bottom-right {
        content: counter(page);
      }
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1e293b;
      background: #ffffff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }

    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-muted { color: #64748b; }
    .text-secondary { color: #475569; }
    .text-sm { font-size: 9pt; }

    /* Cover Page */
    .cover-page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 250mm;
      padding: 20mm 10mm;
      border: 2px solid #0f172a;
      border-radius: 8px;
    }

    .cover-header {
      border-bottom: 3px solid #0f172a;
      padding-bottom: 12mm;
    }

    .brand-tag {
      display: inline-block;
      background: #0f172a;
      color: #38bdf8;
      font-family: ui-monospace, monospace;
      font-weight: 700;
      font-size: 11pt;
      padding: 4px 12px;
      border-radius: 4px;
      letter-spacing: 1px;
      margin-bottom: 8mm;
    }

    .cover-title {
      font-size: 32pt;
      font-weight: 900;
      line-height: 1.15;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin-bottom: 4mm;
    }

    .cover-subtitle {
      font-size: 14pt;
      color: #475569;
      font-weight: 500;
      line-height: 1.4;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 15mm 0;
    }

    .meta-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 16px;
      text-align: center;
    }

    .meta-val {
      font-size: 22pt;
      font-weight: 800;
      color: #0f172a;
      font-family: ui-monospace, monospace;
    }

    .meta-label {
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-top: 4px;
    }

    .meta-easy { color: #059669; }
    .meta-med { color: #d97706; }
    .meta-hard { color: #dc2626; }

    .cover-info {
      background: #f1f5f9;
      border-left: 4px solid #38bdf8;
      padding: 14px 18px;
      border-radius: 0 6px 6px 0;
      font-size: 10pt;
      line-height: 1.6;
      color: #334155;
      margin-bottom: 12mm;
    }

    .cover-info strong {
      color: #0f172a;
    }

    .cover-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 8mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9pt;
      color: #64748b;
    }

    /* TOC Page */
    .toc-page {
      page-break-after: always;
      padding: 5mm 0;
    }

    .toc-heading {
      font-size: 18pt;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4mm;
      padding-bottom: 2mm;
      border-bottom: 2px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .toc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
    }

    .toc-table th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 6px 8px;
      border-top: 1px solid #cbd5e1;
      border-bottom: 2px solid #cbd5e1;
      text-align: left;
    }

    .toc-table td {
      padding: 5px 8px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .toc-table tr:nth-child(even) td {
      background: #fafbfc;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 2px 7px;
      font-size: 8pt;
      font-weight: 700;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .diff-easy {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }

    .diff-medium {
      background: #fffbeb;
      color: #b45309;
      border: 1px solid #fde68a;
    }

    .diff-hard {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    .pts-badge {
      background: #0f172a;
      color: #38bdf8;
      border: 1px solid #334155;
    }

    /* Problem Card */
    .problem-card {
      page-break-inside: avoid;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 14mm;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .problem-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #e2e8f0;
      margin-bottom: 10px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .problem-num {
      background: #0f172a;
      color: #ffffff;
      font-weight: 800;
      font-size: 9.5pt;
      padding: 2px 7px;
      border-radius: 4px;
    }

    .problem-id-tag {
      background: #e0f2fe;
      color: #0369a1;
      font-weight: 700;
      font-size: 9.5pt;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #bae6fd;
    }

    .leetcode-badge {
      background: #fef3c7;
      color: #92400e;
      font-size: 8.5pt;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #fde68a;
    }

    .problem-title {
      font-size: 13pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.2px;
      margin: 0;
    }

    .meta-row {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .cat-pill {
      font-size: 8.5pt;
      color: #475569;
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    .signatures-box {
      background: #1e293b;
      color: #f8fafc;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 10px;
      font-size: 8.5pt;
    }

    .sig-header {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      margin-bottom: 4px;
    }

    .sig-code code {
      color: #38bdf8;
      font-family: ui-monospace, monospace;
    }

    .sig-cpp {
      margin-top: 3px;
    }

    .sig-cpp code {
      color: #a78bfa;
    }

    .section-block {
      margin-bottom: 10px;
    }

    .section-heading {
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 4px;
    }

    .problem-desc {
      font-size: 10pt;
      color: #1e293b;
      line-height: 1.5;
    }

    .constraints-box {
      background: #fffbeb;
      border-left: 3px solid #f59e0b;
      padding: 6px 10px;
      border-radius: 0 4px 4px 0;
      font-size: 9pt;
      color: #78350f;
    }

    .constraints-box code {
      font-family: ui-monospace, monospace;
    }

    .example-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      margin-bottom: 6px;
      font-size: 9pt;
    }

    .example-title {
      font-weight: 700;
      font-size: 8.5pt;
      color: #334155;
      margin-bottom: 4px;
    }

    .code-line {
      margin-bottom: 2px;
      font-family: ui-monospace, monospace;
      font-size: 8.5pt;
    }

    .code-label {
      font-weight: 700;
      color: #64748b;
      display: inline-block;
      width: 70px;
      font-family: -apple-system, sans-serif;
    }

    .explanation-text {
      font-family: -apple-system, sans-serif;
      color: #475569;
    }

    .stdio-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }

    .stdio-col {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 6px 8px;
    }

    .stdio-label {
      display: block;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 4px;
    }

    .stdio-code {
      font-family: ui-monospace, monospace;
      font-size: 8pt;
      color: #0f172a;
      white-space: pre-wrap;
      word-break: break-all;
    }

    .hint-block {
      background: #f0fdf4;
      border-left: 3px solid #10b981;
      padding: 8px 12px;
      border-radius: 0 4px 4px 0;
      margin-top: 8px;
      margin-bottom: 0;
    }

    .hint-heading {
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #065f46;
      margin-bottom: 2px;
    }

    .hint-text {
      font-size: 9pt;
      color: #047857;
      line-height: 1.45;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover-page">
    <div class="cover-header">
      <div class="brand-tag">QUBIT &bull; ANTI-CHEAT PLATFORM</div>
      <h1 class="cover-title">Official Problem Catalogue &amp; Technical Reference</h1>
      <p class="cover-subtitle">Complete Problem Statements, Function Signatures, Constraints, Test Cases, and Algorithmic Hints for Competitive Programming and Anti-Cheat Assessments.</p>
    </div>

    <div class="cover-meta-grid">
      <div class="meta-card">
        <div class="meta-val">${problems.length}</div>
        <div class="meta-label">Total Problems</div>
      </div>
      <div class="meta-card">
        <div class="meta-val meta-easy">${easyCount}</div>
        <div class="meta-label">Easy Tier</div>
      </div>
      <div class="meta-card">
        <div class="meta-val meta-med">${medCount}</div>
        <div class="meta-label">Medium Tier</div>
      </div>
      <div class="meta-card">
        <div class="meta-val meta-hard">${hardCount}</div>
        <div class="meta-label">Hard Tier</div>
      </div>
    </div>

    <div class="cover-info">
      <strong>Platform Verification &amp; Live Practice:</strong><br>
      All 93 problems in this catalogue are active and interactive on the live QUBIT Anti-Cheat System website at:<br>
      <a href="https://rk-fatima.github.io/AntiCheatSystem/#ps" style="color: #0284c7; font-weight: 700; text-decoration: none;">https://rk-fatima.github.io/AntiCheatSystem/#ps</a><br><br>
      <strong>Assessment Rules &amp; Anti-Cheat Security:</strong><br>
      1. Every problem is evaluated against multiple hidden test cases with strict execution time limits (1.5s - 2.0s) and memory constraints.<br>
      2. Multi-tier anti-cheat monitoring monitors clipboard copy/paste, tab visibility, peripheral key switches, and AI prompt injections.<br>
      3. Point scores range from 200 pts (Easy) to 350 pts (Medium) and 500 pts (Hard) with dynamic tie-breakers based on submission timestamp.
    </div>

    <div class="cover-footer">
      <span>Generated by QUBIT Anti-Cheat System</span>
      <span>Total Catalog Score: ${totalPts.toLocaleString()} Points</span>
      <span>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </div>
  </div>

  <!-- Table of Contents -->
  <div class="toc-page">
    <div class="toc-heading">
      <span>Table of Contents: All 93 Problems</span>
      <span class="text-sm font-mono text-muted">${problems.length} Problems &bull; ${totalPts.toLocaleString()} PTS</span>
    </div>
    <table class="toc-table">
      <thead>
        <tr>
          <th style="width: 35px;" class="text-center">#</th>
          <th style="width: 50px;">ID</th>
          <th style="width: 60px;">LeetCode</th>
          <th>Problem Title</th>
          <th style="width: 75px;">Tier</th>
          <th>Category / Topic</th>
          <th style="width: 50px;" class="text-right">PTS</th>
        </tr>
      </thead>
      <tbody>
        ${tocRows}
      </tbody>
    </table>
  </div>

  <!-- Detailed Problem Statements -->
  <div class="problems-container">
    ${problemCards}
  </div>

</body>
</html>
`;

  const htmlPath = path.resolve("scripts/problems_catalog.html");
  await fs.writeFile(htmlPath, fullHtml, "utf8");
  console.log(`Generated HTML catalog at: ${htmlPath} (${(fullHtml.length / 1024).toFixed(1)} KB)`);

  const pdfOutputPath = path.resolve("QUBIT_PROBLEMS_CATALOGUE.pdf");
  console.log(`Compiling PDF using Headless Chrome...`);

  const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const cmd = `"${chromePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfOutputPath}" "${htmlPath}"`;
  
  await execAsync(cmd);

  const stats = await fs.stat(pdfOutputPath);
  console.log(`SUCCESS! PDF Generated: ${pdfOutputPath} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);

  // Copy to public directory for web download
  const publicDir = path.resolve("frontend/public");
  await fs.mkdir(publicDir, { recursive: true });
  const publicPdf = path.join(publicDir, "QUBIT_PROBLEMS_CATALOGUE.pdf");
  await fs.copyFile(pdfOutputPath, publicPdf);
  console.log(`Copied PDF to web public directory: ${publicPdf}`);

  // Copy to dist directory if it exists
  const distDir = path.resolve("frontend/dist");
  try {
    await fs.access(distDir);
    await fs.copyFile(pdfOutputPath, path.join(distDir, "QUBIT_PROBLEMS_CATALOGUE.pdf"));
    console.log(`Copied PDF to dist directory`);
  } catch (e) {}

  // Copy to user artifacts directory
  const artifactPdf = "/Users/mohammedsalman/.gemini/antigravity/brain/539df0ca-728c-43a8-9093-83de18474ca3/QUBIT_PROBLEMS_CATALOGUE.pdf";
  await fs.copyFile(pdfOutputPath, artifactPdf);
  console.log(`Copied PDF to artifact directory: ${artifactPdf}`);
}

run().catch(err => {
  console.error("Error generating PDF:", err);
  process.exit(1);
});
