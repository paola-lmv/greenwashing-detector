import { useState } from "react";
import GreenwashingDetector from "./GreenwashingDetector";
import NLPSimulator from "./NLPSimulator";
import AboutSection from "./AboutSection";
import './App.css'

export default function App() {
  const [activePage, setActivePage] = useState("greenwashing");

  return (
    <div>
      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e5e7eb",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 60
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🌿</span>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#064e3b", fontFamily: "Inter, system-ui, sans-serif" }}>
            ESG Intelligence
          </span>
        </div>

        <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 10, padding: 4 }}>
          {[
            { id: "greenwashing", label: "🔍 Greenwashing Detector" },
            { id: "nlp", label: "📊 NLP Simulator" },
            { id: "about", label: "🎓 About" }
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setActivePage(id)} style={{
              padding: "8px 18px", borderRadius: 8, border: "none",
              fontFamily: "Inter, system-ui, sans-serif", fontSize: 14, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
              background: activePage === id ? "#064e3b" : "transparent",
              color: activePage === id ? "#fff" : "#6b7280",
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ width: 160 }} />
      </nav>

      <div style={{ paddingTop: 60 }}>
        {activePage === "greenwashing" && <GreenwashingDetector />}
        {activePage === "nlp" && <NLPSimulator />}
        {activePage === "about" && <AboutPage />}
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #f5f3ff 100%)", fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #064e3b 100%)", padding: "48px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -60, left: 60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ maxWidth: 960, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🎓</div>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>Research Report</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 42, fontWeight: 800, margin: "0 0 12px", letterSpacing: -1, lineHeight: 1.1 }}>
            About this<br /><span style={{ color: "#6ee7b7" }}>ESG Intelligence Platform</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, margin: 0, maxWidth: 520 }}>
            Built entirely by our research group — with AI — to answer one of modern finance's hardest questions.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 64px" }}>

        {/* Core question */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 32, marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", borderLeft: "4px solid #064e3b" }}>
          <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#064e3b", textTransform: "uppercase", letterSpacing: 2 }}>Core Research Question</p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827", lineHeight: 1.7, fontStyle: "italic" }}>
            "As an active investor, can I trust ESG metrics to inform my stock-picking and disclosure — and if not, what should I use instead?"
          </p>
        </div>

        {/* Three layers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          {[
            {
              num: "01", title: "Diagnostic Layer",
              question: "Do ESG metrics actually measure what they claim?",
              answer: "Per Berg et al., the answer is poorly and inconsistently. Ratings from MSCI, Sustainalytics and others diverge significantly for the same company — correlation as low as 0.38.",
              color: "#ef4444", bg: "#fef2f2", border: "#fca5a5", icon: "🔬"
            },
            {
              num: "02", title: "Problem Layer",
              question: "Are the distortions random or systematic?",
              answer: "If random, they're just noise. But if systematic — meaning firms can deliberately game them — relying on ESG ratings exposes investors to greenwashing risk and capital misallocation.",
              color: "#f97316", bg: "#fff7ed", border: "#fdba74", icon: "⚠️"
            },
            {
              num: "03", title: "Solution & Payoff Layer",
              question: "Can better tools resolve this and create alpha?",
              answer: "If most of the market uses flawed ratings, a manager with better NLP-based tools has an informational edge. This is where the active investor framing really bites.",
              color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: "💡"
            },
          ].map(({ num, title, question, answer, color, bg, border, icon }) => (
            <div key={num} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color, letterSpacing: 2 }}>{num}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color }}>{title}</div>
                </div>
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#111827", lineHeight: 1.5 }}>{question}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.7 }}>{answer}</p>
            </div>
          ))}
        </div>

        {/* Why we built this */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#111827" }}>Why we built these tools</h3>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "#374151", lineHeight: 1.8 }}>
            Standard ESG ratings give a single score that obscures more than it reveals. To actually answer our research question, we needed <strong>proxies</strong> — measurable, transparent signals that go deeper than a Bloomberg ESG score. These two tools are exactly that: purpose-built instruments designed to produce the numerical evidence our report required, fully coded by the group using AI-assisted development.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              {
                icon: "🌿", color: "#064e3b", bg: "#ecfdf5", border: "#a7f3d0",
                title: "Greenwashing Detector",
                subtitle: "Linguistic proxy for greenwashing intent",
                desc: "By counting how often a company uses vague, unverifiable, or temporally evasive language in its ESG disclosures, we flag documents where rhetoric outpaces substance. This gives us a quantitative greenwashing risk score — a proxy that no standard ESG rating provides.",
                points: ["40+ greenwashing keywords across 7 categories", "0–100 risk score per document", "Detects vague promises, dubious claims, doublespeak"]
              },
              {
                icon: "📊", color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe",
                title: "NLP Simulator",
                subtitle: "Disclosure depth proxy — Ping An 19 Indicators",
                desc: "Rather than trusting a rating agency's black box, we directly measure keyword coverage across 19 TCFD-aligned indicators to produce our own transparency score. Inspired by Ping An's ESG framework, this tool reveals what's actually in the report vs what sounds good on the cover.",
                points: ["19 indicators across 3 analytical layers (A, B, C)", "Scores 0–1 per indicator per company", "Spotlight on 3 key greenwashing signals: Scope 3, Capital & Financing, Climate Risk Mgmt"]
              }
            ].map(({ icon, color, bg, border, title, subtitle, desc, points }) => (
              <div key={title} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color }}>{title}</p>
                    <p style={{ margin: 0, fontSize: 11, color: color + "99" }}>{subtitle}</p>
                  </div>
                </div>
                <p style={{ margin: "0 0 14px", fontSize: 12, color: "#374151", lineHeight: 1.7 }}>{desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {points.map(p => (
                    <div key={p} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ width: 16, height: 16, background: color + "22", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <div style={{ width: 6, height: 6, background: color, borderRadius: "50%" }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#374151" }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology note */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#111827" }}>Methodology & limitations</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { icon: "✅", title: "What these tools do well", items: ["Produce reproducible, transparent scores", "Remove rating agency subjectivity", "Detect disclosure gaps invisible to standard ratings", "Compare companies directly on the same framework"] },
              { icon: "⚠️", title: "Known limitations", items: ["Keyword matching ≠ semantic understanding", "A company can mention 'Scope 3' without disclosing real data", "PDF extraction quality varies by document format", "Not a substitute for fundamental financial analysis"] },
            ].map(({ icon, title, items }) => (
              <div key={title} style={{ background: "#f9fafb", borderRadius: 12, padding: 16 }}>
                <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#111827" }}>{icon} {title}</p>
                {items.map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 4, height: 4, background: "#9ca3af", borderRadius: "50%", flexShrink: 0, marginTop: 7 }} />
                    <span style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={{ background: "linear-gradient(135deg, #064e3b, #1e40af)", borderRadius: 20, padding: 28, boxShadow: "0 4px 20px rgba(6,78,59,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>👥</span>
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>Built by the group — powered by AI</p>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Imperial College — Finance Research Report</p>
            </div>
          </div>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}>
            This platform was designed, coded and iterated entirely by our research group using AI-assisted development. No third-party ESG data vendors, no black-box APIs — every line of analysis is transparent, reproducible and grounded in our report's methodology.
          </p>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 14 }}>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
              ⚠️ The scores produced by these tools are NLP-based proxies for research purposes only. They do not constitute investment advice, financial recommendations, or regulatory ESG assessments.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}