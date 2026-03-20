import { useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const DEFAULT_GREENWASHING_KEYWORDS = {
  "Vague terms": ["eco-friendly","green","sustainable","natural","organic","environmentally friendly","eco","green initiative"],
  "Unverified certifications": ["certified","certified green","certified sustainable","eco-certified"],
  "Vague promises": ["commitment to sustainability","committed to","dedicated to","striving for","working towards","efforts to"],
  "Dubious claims": ["net zero","carbon neutral","emission reduction","renewable energy","clean energy"],
  "Temporal vagueness": ["soon","eventually","in the future","long term","target by"],
  "Aggressive marketing": ["world-leading","industry first","revolutionary","innovative","cutting-edge"],
  "Doublespeak": ["while maintaining","balancing growth","economic growth","competitive"]
};

const CATEGORY_COLORS = {
  "Vague terms": { bg: "#f0fdf4", border: "#86efac", text: "#15803d", dot: "#22c55e" },
  "Unverified certifications": { bg: "#fefce8", border: "#fde047", text: "#a16207", dot: "#eab308" },
  "Vague promises": { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8", dot: "#3b82f6" },
  "Dubious claims": { bg: "#fdf4ff", border: "#d8b4fe", text: "#7e22ce", dot: "#a855f7" },
  "Temporal vagueness": { bg: "#fff7ed", border: "#fdba74", text: "#c2410c", dot: "#f97316" },
  "Aggressive marketing": { bg: "#fff1f2", border: "#fda4af", text: "#be123c", dot: "#f43f5e" },
  "Doublespeak": { bg: "#f0fdfa", border: "#5eead4", text: "#0f766e", dot: "#14b8a6" }
};

function countKeywords(text, keywords) {
  const normalized = text.toLowerCase();
  const results = {};
  let total = 0;
  for (const [category, keywordList] of Object.entries(keywords)) {
    for (const keyword of keywordList) {
      const pattern = new RegExp(`\\b${keyword.replace(/[-]/g, "\\$&")}\\b`, "gi");
      const matches = (normalized.match(pattern) || []).length;
      if (matches > 0) {
        results[keyword] = { count: matches, category };
        total += matches;
      }
    }
  }
  return { results, total };
}

function getRiskLevel(score) {
  if (score < 20) return { label: "Low Risk", color: "#22c55e", bg: "#f0fdf4", border: "#86efac", desc: "This document shows minimal greenwashing indicators." };
  if (score < 50) return { label: "Moderate Risk", color: "#eab308", bg: "#fefce8", border: "#fde047", desc: "Some vague terms detected. Review carefully." };
  if (score < 75) return { label: "High Risk", color: "#f97316", bg: "#fff7ed", border: "#fdba74", desc: "Several greenwashing patterns found in this document." };
  return { label: "Very High Risk", color: "#ef4444", bg: "#fef2f2", border: "#fca5a5", desc: "Strong greenwashing indicators throughout the document." };
}

export default function GreenwashingDetector() {
  const [text, setText] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState("input");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [keywords, setKeywords] = useState(JSON.parse(JSON.stringify(DEFAULT_GREENWASHING_KEYWORDS)));
  const [newKeywordCategory, setNewKeywordCategory] = useState("");
  const [newKeywordValue, setNewKeywordValue] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const extractPDF = async (file) => {
    setDocumentName(file.name.replace(".pdf", ""));
    setFileName(file.name);
    setLoading(true);
    setText("");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(" ") + "\n";
      }
      setText(fullText);
    } catch (err) {
      alert("Error reading PDF: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (file) extractPDF(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") extractPDF(file);
  }, []);

  const analyze = useCallback(() => {
    if (!text.trim()) return;
    const { results, total } = countKeywords(text, keywords);
    const uniqueKeywords = Object.keys(results).length;
    const riskScore = Math.min(100, total * 5 + uniqueKeywords * 3);
    const risk = getRiskLevel(riskScore);
    const sorted = Object.entries(results).sort((a, b) => b[1].count - a[1].count);
    const byCategory = {};
    for (const [kw, { count, category }] of sorted) {
      if (!byCategory[category]) byCategory[category] = [];
      byCategory[category].push({ keyword: kw, count });
    }
    setReport({ sorted, byCategory, total, uniqueKeywords, riskScore, risk, documentName });
    setActiveTab("report");
  }, [text, documentName, keywords]);

  const reset = () => {
    setText(""); setDocumentName(""); setFileName(null); setReport(null); setActiveTab("input");
  };

  const removeKeyword = (category, keyword) => {
    const updated = { ...keywords };
    updated[category] = updated[category].filter(kw => kw !== keyword);
    if (updated[category].length === 0) delete updated[category];
    setKeywords(updated);
  };

  const addKeyword = () => {
    if (!newKeywordCategory.trim() || !newKeywordValue.trim()) return;
    const cat = newKeywordCategory.trim();
    const kw = newKeywordValue.trim().toLowerCase();
    const updated = { ...keywords };
    if (!updated[cat]) updated[cat] = [];
    if (!updated[cat].includes(kw)) updated[cat].push(kw);
    setKeywords(updated);
    setNewKeywordValue("");
  };

  const exportReport = () => {
    if (!report) return;
    let content = `GREENWASHING ANALYSIS REPORT\n${"=".repeat(50)}\nDocument: ${report.documentName}\nRisk Score: ${report.riskScore}/100 — ${report.risk.label}\nTotal occurrences: ${report.total}\nUnique keywords: ${report.uniqueKeywords}\n\nKEYWORD BREAKDOWN\n${"-".repeat(50)}\n`;
    for (const [kw, { count }] of report.sorted) {
      content += `• '${kw}': ${count}x (${((count / report.total) * 100).toFixed(1)}%)\n`;
    }
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "greenwashing_report.txt";
    a.click();
  };

  const totalKw = Object.values(keywords).flat().length;
  const NAV_ITEMS = [
    { id: "input", label: "Analyze", icon: "📄" },
    { id: "keywords", label: "Keywords", icon: "🔑" },
    { id: "report", label: "Report", icon: "📊" }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 50%, #fdf4ff 100%)", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0f766e 100%)", padding: "48px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -60, left: 60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🌿</div>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>Greenwashing Detector</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 42, fontWeight: 800, margin: "0 0 12px", letterSpacing: -1, lineHeight: 1.1 }}>
            Detect Greenwashing<br /><span style={{ color: "#6ee7b7" }}>in ESG Reports</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, margin: "0 0 32px", maxWidth: 500 }}>
            Upload any ESG report and instantly detect greenwashing patterns using keyword analysis.
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ n: totalKw, l: "Keywords" }, { n: Object.keys(keywords).length, l: "Categories" }, { n: "100%", l: "Free" }].map(({ n, l }) => (
              <div key={l}>
                <div style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}>{n}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "-28px auto 0", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 6, display: "inline-flex", gap: 4, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
              background: activeTab === id ? "linear-gradient(135deg, #064e3b, #0f766e)" : "transparent",
              color: activeTab === id ? "#fff" : "#6b7280",
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span> {label}
              {id === "report" && report && (
                <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "2px 8px", fontSize: 11 }}>{report.riskScore}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 24px 48px" }}>
        {activeTab === "input" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
            <div>
              <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                style={{ background: dragOver ? "#ecfdf5" : "#fff", border: `2px dashed ${dragOver ? "#059669" : "#d1fae5"}`, borderRadius: 20, padding: 48, textAlign: "center", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                {loading ? (
                  <div><div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div><p style={{ color: "#059669", fontWeight: 600 }}>Extracting text...</p></div>
                ) : fileName && text ? (
                  <div>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                    <p style={{ color: "#059669", fontWeight: 700, fontSize: 16, margin: "0 0 4px" }}>{fileName}</p>
                    <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 20px" }}>{Math.round(text.length / 1000)}k characters extracted</p>
                    <button onClick={reset} style={{ background: "none", border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 16px", color: "#6b7280", cursor: "pointer", fontSize: 13 }}>Remove & Upload New</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>📂</div>
                    <p style={{ color: "#111827", fontWeight: 700, fontSize: 18, margin: "0 0 8px" }}>Drop your PDF here</p>
                    <p style={{ color: "#9ca3af", fontSize: 14, margin: "0 0 20px" }}>or click to browse files</p>
                    <label style={{ display: "inline-block", background: "linear-gradient(135deg, #064e3b, #0f766e)", color: "#fff", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                      Choose PDF <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: "none" }} />
                    </label>
                  </div>
                )}
              </div>
              {text && !loading && (
                <button onClick={analyze} style={{ marginTop: 16, width: "100%", background: "linear-gradient(135deg, #064e3b, #0f766e)", color: "#fff", border: "none", borderRadius: 14, padding: "16px", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 16px rgba(6,78,59,0.3)" }}>
                  <span>🔍</span> Analyze for Greenwashing
                </button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#111827", textTransform: "uppercase", letterSpacing: 1 }}>How it works</h3>
                {[{ n: "1", t: "Upload PDF", d: "Drop any ESG or sustainability report" }, { n: "2", t: "Keyword scan", d: `${totalKw} greenwashing terms analyzed` }, { n: "3", t: "Risk score", d: "Get an instant 0–100 risk assessment" }, { n: "4", t: "Export", d: "Download detailed report as .txt" }].map(({ n, t, d }) => (
                  <div key={n} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#15803d", flexShrink: 0 }}>{n}</div>
                    <div><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{t}</p><p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{d}</p></div>
                  </div>
                ))}
              </div>
              <div style={{ background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)", border: "1px solid #a7f3d0", borderRadius: 16, padding: 20 }}>
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#065f46" }}>💡 Did you know?</p>
                <p style={{ margin: 0, fontSize: 12, color: "#047857", lineHeight: 1.6 }}>Over 40% of green claims made online are exaggerated, false, or deceptive.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "keywords" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#111827" }}>Add Custom Keyword</h3>
              <div style={{ display: "flex", gap: 10 }}>
                <select value={newKeywordCategory} onChange={e => setNewKeywordCategory(e.target.value)} style={{ flex: 1, padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 10, fontFamily: "inherit", fontSize: 14, background: "#f9fafb" }}>
                  <option value="">Select category...</option>
                  {Object.keys(keywords).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input placeholder="New keyword..." value={newKeywordValue} onChange={e => setNewKeywordValue(e.target.value)} onKeyDown={e => e.key === "Enter" && addKeyword()} style={{ flex: 1, padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 10, fontFamily: "inherit", fontSize: 14 }} />
                <button onClick={addKeyword} style={{ background: "linear-gradient(135deg, #064e3b, #0f766e)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontFamily: "inherit", fontWeight: 700, cursor: "pointer" }}>+ Add</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {Object.entries(keywords).map(([cat, kws]) => {
                const colors = CATEGORY_COLORS[cat] || { bg: "#f9fafb", border: "#e5e7eb", text: "#374151", dot: "#9ca3af" };
                return (
                  <div key={cat} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.dot }} />
                        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827" }}>{cat}</h3>
                      </div>
                      <span style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{kws.length}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {kws.map(kw => (
                        <div key={kw} style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "4px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: colors.text }}>{kw}</span>
                          <button onClick={() => removeKeyword(cat, kw)} style={{ background: "none", border: "none", color: colors.text, cursor: "pointer", padding: 0, fontSize: 13, opacity: 0.6 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <button onClick={() => setKeywords(JSON.parse(JSON.stringify(DEFAULT_GREENWASHING_KEYWORDS)))} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 16px", color: "#6b7280", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>↺ Reset to Default</button>
            </div>
          </div>
        )}

        {activeTab === "report" && (
          <div>
            {!report ? (
              <div style={{ textAlign: "center", padding: "80px 24px", background: "#fff", borderRadius: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📊</div>
                <p style={{ color: "#111827", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>No report yet</p>
                <p style={{ color: "#9ca3af", fontSize: 14, margin: "0 0 20px" }}>Upload a PDF and run an analysis to see results here</p>
                <button onClick={() => setActiveTab("input")} style={{ background: "linear-gradient(135deg, #064e3b, #0f766e)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontFamily: "inherit", fontWeight: 600, cursor: "pointer" }}>Go to Analyze</button>
              </div>
            ) : (
              <>
                <div style={{ background: `linear-gradient(135deg, ${report.risk.bg}, #fff)`, border: `1px solid ${report.risk.border}`, borderRadius: 20, padding: 32, marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Document Analyzed</p>
                      <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#111827" }}>{report.documentName}</h2>
                      <p style={{ margin: 0, fontSize: 14, color: "#6b7280", maxWidth: 400 }}>{report.risk.desc}</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 56, fontWeight: 900, color: report.risk.color, lineHeight: 1 }}>{report.riskScore}</div>
                      <div style={{ fontSize: 13, color: "#9ca3af" }}>/ 100</div>
                      <div style={{ background: report.risk.bg, border: `1px solid ${report.risk.border}`, color: report.risk.color, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, marginTop: 6 }}>{report.risk.label}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 24 }}>
                    <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${report.riskScore}%`, background: `linear-gradient(90deg, #22c55e, ${report.risk.color})`, borderRadius: 4 }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20 }}>
                    {[{ v: report.total, l: "Total occurrences" }, { v: report.uniqueKeywords, l: "Unique keywords" }, { v: Object.keys(report.byCategory).length, l: "Categories flagged" }].map(({ v, l }) => (
                      <div key={l} style={{ background: "rgba(255,255,255,0.7)", borderRadius: 12, padding: "12px 16px" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>{v}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                  {Object.entries(report.byCategory).map(([cat, kws]) => {
                    const colors = CATEGORY_COLORS[cat] || { bg: "#f9fafb", border: "#e5e7eb", text: "#374151", dot: "#9ca3af" };
                    const catTotal = kws.reduce((s, k) => s + k.count, 0);
                    return (
                      <div key={cat} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors.dot }} />
                          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827", flex: 1 }}>{cat}</h3>
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>{catTotal}x</span>
                        </div>
                        {kws.map(({ keyword, count }) => {
                          const pct = Math.round((count / report.total) * 100);
                          return (
                            <div key={keyword} style={{ marginBottom: 8 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                <span style={{ fontSize: 12, color: "#374151" }}>'{keyword}'</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{count}x</span>
                              </div>
                              <div style={{ height: 4, background: "#f3f4f6", borderRadius: 2 }}>
                                <div style={{ height: "100%", width: `${Math.min(100, pct * 3)}%`, background: colors.dot, borderRadius: 2 }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
                <button onClick={exportReport} style={{ background: "linear-gradient(135deg, #064e3b, #0f766e)", color: "#fff", border: "none", borderRadius: 14, padding: "14px 32px", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 16px rgba(6,78,59,0.3)" }}>
                  <span>⬇</span> Export Full Report
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}