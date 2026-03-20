import { useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const INDICATORS = {
  A1_Energy_Use: { label: "Energy Use", category: "A", num: 1, desc: "Measures how thoroughly the company reports its energy consumption, efficiency, and mix (renewable vs fossil).", keywords: ["energy consumption","energy use","energy intensity","renewable energy","energy efficiency","fuel consumption","electricity consumption","gigajoules","megawatt","kwh","energy mix","low-carbon energy"] },
  A2_Water_Use: { label: "Water Use", category: "A", num: 2, desc: "Evaluates disclosure on water withdrawal, recycling, stress management and wastewater.", keywords: ["water consumption","water use","water withdrawal","water discharge","water intensity","water stress","freshwater","wastewater","water recycling","water management"] },
  A3_Land_Use: { label: "Land Use", category: "A", num: 3, desc: "Covers biodiversity, deforestation, habitat protection and land restoration commitments.", keywords: ["land use","land disturbance","biodiversity","ecosystem","habitat","deforestation","land restoration","nature-based","soil","land management"] },
  A4_General_Emissions: { label: "General Emissions", category: "A", num: 4, desc: "Assesses overall GHG emissions disclosure including carbon footprint and net zero framing.", keywords: ["greenhouse gas","ghg emissions","carbon emissions","co2","carbon footprint","emissions reduction","net zero","carbon neutral","emissions intensity","absolute emissions"] },
  A5_Scope1: { label: "Scope 1", category: "A", num: 5, desc: "Direct emissions from owned or controlled sources (combustion, fugitive emissions).", keywords: ["scope 1","direct emissions","direct ghg","combustion emissions","fugitive emissions","scope 1 emissions","operated emissions"] },
  A6_Scope2: { label: "Scope 2", category: "A", num: 6, desc: "Indirect emissions from purchased electricity and energy. Market-based vs location-based reporting.", keywords: ["scope 2","indirect emissions","purchased electricity","market-based","location-based","scope 2 emissions","energy indirect"] },
  A7_Scope3: { label: "Scope 3", category: "A", num: 7, desc: "⚠️ KEY INDICATOR — Value chain emissions (upstream + downstream). Often omitted by brown firms to hide true climate impact.", keywords: ["scope 3","value chain emissions","upstream emissions","downstream emissions","supply chain emissions","scope 3 emissions","product use emissions","financed emissions"] },
  A8_Targets: { label: "Target Setting", category: "A", num: 8, desc: "Science-based targets, Paris alignment, 1.5°C commitments and interim milestones.", keywords: ["emission target","net zero target","carbon target","reduction target","climate target","paris agreement","1.5 degree","science-based target","sbti","2030 target","2050 target"] },
  A9_Physical_Risk: { label: "Physical Risk", category: "A", num: 9, desc: "Exposure of assets to physical climate hazards: floods, heat stress, sea level rise.", keywords: ["physical risk","asset location","vulnerable assets","flood risk","climate hazard","extreme weather","sea level","heat stress","geographic exposure","asset exposure"] },
  B10_Revenues: { label: "Revenues", category: "B", num: 10, desc: "How climate change affects revenue streams — green product demand, carbon pricing, market shifts.", keywords: ["revenue impact","revenue risk","green revenue","climate revenue","sales impact","demand impact","market shift","low-carbon products","sustainable products","revenue stream"] },
  B11_Expenditures: { label: "Expenditures", category: "B", num: 11, desc: "Climate-related CAPEX and OPEX — green investments, R&D, transition spending.", keywords: ["capital expenditure","capex","opex","operating expenditure","climate expenditure","green investment","low-carbon investment","clean technology","transition expenditure"] },
  B12_Assets: { label: "Assets & Liabilities", category: "B", num: 12, desc: "Stranded asset risk, impairments, write-downs and climate-related balance sheet exposure.", keywords: ["stranded asset","asset impairment","asset write-down","asset valuation","balance sheet","climate liability","decommissioning","asset retirement","asset risk","liabilities"] },
  B13_Capital: { label: "Capital & Financing", category: "B", num: 13, desc: "⚠️ KEY INDICATOR — Green bonds, sustainability-linked financing, cost of capital impacts. Low scores suggest disconnect between climate narrative and financial planning.", keywords: ["green bond","sustainability-linked","climate financing","capital allocation","transition finance","cost of capital","financing risk","credit rating","debt financing","capital structure"] },
  C14_Energy_Theme: { label: "Energy Theme", category: "C", num: 14, desc: "Thematic depth on energy transition, electrification, decarbonisation strategy.", keywords: ["energy transition","clean energy","low-carbon energy","renewable","energy security","decarbonisation","electrification"] },
  C15_Governance: { label: "Governance", category: "C", num: 15, desc: "Board oversight of climate, executive remuneration linked to ESG, climate committees.", keywords: ["board oversight","climate governance","executive remuneration","governance framework","board responsibility","climate committee","incentive structure","management responsibility"] },
  C16_Human_Rights: { label: "Human Rights & Safety", category: "C", num: 16, desc: "Labour rights, worker welfare, just transition, community impact and supply chain social standards.", keywords: ["human rights","employee safety","health and safety","labour rights","community impact","social impact","worker welfare","just transition","fair labour","supply chain labour"] },
  C17_Risk_Mgmt: { label: "Climate Risk Mgmt", category: "C", num: 17, desc: "⚠️ KEY INDICATOR — TCFD framework, scenario analysis, stress testing. Low scores indicate shallow climate risk integration.", keywords: ["risk management","climate risk framework","risk identification","risk assessment","risk mitigation","scenario analysis","stress testing","tcfd","task force","climate risk process"] },
  C18_Emissions_Theme: { label: "Emissions Theme", category: "C", num: 18, desc: "Quality of emissions reporting methodology — GHG protocol, emission factors, monitoring systems.", keywords: ["emission reporting","carbon accounting","ghg protocol","emission factor","emissions data","carbon disclosure","monitoring"] },
  C19_GRI: { label: "GRI & Materiality", category: "C", num: 19, desc: "Alignment with global standards: GRI, SASB, ISSB, CSRD, double materiality assessment.", keywords: ["gri","global reporting initiative","materiality assessment","material topic","stakeholder engagement","double materiality","reporting framework","disclosure standard","sasb","issb","csrd"] },
};

const CAT_COLORS = { A: "#059669", B: "#3b82f6", C: "#8b5cf6" };
const CAT_BG = { A: "#ecfdf5", B: "#eff6ff", C: "#f5f3ff" };
const CAT_LABELS = { A: "Category A — Climate Metrics", B: "Category B — Financial Impact", C: "Category C — Thematic Depth" };
const CAT_DESC = {
  A: "9 indicators measuring quantitative climate data: energy, water, land, emissions (Scope 1/2/3), targets and physical risk exposure.",
  B: "4 indicators measuring how climate change translates into financial impacts on revenues, costs, assets and financing.",
  C: "6 indicators measuring thematic depth: governance quality, human rights, risk management frameworks and reporting standards."
};

const COMPANY_COLORS = ["#E8431A","#2196F3","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F06292","#795548"];

function getScoreLabel(score) {
  if (score === 0) return { label: "Absent", color: "#d1d5db", bg: "#f9fafb" };
  if (score < 0.3) return { label: "Superficial", color: "#f97316", bg: "#fff7ed" };
  if (score < 0.6) return { label: "Partial", color: "#eab308", bg: "#fefce8" };
  if (score < 0.8) return { label: "Good", color: "#3b82f6", bg: "#eff6ff" };
  return { label: "Strong", color: "#059669", bg: "#ecfdf5" };
}

function analyzeText(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [id, { keywords }] of Object.entries(INDICATORS)) {
    let hits = 0;
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) hits++;
    }
    scores[id] = hits < 2 ? 0 : Math.round((hits / keywords.length) * 1000) / 1000;
  }
  return scores;
}

