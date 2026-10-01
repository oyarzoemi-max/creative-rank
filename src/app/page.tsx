'use client';

import { useMemo, useState } from "react";

type Participant = {
  id: number;
  name: string;
  category: string;
  credits: number;
  clicks: number;
  impressions: number;
  joinedAt: number;
};

const MONTHLY_CAP = 20000;

const initialParticipants: Participant[] = [
  { id: 1, name: "Luma Studio", category: "Design", credits: 20000, clicks: 820, impressions: 11800, joinedAt: 1 },
  { id: 2, name: "Nova Digital", category: "Technology", credits: 20000, clicks: 1120, impressions: 14300, joinedAt: 2 },
  { id: 3, name: "Atlas Travel", category: "Travel", credits: 20000, clicks: 640, impressions: 9200, joinedAt: 3 },
  { id: 4, name: "Patagonia Lab", category: "Business", credits: 17000, clicks: 980, impressions: 12100, joinedAt: 4 },
  { id: 5, name: "Marea Brand", category: "Branding", credits: 15000, clicks: 760, impressions: 10100, joinedAt: 5 },
  { id: 6, name: "Pixel Norte", category: "Design", credits: 12000, clicks: 540, impressions: 7800, joinedAt: 6 },
  { id: 7, name: "Andes Tech", category: "Technology", credits: 10000, clicks: 430, impressions: 6400, joinedAt: 7 },
  { id: 8, name: "Sur Experience", category: "Travel", credits: 8000, clicks: 390, impressions: 5700, joinedAt: 8 },
  { id: 9, name: "Cumbre Store", category: "Commerce", credits: 6000, clicks: 260, impressions: 4200, joinedAt: 9 },
  { id: 10, name: "Delta Creative", category: "Creative", credits: 3000, clicks: 180, impressions: 2600, joinedAt: 10 },
];

const scoreFor = (p: Participant) => {
  // MVP rule: promotional credits establish the base;
  // real audience response adds the competitive movement.
  const creditPoints = (p.credits / MONTHLY_CAP) * 500;
  const clickPoints = Math.min(p.clicks / 2, 400);
  const ctr = p.impressions > 0 ? p.clicks / p.impressions : 0;
  const ctrPoints = Math.min(ctr * 1000, 100);
  return Math.round(creditPoints + clickPoints + ctrPoints);
};

