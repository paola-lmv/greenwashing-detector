export default function AboutSection({ accentColor = "#064e3b", accentLight = "#ecfdf5", accentBorder = "#a7f3d0" }) {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 48px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: `1px solid ${accentBorder}` }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, background: accentLight, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🎓</div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: 2 }}>About this tool</p>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>
              Built for our research report —<br />
              <span style={{ color: accentColor }}>entirely by the team & AI</span>
            </h2>
          </div>
        </div>

        {/* Core question */}
        <div style={{ background: accentLight, border: `1px solid ${accentBorder}`, borderRadius: 14, padding: 20, marginBottom: 24 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: 1 }}>Core Research Question</p>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#111827", lineHeight: 1.7, fontStyle: "italic" }}>
            "As an active investor, can I trust ESG metrics to inform my stock-picking and disclosure — and if not, what should I use instead?"
          </p>
        </div>

        {/* Three layers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
          {[
            {
              num: "01",
              title: "Diagnostic layer",
              question: "Do ESG metrics actually measure what they claim?",
              answer: "Per Berg et al., the answer is poorly and inconsistently. Ratings from MSCI, Sustainalytics and others diverge significantly for the same company — correlation as low as 0.38.",
              color: "#ef4444", bg: "#fef2f2", border: "#fca5a5"
            },
            {
              num: "02",
              title: "Problem layer",
              question: "Are distortions random or systematic?",
              answer: "If random, they're noise. But if systematic — meaning firms can deliberately game them — relying on ESG ratings exposes investors to greenwashing risk and capital misallocation.",
              color: "#f97316", bg: "#fff7ed", border: "#fdba74"
            },
            {
              num: "03",
              title: "Solution & payoff layer",
              question: "Can better tools create alpha?",
              answer: "If most of the market uses flawed ratings, a manager with better NLP-based tools has an informational edge. This is where the active investor framing really bites.",
              color: accentColor, bg: accentLight, border: accentBorder
            },
          ].map(({ num, title, question, answer, color, bg, border }) => (
            <div key={num} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color, marginBottom: 6, letterSpacing: 2 }}>{num} — {title.toUpperCase()}</div>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#111827", lineHeight: 1.5 }}>{question}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{answer}</p>
            </div>
          ))}
        </div>

        {/* Why we built this */}
        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#111827" }}>Why we built these tools</h3>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "#374151", lineHeight: 1.8 }}>
            Standard ESG ratings give a single score that obscures more than it reveals. To actually answer our research question, we needed <strong>proxies</strong> — measurable signals that go deeper than a Bloomberg ESG score. These two tools are exactly that.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              {
                icon: "🌿",
                title: "Greenwashing Detector",
                desc: "A linguistic proxy for greenwashing intent. By counting how often a company uses vague, unverifiable, or temporally evasive language in its ESG disclosures, we can flag documents where the rhetoric outpaces the substance.",
              },
              {
                icon: "📊",
                title: "NLP Simulator — Ping An 19 Indicators",
                desc: "A disclosure depth proxy based on Ping An's TCFD-aligned framework. Rather than trusting a rating agency's black box, we directly measure keyword coverage across 19 structured indicators to produce our own transparency score.",
              }
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: "#f9fafb", borderRadius: 12, padding: 16, display: "flex", gap: 12 }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{icon}</div>
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "#111827" }}>{title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team & disclaimer */}
        <div style={{ background: "#f9fafb", borderRadius: 12, padding: 16, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ fontSize: 20, flexShrink: 0 }}>👥</div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#111827" }}>Entirely built by the group — with AI</p>
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
              This platform was designed, coded and iterated by our research group using AI-assisted development. No third-party ESG data vendors, no black-box APIs — every line of analysis is transparent, reproducible and grounded in our report's methodology. The scores are NLP proxies, not investment advice.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}