export default function NLPSimulator() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeChart, setActiveChart] = useState("heatmap");
  const [dragOver, setDragOver] = useState(false);
  const [hoveredIndicator, setHoveredIndicator] = useState(null);

  const extractAndAnalyze = async (file) => {
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(" ") + "\n";
      }
      const scores = analyzeText(fullText);
      const name = file.name.replace(".pdf", "").replace(/[-_]/g, " ");
      setCompanies(prev => [...prev, { name, scores, color: COMPANY_COLORS[prev.length % COMPANY_COLORS.length] }]);
    } catch (err) {
      alert("Error reading PDF: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = useCallback(async (files) => {
    for (const file of Array.from(files)) {
      if (file.type === "application/pdf") await extractAndAnalyze(file);
    }
  }, [companies]);

  const removeCompany = (idx) => setCompanies(prev => prev.filter((_, i) => i !== idx));

  const radarData = ["A", "B", "C"].map(cat => {
    const catIndicators = Object.entries(INDICATORS).filter(([, v]) => v.category === cat);
    const point = { subject: CAT_LABELS[cat].replace("Category " + cat + " — ", "") };
    for (const company of companies) {
      const avg = catIndicators.reduce((s, [id]) => s + Number(company.scores[id] || 0), 0) / catIndicators.length;
      point[company.name] = Math.round(avg * 1000) / 1000;
    }
    return point;
  });

  const spotlightData = ["A7_Scope3", "B13_Capital", "C17_Risk_Mgmt"].map(id => {
    const point = { name: INDICATORS[id].label };
    for (const company of companies) {
      point[company.name] = Number(company.scores[id] || 0);
    }
    return point;
  });

  const layeredData = ["A", "B", "C"].map((cat, i) => {
    const catIndicators = Object.entries(INDICATORS).filter(([, v]) => v.category === cat);
    const point = { layer: `Layer ${i + 1} — ${CAT_LABELS[cat].split("— ")[1]}` };
    for (const company of companies) {
      const avg = catIndicators.reduce((s, [id]) => s + Number(company.scores[id] || 0), 0) / catIndicators.length;
      point[company.name] = Math.round(avg * 1000) / 1000;
    }
    return point;
  });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #ecfdf5 100%)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #4f46e5 100%)", padding: "48px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -60, left: 60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ maxWidth: 960, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📊</div>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>NLP Simulator</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 42, fontWeight: 800, margin: "0 0 12px", letterSpacing: -1, lineHeight: 1.1 }}>
            Ping An 19-Indicator<br /><span style={{ color: "#93c5fd" }}>ESG Analyser</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, margin: "0 0 32px", maxWidth: 520 }}>
            Upload ESG reports and compare companies across Ping An's 19 disclosure indicators. Scores reveal what's really in the report — not just what looks good on the cover.
          </p>
          <div style={{ display: "flex", gap: 32 }}>
            {[{ n: 19, l: "Indicators" }, { n: 3, l: "Categories" }, { n: companies.length, l: "Reports loaded" }].map(({ n, l }) => (
              <div key={l}>
                <div style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>{n}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 48px" }}>

        {/* How scores work */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #e0e7ff" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#1e40af" }}>📖 How scores work</h3>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
            Each indicator is scored <strong>0 to 1</strong> based on keyword coverage in the report. The algorithm counts how many of the indicator's specific keywords appear in the document. A minimum of 2 keyword hits is required before a non-zero score is assigned — this filters out accidental mentions.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {[
              { score: "0.00", label: "Absent", color: "#d1d5db", bg: "#f9fafb", desc: "Topic not covered or only 1 keyword found" },
              { score: "0.01–0.30", label: "Superficial", color: "#f97316", bg: "#fff7ed", desc: "Briefly mentioned, no depth" },
              { score: "0.31–0.60", label: "Partial", color: "#eab308", bg: "#fefce8", desc: "Some coverage but gaps remain" },
              { score: "0.61–0.80", label: "Good", color: "#3b82f6", bg: "#eff6ff", desc: "Solid disclosure with most key elements" },
              { score: "0.81–1.00", label: "Strong", color: "#059669", bg: "#ecfdf5", desc: "Comprehensive, detailed coverage" },
            ].map(({ score, label, color, bg, desc }) => (
              <div key={label} style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 12, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 4 }}>{score}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category explanations */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          {Object.entries(CAT_LABELS).map(([cat, label]) => (
            <div key={cat} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", borderTop: `3px solid ${CAT_COLORS[cat]}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, background: CAT_BG[cat], border: `1px solid ${CAT_COLORS[cat]}44`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: CAT_COLORS[cat] }}>{cat}</div>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{label.split("— ")[1]}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{CAT_DESC[cat]}</p>
            </div>
          ))}
        </div>

        {/* Upload zone */}
        <div
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          style={{ background: dragOver ? "#eff6ff" : "#fff", border: `2px dashed ${dragOver ? "#3b82f6" : "#bfdbfe"}`, borderRadius: 20, padding: 36, textAlign: "center", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          {loading ? (
            <div><div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div><p style={{ color: "#3b82f6", fontWeight: 600, margin: 0 }}>Analyzing PDF...</p></div>
          ) : (
            <div>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
              <p style={{ color: "#111827", fontWeight: 700, fontSize: 16, margin: "0 0 6px" }}>Drop PDF reports here</p>
              <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 16px" }}>Upload multiple companies to compare them side by side</p>
              <label style={{ display: "inline-block", background: "linear-gradient(135deg, #1e40af, #4f46e5)", color: "#fff", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                Choose PDFs
                <input type="file" accept=".pdf" multiple onChange={(e) => handleFiles(e.target.files)} style={{ display: "none" }} />
              </label>
            </div>
          )}
        </div>

        {/* Loaded companies pills */}
        {companies.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
            {companies.map((c, i) => (
              <div key={i} style={{ background: "#fff", border: `2px solid ${c.color}`, borderRadius: 10, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{c.name}</span>
                <button onClick={() => removeCompany(i)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 16, padding: 0 }}>✕</button>
              </div>
            ))}
          </div>
        )}

        {companies.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📈</div>
            <p style={{ color: "#111827", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>No reports loaded yet</p>
            <p style={{ color: "#9ca3af", fontSize: 14 }}>Upload ESG PDF reports above to start comparing companies</p>
          </div>
        ) : (
          <>
            {/* Chart tabs */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 6, display: "inline-flex", gap: 4, marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              {[
                { id: "heatmap", label: "📋 Heatmap" },
                { id: "radar", label: "🕸️ Radar" },
                { id: "spotlight", label: "🔦 Spotlight" },
                { id: "layered", label: "📈 Layered" }
              ].map(({ id, label }) => (
                <button key={id} onClick={() => setActiveChart(id)} style={{
                  padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                  background: activeChart === id ? "linear-gradient(135deg, #1e40af, #4f46e5)" : "transparent",
                  color: activeChart === id ? "#fff" : "#6b7280",
                }}>
                  {label}
                </button>
              ))}
            </div>

            {/* HEATMAP */}
            {activeChart === "heatmap" && (
              <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#111827" }}>All 19 Indicators — Coverage Heatmap</h3>
                <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6b7280" }}>Hover over an indicator name to see what it measures. Green = strong coverage, red/orange = weak or absent.</p>

                {["A", "B", "C"].map(cat => (
                  <div key={cat} style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "8px 12px", background: CAT_BG[cat], borderRadius: 10, borderLeft: `4px solid ${CAT_COLORS[cat]}` }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: CAT_COLORS[cat] }}>{CAT_LABELS[cat]}</span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", padding: "6px 12px", color: "#9ca3af", fontWeight: 600, borderBottom: "1px solid #f3f4f6", width: 40 }}>#</th>
                          <th style={{ textAlign: "left", padding: "6px 12px", color: "#9ca3af", fontWeight: 600, borderBottom: "1px solid #f3f4f6" }}>Indicator</th>
                          {companies.map((c, i) => (
                            <th key={i} style={{ textAlign: "center", padding: "6px 16px", color: c.color, fontWeight: 700, borderBottom: "1px solid #f3f4f6", whiteSpace: "nowrap" }}>{c.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(INDICATORS).filter(([, v]) => v.category === cat).map(([id, { label, num, desc }], rowIdx) => (
                          <tr key={id}
                            onMouseEnter={() => setHoveredIndicator(id)}
                            onMouseLeave={() => setHoveredIndicator(null)}
                            style={{ background: hoveredIndicator === id ? "#f8faff" : rowIdx % 2 === 0 ? "#fafafa" : "#fff", cursor: "default" }}>
                            <td style={{ padding: "10px 12px", color: "#9ca3af", fontWeight: 600, fontSize: 11 }}>{num}</td>
                            <td style={{ padding: "10px 12px" }}>
                              <div style={{ fontWeight: 600, color: "#374151", fontSize: 13 }}>{label}</div>
                              {hoveredIndicator === id && (
                                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4, maxWidth: 300, lineHeight: 1.5 }}>{desc}</div>
                              )}
                            </td>
                            {companies.map((c, i) => {
                              const score = Number(c.scores[id] || 0);
                              const { label: sl, color, bg } = getScoreLabel(score);
                              return (
                                <td key={i} style={{ padding: "10px 16px", textAlign: "center" }}>
                                  <div style={{ background: bg, border: `1px solid ${color}44`, borderRadius: 8, padding: "4px 8px", display: "inline-block", minWidth: 60 }}>
                                    <div style={{ fontWeight: 800, color, fontSize: 13 }}>{score.toFixed(2)}</div>
                                    <div style={{ fontSize: 10, color, opacity: 0.8 }}>{sl}</div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}

                {/* Score legend */}
                <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16, marginTop: 8 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#9ca3af" }}>SCORE LEGEND</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {[
                      { score: "0.00", label: "Absent", color: "#d1d5db", bg: "#f9fafb" },
                      { score: "0.01–0.30", label: "Superficial", color: "#f97316", bg: "#fff7ed" },
                      { score: "0.31–0.60", label: "Partial", color: "#eab308", bg: "#fefce8" },
                      { score: "0.61–0.80", label: "Good", color: "#3b82f6", bg: "#eff6ff" },
                      { score: "0.81–1.00", label: "Strong", color: "#059669", bg: "#ecfdf5" },
                    ].map(({ score, label, color, bg }) => (
                      <div key={label} style={{ background: bg, border: `1px solid ${color}44`, borderRadius: 8, padding: "4px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 800, color, fontSize: 12 }}>{score}</span>
                        <span style={{ fontSize: 12, color }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RADAR */}
            {activeChart === "radar" && (
              <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#111827" }}>Category Comparison — Radar Chart</h3>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6b7280" }}>Each axis shows the <strong>average score</strong> across all indicators in that category (0 = no disclosure, 1 = full disclosure). A balanced, large polygon = comprehensive ESG reporting.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {Object.entries(CAT_LABELS).map(([cat, label]) => (
                    <div key={cat} style={{ background: CAT_BG[cat], borderRadius: 10, padding: "10px 14px", borderLeft: `3px solid ${CAT_COLORS[cat]}` }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: CAT_COLORS[cat] }}>{label}</div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>{CAT_DESC[cat].split(":")[0]}</div>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={380}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 600 }} />
                    {companies.map((c, i) => (
                      <Radar key={i} name={c.name} dataKey={c.name} stroke={c.color} fill={c.color} fillOpacity={0.15} strokeWidth={2} />
                    ))}
                    <Tooltip formatter={(v) => [v.toFixed(3), ""]} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
                <p style={{ margin: "16px 0 0", fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
                  💡 A company scoring high on Category A but low on B and C is likely disclosing climate metrics without connecting them to financial planning — a classic greenwashing pattern.
                </p>
              </div>
            )}

            {/* SPOTLIGHT */}
            {activeChart === "spotlight" && (
              <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#111827" }}>🔦 Greenwashing Spotlight</h3>
                <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6b7280" }}>Ping An's research identifies these 3 indicators as the most revealing for detecting greenwashing. Brown firms (fossil fuel, heavy industry) tend to score high on general emissions but low on these three.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
                  {[
                    { id: "A7_Scope3", emoji: "🌍", why: "Scope 3 covers 70–90% of total emissions for most companies. Omitting it dramatically understates the true climate impact." },
                    { id: "B13_Capital", emoji: "💰", why: "If climate strategy doesn't connect to financing decisions, it's likely a narrative exercise rather than a real transition plan." },
                    { id: "C17_Risk_Mgmt", emoji: "⚠️", why: "TCFD scenario analysis requires companies to model actual financial exposure to climate risk. Low scores = shallow risk integration." },
                  ].map(({ id, emoji, why }) => (
                    <div key={id} style={{ background: "#fafafa", borderRadius: 14, padding: 16, border: "1px solid #f3f4f6" }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 6 }}>{INDICATORS[id].label}</div>
                      <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.6 }}>{why}</div>
                      {companies.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          {companies.map((c, i) => {
                            const score = Number(c.scores[id] || 0);
                            const { label, color, bg } = getScoreLabel(score);
                            return (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                <span style={{ fontSize: 11, color: c.color, fontWeight: 600 }}>{c.name}</span>
                                <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "2px 8px" }}>{score.toFixed(2)} — {label}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={spotlightData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                    <YAxis domain={[0, 1]} tickFormatter={v => v.toFixed(1)} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [v.toFixed(3), ""]} />
                    <Legend />
                    {companies.map((c, i) => (
                      <Bar key={i} dataKey={c.name} fill={c.color} radius={[6, 6, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* LAYERED */}
            {activeChart === "layered" && (
              <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#111827" }}>📈 Layered Differentiation</h3>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6b7280" }}>
                  This is the <strong>key thesis chart</strong>. Traditional ESG ratings often rank companies similarly. Adding more analytical layers (A → B → C) reveals divergence invisible to standard ratings.
                </p>
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 14, marginBottom: 20 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
                    💡 <strong>What to look for:</strong> Companies that score high on Layer 1 (Climate Metrics) but drop sharply on Layer 2 (Financial Impact) or Layer 3 (Thematic Depth) are likely engaging in surface-level ESG disclosure without structural commitment.
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={layeredData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <XAxis dataKey="layer" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 1]} tickFormatter={v => v.toFixed(1)} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [v.toFixed(3), ""]} />
                    <Legend />
                    {companies.map((c, i) => (
                      <Bar key={i} dataKey={c.name} fill={c.color} radius={[6, 6, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20 }}>
                  {[
                    { cat: "A", l: "Layer 1 — Climate Metrics", d: "9 indicators. Broad disclosure of climate data. Most companies score relatively well here as it's the standard expectation.", color: CAT_COLORS.A, bg: CAT_BG.A },
                    { cat: "B", l: "Layer 2 — Financial Impact", d: "4 indicators. Connects climate to financial planning. Differentiates companies with real transition strategies.", color: CAT_COLORS.B, bg: CAT_BG.B },
                    { cat: "C", l: "Layer 3 — Thematic Depth", d: "6 indicators. Governance quality, risk frameworks, global standards alignment. Reveals institutional seriousness.", color: CAT_COLORS.C, bg: CAT_BG.C },
                  ].map(({ l, d, color, bg }) => (
                    <div key={l} style={{ background: bg, borderLeft: `3px solid ${color}`, borderRadius: 10, padding: 14 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "#111827" }}>{l}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}