const rankParticipants = (items: Participant[]) =>
  [...items]
    .sort((a, b) => {
      const scoreDiff = scoreFor(b) - scoreFor(a);
      if (scoreDiff !== 0) return scoreDiff;
      if (b.clicks !== a.clicks) return b.clicks - a.clicks;
      return a.joinedAt - b.joinedAt;
    })
    .map((p, index) => ({ ...p, rank: index + 1, score: scoreFor(p) }));

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function Home() {
  const [participants, setParticipants] = useState(initialParticipants);
  const [selectedId, setSelectedId] = useState(1);
  const [message, setMessage] = useState("MODO PRUEBA: los cambios son instantáneos y sirven para validar la mecánica.");
  const [month, setMonth] = useState("OCTUBRE 2026");

  const ranking = useMemo(() => rankParticipants(participants), [participants]);
  const selected = ranking.find((p) => p.id === selectedId) ?? ranking[0];
  const topFive = ranking.slice(0, 5);

  const addClicks = (id: number, amount = 100) => {
    setParticipants((current) =>
      current.map((p) =>
        p.id === id
          ? { ...p, clicks: p.clicks + amount, impressions: p.impressions + amount * 12 }
          : p,
      ),
    );
    setMessage("Interacción agregada. El ranking se recalculó automáticamente.");
  };

  const addCredits = (id: number, amount: number) => {
    setParticipants((current) =>
      current.map((p) =>
        p.id === id
          ? { ...p, credits: Math.min(MONTHLY_CAP, p.credits + amount) }
          : p,
      ),
    );
    setMessage(`Promoción simulada: +${amount.toLocaleString()} créditos. Máximo mensual: ${MONTHLY_CAP.toLocaleString()}.`);
  };

  const resetDemo = () => {
    setParticipants(initialParticipants);
    setMessage("Demo reiniciada.");
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.logo}>CREATIVE<span>RANK</span></div>
          <div style={styles.tagline}>THE MONTHLY CREATIVE COMPETITION</div>
        </div>
        <nav style={styles.nav}>
          <a href="#ranking">RANKING</a>
          <a href="#winners">TOP 5</a>
          <a href="#how">HOW IT WORKS</a>
          <button onClick={resetDemo} style={styles.smallButton}>RESET DEMO</button>
        </nav>
      </header>

      <section style={styles.hero}>
        <div style={styles.heroCopy}>
          <div style={styles.eyebrow}>● LIVE MONTHLY RANKING · {month}</div>
          <h1>Compete.<br /><span>Get discovered.</span></h1>
          <p>
            Creative Rank premia la combinación de promoción y respuesta real de la audiencia.
            Llegar a 20.000 créditos no congela tu posición: los clics pueden cambiar el ranking durante todo el mes.
          </p>
          <div style={styles.heroButtons}>
            <a href="#ranking" style={styles.primary}>VER RANKING</a>
            <a href="#how" style={styles.secondary}>CÓMO FUNCIONA</a>
          </div>
        </div>
        <div style={styles.heroCard}>
          <div style={styles.cardLabel}>MONTHLY CAP</div>
          <div style={styles.bigNumber}>20K</div>
          <div style={styles.cardText}>créditos máximos de influencia promocional por participante.</div>
          <div style={styles.livePill}>● COMPETITION ACTIVE</div>
        </div>
      </section>

      <div style={styles.notice}>{message}</div>

      <section id="ranking" style={styles.section}>
        <div style={styles.sectionHead}>
          <div>
            <div style={styles.eyebrow}>01 · LIVE RANKING</div>
            <h2>La posición puede cambiar hasta el último día.</h2>
          </div>
          <div style={styles.monthBadge}>{month}</div>
        </div>

        <div style={styles.dashboard}>
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <span>#</span><span>PARTICIPANT</span><span>CREDITS</span><span>CLICKS</span><span>SCORE</span>
            </div>
            {ranking.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                style={{ ...styles.row, ...(selected?.id === p.id ? styles.rowSelected : {}) }}
              >
                <strong style={styles.rank}>{p.rank <= 3 ? ["🥇", "🥈", "🥉"][p.rank - 1] : p.rank}</strong>
                <span style={styles.person}>
                  <strong>{p.name}</strong>
                  <small>{p.category}</small>
                </span>
                <span>{p.credits.toLocaleString()}</span>
                <span>{p.clicks.toLocaleString()}</span>
                <strong>{p.score}</strong>
              </button>
            ))}
          </div>

          <aside style={styles.sideCard}>
            <div style={styles.eyebrow}>SELECTED PARTICIPANT</div>
            <h3>{selected.name}</h3>
            <p>{selected.category}</p>
            <div style={styles.metrics}>
              <Metric label="POSITION" value={`#${selected.rank}`} />
              <Metric label="CR SCORE" value={selected.score.toLocaleString()} />
              <Metric label="CLICKS" value={selected.clicks.toLocaleString()} />
              <Metric label="CREDITS" value={`${(selected.credits / 1000).toFixed(1)}K`} />
            </div>
            <div style={styles.progressLabel}>
              <span>Promotional cap</span>
              <span>{selected.credits.toLocaleString()} / {MONTHLY_CAP.toLocaleString()}</span>
            </div>
            <div style={styles.progress}><span style={{ width: `${(selected.credits / MONTHLY_CAP) * 100}%` }} /></div>
            <div style={styles.actionGrid}>
              <button onClick={() => addClicks(selected.id, 100)} style={styles.primary}>+100 CLICKS</button>
              <button onClick={() => addCredits(selected.id, 1000)} style={styles.secondary}>+1K CREDITS</button>
            </div>
            <small style={styles.hint}>Prueba: llevá un participante de abajo hacia el Top 5 usando clics.</small>
          </aside>
        </div>
      </section>

      <section id="winners" style={styles.section}>
        <div style={styles.sectionHead}>
          <div>
            <div style={styles.eyebrow}>02 · TOP 5</div>
            <h2>Los ganadores se definen al cierre del mes.</h2>
          </div>
        </div>
        <div style={styles.winnerGrid}>
          {topFive.map((p) => (
            <div key={p.id} style={styles.winnerCard}>
              <div style={styles.winnerRank}>{p.rank === 1 ? "🏆" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : `#${p.rank}`}</div>
              <h3>{p.name}</h3>
              <p>{p.category}</p>
              <div style={styles.winnerStats}><span>{p.clicks.toLocaleString()} clicks</span><strong>{p.score}</strong></div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" style={styles.section}>
        <div style={styles.sectionHead}>
          <div>
            <div style={styles.eyebrow}>03 · HOW IT WORKS</div>
            <h2>Una competencia que permanece viva todo el mes.</h2>
          </div>
        </div>
        <div style={styles.steps}>
          <Step n="01" title="PROMOCIONÁ" text="Comprá créditos y llevá tu publicación hasta un máximo de 20.000 créditos mensuales." />
          <Step n="02" title="GENERÁ INTERÉS" text="Las visualizaciones y especialmente los clics representan la respuesta real de la audiencia." />
          <Step n="03" title="ESCALÁ" text="Aunque llegues al máximo de créditos, podés seguir subiendo posiciones mediante mejor rendimiento." />
        </div>
      </section>

      <section style={styles.testPanel}>
        <div>
          <div style={styles.eyebrow}>MVP TEST CONSOLE</div>
          <h2>Probemos la mecánica antes de conectar pagos reales.</h2>
          <p>Seleccioná cualquier participante de la tabla y agregale clics. Vas a ver cómo cambia su posición inmediatamente.</p>
        </div>
        <button onClick={() => { setMonth("NOVIEMBRE 2026"); resetDemo(); }} style={styles.primary}>SIMULAR NUEVO MES</button>
      </section>

      <footer style={styles.footer}>
        <strong>CREATIVE<span>RANK</span></strong>
        <span>MVP · Monthly Competition Engine</span>
        <span>© 2026</span>
      </footer>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div style={styles.metric}><small>{label}</small><strong>{value}</strong></div>;
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return <article style={styles.step}><div style={styles.stepN}>{n}</div><h3>{title}</h3><p>{text}</p></article>;
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#07070a", color: "#f7f4ff", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", padding: "24px clamp(16px, 4vw, 64px)" },
  header: { maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, padding: "14px 0 34px" },
  logo: { fontSize: 25, fontWeight: 900, letterSpacing: "-0.06em" },
  logoSpan: {},
  tagline: { color: "#888493", fontSize: 9, letterSpacing: "0.2em", marginTop: 4 },
  nav: { display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" },
  navLink: {},
  navA: {},
  hero: { maxWidth: 1280, margin: "0 auto", minHeight: 500, display: "grid", gridTemplateColumns: "1.35fr .65fr", gap: 28, alignItems: "center", padding: "70px 0" },
  heroCopy: {},
  eyebrow: { color: "#b892ff", fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" as const },
  heroH1: {},
  h1: { fontSize: "clamp(58px, 9vw, 126px)", lineHeight: .83, letterSpacing: "-0.085em", margin: "24px 0 30px", fontWeight: 900 },
  heroCopyP: {},
  heroButtons: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 },
  primary: { border: 0, borderRadius: 12, padding: "13px 18px", background: "#8b3dff", color: "white", fontWeight: 800, fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  secondary: { border: "1px solid #30293b", borderRadius: 12, padding: "12px 18px", background: "#111017", color: "#eee9fa", fontWeight: 800, fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  heroCard: { minHeight: 330, border: "1px solid #292330", borderRadius: 28, padding: 30, background: "radial-gradient(circle at 50% 20%, rgba(139,61,255,.24), rgba(15,14,20,.95) 55%)", display: "flex", flexDirection: "column", justifyContent: "center" },
  cardLabel: { color: "#888493", fontSize: 10, letterSpacing: "0.16em", fontWeight: 800 },
  bigNumber: { fontSize: 94, lineHeight: 1, fontWeight: 900, letterSpacing: "-0.08em", margin: "14px 0" },
  cardText: { color: "#aaa5b3", lineHeight: 1.6, maxWidth: 300 },
  livePill: { marginTop: 30, color: "#d4bbff", fontSize: 10, letterSpacing: "0.12em", fontWeight: 800 },
  notice: { maxWidth: 1280, margin: "0 auto 30px", border: "1px solid #2b2337", background: "#0e0c12", borderRadius: 14, padding: "12px 16px", color: "#aaa5b3", fontSize: 12 },
  section: { maxWidth: 1280, margin: "0 auto", padding: "80px 0 30px" },
  sectionHead: { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, marginBottom: 26 },
  h2: { fontSize: "clamp(30px, 4vw, 52px)", lineHeight: 1, letterSpacing: "-0.06em", margin: "10px 0 0", maxWidth: 760 },
  monthBadge: { border: "1px solid #332a40", borderRadius: 999, padding: "10px 14px", color: "#c8bdd4", fontSize: 10, letterSpacing: "0.12em", fontWeight: 800 },
  dashboard: { display: "grid", gridTemplateColumns: "1.45fr .55fr", gap: 18 },
  tableCard: { border: "1px solid #292330", borderRadius: 22, overflow: "hidden", background: "#0c0b10" },
  tableHeader: { display: "grid", gridTemplateColumns: "48px minmax(150px,1.5fr) 110px 90px 80px", gap: 10, padding: "15px 18px", color: "#77717f", fontSize: 9, letterSpacing: "0.14em", fontWeight: 800, borderBottom: "1px solid #201c25" },
  row: { width: "100%", display: "grid", gridTemplateColumns: "48px minmax(150px,1.5fr) 110px 90px 80px", gap: 10, alignItems: "center", padding: "16px 18px", border: 0, borderBottom: "1px solid #19171d", background: "transparent", color: "#e9e4f0", textAlign: "left", cursor: "pointer", fontSize: 12 },
  rowSelected: { background: "rgba(139,61,255,.09)" },
  rank: { color: "#c8b8da", fontSize: 15 },
  person: { display: "flex", flexDirection: "column", gap: 3 },
  sideCard: { border: "1px solid #292330", borderRadius: 22, padding: 22, background: "linear-gradient(180deg,#100d15,#0c0b10)" },
  sideCardH3: {},
  metrics: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "20px 0" },
  metric: { border: "1px solid #25212b", borderRadius: 12, padding: 12, background: "#0b0a0f", display: "flex", flexDirection: "column", gap: 7 },
  progressLabel: { display: "flex", justifyContent: "space-between", color: "#827b8c", fontSize: 9, marginTop: 10 },
  progress: { height: 7, background: "#211c28", borderRadius: 99, overflow: "hidden", margin: "8px 0 18px" },
  actionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  hint: { display: "block", color: "#706a78", lineHeight: 1.5, marginTop: 14 },
  winnerGrid: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 },
  winnerCard: { border: "1px solid #292330", borderRadius: 20, padding: 18, background: "#0c0b10" },
  winnerRank: { fontSize: 24, marginBottom: 22 },
  winnerStats: { display: "flex", justifyContent: "space-between", alignItems: "end", marginTop: 24, color: "#77717f", fontSize: 10 },
  steps: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 },
  step: { border: "1px solid #292330", borderRadius: 20, padding: 22, background: "#0c0b10" },
  stepN: { color: "#b892ff", fontWeight: 900, fontSize: 12, letterSpacing: ".1em" },
  testPanel: { maxWidth: 1280, margin: "80px auto 20px", border: "1px solid #3a2b4d", borderRadius: 26, padding: 28, background: "linear-gradient(120deg,rgba(139,61,255,.13),rgba(12,11,16,.95))", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 },
  footer: { maxWidth: 1280, margin: "60px auto 0", padding: "30px 0", borderTop: "1px solid #201c25", color: "#6e6876", display: "flex", justifyContent: "space-between", gap: 16, fontSize: 10 },
  smallButton: { border: "1px solid #30293b", background: "#111017", color: "#aaa5b3", borderRadius: 9, padding: "8px 10px", fontSize: 9, fontWeight: 800, cursor: "pointer" },
  personSmall: {},
  p: {},
};

styles.heroCopyP = { color: "#aaa5b3", fontSize: 17, lineHeight: 1.65, maxWidth: 690, margin: 0 };
styles.h1 = { ...styles.h1, };
styles.logo = { ...styles.logo };
styles.h2 = { ...styles.h2 };
styles.sideCardH3 = { margin: "10px 0 4px", fontSize: 34, letterSpacing: "-0.06em" };
styles.p = { margin: 0, color: "#8b8493" };
styles.personSmall = { color: "#787180", fontSize: 10 };

if (typeof window !== "undefined") {
  // Responsive fallback without requiring another CSS dependency.
  const styleId = "creative-rank-mvp-responsive";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @media (max-width: 900px) {
        .cr-hero, .cr-dashboard { grid-template-columns: 1fr !important; }
        .cr-winners { grid-template-columns: repeat(2,1fr) !important; }
        .cr-steps { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 650px) {
        .cr-header { flex-direction: column !important; align-items: flex-start !important; }
        .cr-nav { width: 100% !important; }
        .cr-table-head { display:none !important; }
        .cr-row { grid-template-columns: 36px 1fr 75px !important; }
        .cr-row > span:nth-child(3), .cr-row > span:nth-child(4) { display:none !important; }
        .cr-winners { grid-template-columns: 1fr !important; }
        .cr-test { flex-direction: column !important; align-items: flex-start !important; }
        .cr-footer { flex-direction: column !important; }
      }
    `;
    document.head.appendChild(style);
  }
}
