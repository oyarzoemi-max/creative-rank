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
  page: { minHeight: "100vh", background: "radial-gradient(circle at 10% 0%, #251044 0, transparent 30%), radial-gradient(circle at 90% 10%, #063c52 0, transparent 28%), #07070d", color: "#f8f7ff", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", padding: "0 22px 40px" },
  header: { maxWidth: 1380, margin: "0 auto", padding: "22px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, borderBottom: "1px solid rgba(255,255,255,.08)" },
  logo: { fontSize: 27, fontWeight: 950, letterSpacing: "-.07em" },
  tagline: { color: "#8e8ba0", fontSize: 9, letterSpacing: ".2em", marginTop: 4 },
  nav: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  navA: { color: "#bcb8ca", textDecoration: "none", fontSize: 10, fontWeight: 800, letterSpacing: ".12em", padding: "9px 10px" },
  hero: { maxWidth: 1380, margin: "0 auto", minHeight: 510, display: "grid", gridTemplateColumns: "1.25fr .75fr", gap: 22, alignItems: "center", padding: "65px 0 45px" },
  heroCopy: { position: "relative" },
  eyebrow: { color: "#65f4d0", fontSize: 10, fontWeight: 900, letterSpacing: ".18em", textTransform: "uppercase" as const },
  h1: { fontSize: "clamp(54px, 8vw, 112px)", lineHeight: .86, letterSpacing: "-.085em", margin: "18px 0 25px", fontWeight: 950 },
  heroCopyP: { color: "#b5b0c1", fontSize: 16, lineHeight: 1.65, maxWidth: 720, margin: 0 },
  heroButtons: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 27 },
  primary: { border: 0, borderRadius: 13, padding: "13px 18px", background: "linear-gradient(135deg,#ff3cac,#784cff 55%,#25d9ff)", color: "white", fontWeight: 900, fontSize: 10, letterSpacing: ".11em", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 35px rgba(120,76,255,.28)" },
  secondary: { border: "1px solid rgba(255,255,255,.14)", borderRadius: 13, padding: "12px 18px", background: "rgba(255,255,255,.04)", color: "#f0edf7", fontWeight: 900, fontSize: 10, letterSpacing: ".11em", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(12px)" },
  heroCard: { minHeight: 365, border: "1px solid rgba(255,255,255,.12)", borderRadius: 30, padding: 30, background: "linear-gradient(145deg,rgba(255,60,172,.16),rgba(37,217,255,.08) 48%,rgba(12,11,20,.94))", boxShadow: "inset 0 1px rgba(255,255,255,.1), 0 25px 70px rgba(0,0,0,.35)", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" },
  cardLabel: { color: "#8e8ba0", fontSize: 9, letterSpacing: ".18em", fontWeight: 900 },
  bigNumber: { fontSize: 100, lineHeight: 1, fontWeight: 950, letterSpacing: "-.09em", margin: "12px 0", background: "linear-gradient(90deg,#fff,#65f4d0,#25d9ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  cardText: { color: "#b5b0c1", lineHeight: 1.6, maxWidth: 330 },
  livePill: { marginTop: 28, color: "#65f4d0", fontSize: 10, letterSpacing: ".12em", fontWeight: 900 },
  notice: { maxWidth: 1380, margin: "0 auto 22px", border: "1px solid rgba(101,244,208,.2)", background: "rgba(101,244,208,.06)", borderRadius: 14, padding: "12px 16px", color: "#b9f9e8", fontSize: 11 },
  section: { maxWidth: 1380, margin: "0 auto", padding: "72px 0 20px" },
  sectionHead: { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, marginBottom: 24 },
  h2: { fontSize: "clamp(30px, 4vw, 54px)", lineHeight: 1, letterSpacing: "-.065em", margin: "9px 0 0", maxWidth: 800 },
  monthBadge: { border: "1px solid rgba(255,255,255,.14)", borderRadius: 999, padding: "9px 13px", color: "#d5d0df", fontSize: 9, letterSpacing: ".13em", fontWeight: 900, background: "rgba(255,255,255,.04)" },
  dashboard: { display: "grid", gridTemplateColumns: "1.4fr .6fr", gap: 16 },
  tableCard: { border: "1px solid rgba(255,255,255,.11)", borderRadius: 24, overflow: "hidden", background: "rgba(12,11,18,.86)", boxShadow: "0 20px 60px rgba(0,0,0,.2)" },
  tableHeader: { display: "grid", gridTemplateColumns: "50px minmax(160px,1.5fr) 110px 90px 80px", gap: 10, padding: "15px 18px", color: "#777487", fontSize: 8, letterSpacing: ".14em", fontWeight: 900, borderBottom: "1px solid rgba(255,255,255,.07)" },
  row: { width: "100%", display: "grid", gridTemplateColumns: "50px minmax(160px,1.5fr) 110px 90px 80px", gap: 10, alignItems: "center", padding: "16px 18px", border: 0, borderBottom: "1px solid rgba(255,255,255,.055)", background: "transparent", color: "#eeeaf5", textAlign: "left", cursor: "pointer", fontSize: 12, transition: "all .18s" },
  rowSelected: { background: "linear-gradient(90deg,rgba(255,60,172,.11),rgba(37,217,255,.06))", boxShadow: "inset 3px 0 #ff3cac" },
  rank: { color: "#f4c7ff", fontSize: 15 },
  person: { display: "flex", flexDirection: "column", gap: 4 },
  sideCard: { border: "1px solid rgba(255,255,255,.12)", borderRadius: 24, padding: 22, background: "linear-gradient(160deg,rgba(120,76,255,.15),rgba(12,11,18,.94))", boxShadow: "0 20px 60px rgba(0,0,0,.25)" },
  sideCardH3: { margin: "10px 0 4px", fontSize: 34, letterSpacing: "-.06em" },
  metrics: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "20px 0" },
  metric: { border: "1px solid rgba(255,255,255,.08)", borderRadius: 13, padding: 12, background: "rgba(0,0,0,.2)", display: "flex", flexDirection: "column", gap: 7 },
  progressLabel: { display: "flex", justifyContent: "space-between", color: "#8e8ba0", fontSize: 9, marginTop: 10 },
  progress: { height: 8, background: "#211d2b", borderRadius: 99, overflow: "hidden", margin: "8px 0 18px" },
  actionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  hint: { display: "block", color: "#777487", lineHeight: 1.5, marginTop: 14 },
  winnerGrid: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 },
  winnerCard: { border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 18, background: "linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.015))", transition: "transform .2s" },
  winnerRank: { fontSize: 24, marginBottom: 20 },
  winnerStats: { display: "flex", justifyContent: "space-between", alignItems: "end", marginTop: 24, color: "#777487", fontSize: 10 },
  steps: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 },
  step: { border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 22, background: "rgba(255,255,255,.035)" },
  stepN: { color: "#ff64bb", fontWeight: 950, fontSize: 12, letterSpacing: ".1em" },
  testPanel: { maxWidth: 1380, margin: "72px auto 20px", border: "1px solid rgba(255,60,172,.25)", borderRadius: 26, padding: 28, background: "linear-gradient(110deg,rgba(255,60,172,.12),rgba(37,217,255,.07),rgba(12,11,18,.95))", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 },
  footer: { maxWidth: 1380, margin: "55px auto 0", padding: "28px 0", borderTop: "1px solid rgba(255,255,255,.08)", color: "#6e6a79", display: "flex", justifyContent: "space-between", gap: 16, fontSize: 10 },
  smallButton: { border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.04)", color: "#aaa6b7", borderRadius: 9, padding: "8px 10px", fontSize: 9, fontWeight: 900, cursor: "pointer" },
  p: { margin: 0, color: "#8e8ba0" },
  personSmall: { color: "#777487", fontSize: 10 },
};

if (typeof window !== "undefined") {
  const styleId = "creative-rank-mvp-responsive";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      button:hover, a:hover { filter: brightness(1.14); transform: translateY(-1px); }
      .cr-hero, .cr-dashboard { grid-template-columns: 1fr 1fr !important; }
      .cr-winners { grid-template-columns: repeat(5,1fr) !important; }
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
