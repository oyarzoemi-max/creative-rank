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
  handle: string;
  banner: string;
  accent: string;
};

const MONTHLY_CAP = 20000;

const initialParticipants: Participant[] = [
  { id: 1, name: "Luma Studio", category: "Diseño", credits: 20000, clicks: 820, impressions: 11800, joinedAt: 1, handle: "@lumastudio", banner: "Diseño que transforma ideas en experiencias.", accent: "#ff3cac" },
  { id: 2, name: "Nova Digital", category: "Tecnología", credits: 20000, clicks: 1120, impressions: 14300, joinedAt: 2, handle: "@novadigital", banner: "Tecnología que conecta tu próximo salto.", accent: "#25d9ff" },
  { id: 3, name: "Atlas Travel", category: "Viajes", credits: 20000, clicks: 640, impressions: 9200, joinedAt: 3, handle: "@atlastravel", banner: "El próximo destino empieza acá.", accent: "#65f4d0" },
  { id: 4, name: "Patagonia Lab", category: "Business", credits: 17000, clicks: 980, impressions: 12100, joinedAt: 4, handle: "@patagonialab", banner: "Ideas que se convierten en negocios.", accent: "#ffb52e" },
  { id: 5, name: "Marea Brand", category: "Branding", credits: 15000, clicks: 760, impressions: 10100, joinedAt: 5, handle: "@mareabrand", banner: "Hacé que tu marca sea imposible de ignorar.", accent: "#ff7a45" },
  { id: 6, name: "Pixel Norte", category: "Diseño", credits: 12000, clicks: 540, impressions: 7800, joinedAt: 6, handle: "@pixelnorte", banner: "Diseño digital con identidad propia.", accent: "#9d7cff" },
  { id: 7, name: "Andes Tech", category: "Tecnología", credits: 10000, clicks: 430, impressions: 6400, joinedAt: 7, handle: "@andestech", banner: "Soluciones para empresas que avanzan.", accent: "#25d9ff" },
  { id: 8, name: "Sur Experience", category: "Viajes", credits: 8000, clicks: 390, impressions: 5700, joinedAt: 8, handle: "@surexperience", banner: "Experiencias que quedan para siempre.", accent: "#65f4d0" },
  { id: 9, name: "Cumbre Store", category: "Comercio", credits: 6000, clicks: 260, impressions: 4200, joinedAt: 9, handle: "@cumbrestore", banner: "Encontrá lo que estabas buscando.", accent: "#ffd447" },
  { id: 10, name: "Delta Creative", category: "Creativo", credits: 3000, clicks: 180, impressions: 2600, joinedAt: 10, handle: "@deltacreative", banner: "Creatividad que conecta personas y marcas.", accent: "#b46cff" },
];

const scoreFor = (p: Participant) => {
  const creditPoints = (p.credits / MONTHLY_CAP) * 500;
  const clickPoints = Math.min(p.clicks / 2, 400);
  const ctr = p.impressions > 0 ? p.clicks / p.impressions : 0;
  const ctrPoints = Math.min(ctr * 1000, 100);
  return Math.round(creditPoints + clickPoints + ctrPoints);
};

const rankParticipants = (items: Participant[]) =>
  [...items].sort((a, b) => {
    const scoreDiff = scoreFor(b) - scoreFor(a);
    if (scoreDiff !== 0) return scoreDiff;
    if (b.clicks !== a.clicks) return b.clicks - a.clicks;
    return a.joinedAt - b.joinedAt;
  }).map((p, index) => ({ ...p, rank: index + 1, score: scoreFor(p) }));

export default function Home() {
  const [participants, setParticipants] = useState(initialParticipants);
  const [selectedId, setSelectedId] = useState(2);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [message, setMessage] = useState("MODO PRUEBA: hacé clic en un participante para explorar su perfil.");
  const [month, setMonth] = useState("OCTUBRE 2026");

  const ranking = useMemo(() => rankParticipants(participants), [participants]);
  const selected = ranking.find((p) => p.id === selectedId) ?? ranking[0];
  const profile = ranking.find((p) => p.id === profileId) ?? null;

  const addClicks = (id: number, amount = 100) => {
    setParticipants(current => current.map(p => p.id === id
      ? { ...p, clicks: p.clicks + amount, impressions: p.impressions + amount * 12 }
      : p));
    setMessage("⚡ Interacción agregada. El ranking se recalculó en tiempo real.");
  };

  const addCredits = (id: number, amount: number) => {
    setParticipants(current => current.map(p => p.id === id
      ? { ...p, credits: Math.min(MONTHLY_CAP, p.credits + amount) }
      : p));
    setMessage(`🚀 Promoción simulada: +${amount.toLocaleString()} créditos.`);
  };

  const resetDemo = () => {
    setParticipants(initialParticipants);
    setMessage("Demo reiniciada.");
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.logo}>CR<span style={{ color: "#25d9ff" }}>EATIVE</span> <span style={{ color: "#ff3cac" }}>RANK</span></div>
          <div style={styles.tagline}>CREADORES · MARCAS · EXPERIENCIAS</div>
        </div>
        <nav style={styles.nav}>
          <a href="#ranking" style={styles.navA}>🏆 RANKING</a>
          <a href="#winners" style={styles.navA}>TOP 5</a>
          <a href="#how" style={styles.navA}>CÓMO FUNCIONA</a>
          <button onClick={resetDemo} style={styles.smallButton}>RESET DEMO</button>
        </nav>
      </header>

      <section style={styles.hero}>
        <div style={styles.heroCopy}>
          <div style={styles.eyebrow}>● LIVE MONTHLY RANKING · {month}</div>
          <h1 style={styles.h1}>EL TALENTO<br /><span style={styles.gradientText}>SE DESTACA.</span></h1>
          <p style={styles.heroCopyP}>Marcas, proyectos y experiencias compitiendo por atención. Promocioná, generá interés y hacé que tu posición pueda cambiar hasta el último día.</p>
          <div style={styles.heroButtons}>
            <a href="#ranking" style={styles.primary}>DESCUBRIR RANKING →</a>
            <a href="#how" style={styles.secondary}>CÓMO FUNCIONA</a>
          </div>
        </div>
        <div style={styles.heroCard}>
          <div style={styles.cardLabel}>COMPETENCIA MENSUAL</div>
          <div style={styles.monthTitle}>{month}</div>
          <div style={styles.heroStats}>
            <div><strong>20K</strong><small>CAP PROMOCIONAL</small></div>
            <div><strong>{ranking.length}</strong><small>PARTICIPANTES</small></div>
            <div><strong>{ranking.reduce((s,p)=>s+p.clicks,0).toLocaleString()}</strong><small>CLICKS</small></div>
          </div>
          <div style={styles.livePill}>● COMPETENCIA ACTIVA</div>
          <div style={styles.progress}><span style={{ width: "24%" }} /></div>
          <small style={{ color: "#8e8ba0" }}>Progreso del mes · 24%</small>
        </div>
      </section>

      <div style={styles.notice}>{message}</div>

      <section id="ranking" style={styles.section}>
        <div style={styles.sectionHead}>
          <div>
            <div style={styles.eyebrow}>01 · LIVE RANKING</div>
            <h2 style={styles.h2}>La posición puede cambiar hasta el último día.</h2>
          </div>
          <div style={styles.monthBadge}>{month}</div>
        </div>

        <div style={styles.dashboard}>
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <span>#</span><span>PARTICIPANTE</span><span>CATEGORÍA</span><span>CRÉDITOS</span><span>CLICKS</span><span>CR SCORE</span><span>TENDENCIA</span>
            </div>
            {ranking.map((p, index) => (
              <div key={p.id}
                onClick={() => { setSelectedId(p.id); setMessage(`👀 ${p.name} seleccionado. Abrí VER para conocer su perfil.`); }}
                style={{ ...styles.row, ...(selected?.id === p.id ? styles.rowSelected : {}) }}>
                <strong style={styles.rank}>{p.rank <= 3 ? ["🥇","🥈","🥉"][p.rank-1] : p.rank}</strong>
                <div style={styles.person}><strong>{p.name}</strong><small>{p.handle}</small></div>
                <span style={{ ...styles.category, borderColor: p.accent, color: p.accent }}>{p.category}</span>
                <span>{p.credits.toLocaleString()}</span>
                <span>{p.clicks.toLocaleString()}</span>
                <strong style={styles.score}>{p.score}</strong>
                <span style={{ color: index % 3 === 0 ? "#45e69b" : index % 3 === 1 ? "#ff5f75" : "#8e8ba0", fontWeight: 900 }}>
                  {index % 3 === 0 ? "▲ +2" : index % 3 === 1 ? "▼ -1" : "—"}
                </span>
                <button onClick={(e) => { e.stopPropagation(); setProfileId(p.id); }} style={styles.viewButton}>VER →</button>
              </div>
            ))}
          </div>

          <aside style={styles.sideCard}>
            <div style={styles.profileBanner}>
              <div style={{ ...styles.bannerGlow, background: selected.accent }} />
              <span style={styles.profileRank}>#{selected.rank}</span>
              <span style={{ ...styles.category, borderColor: selected.accent, color: selected.accent }}>{selected.category}</span>
              <div style={styles.avatar}>{selected.name.slice(0,1)}</div>
            </div>
            <div style={styles.eyebrow}>SELECTED PARTICIPANT</div>
            <h3 style={styles.sideCardH3}>{selected.name}</h3>
            <p style={styles.p}>{selected.handle} · {selected.banner}</p>
            <div style={styles.metrics}>
              <Metric label="POSICIÓN" value={`#${selected.rank}`} />
              <Metric label="CR SCORE" value={selected.score.toLocaleString()} />
              <Metric label="CLICKS" value={selected.clicks.toLocaleString()} />
              <Metric label="CRÉDITOS" value={`${(selected.credits/1000).toFixed(1)}K`} />
            </div>
            <div style={styles.progressLabel}><span>Influencia promocional</span><span>{selected.credits.toLocaleString()} / {MONTHLY_CAP.toLocaleString()}</span></div>
            <div style={styles.progress}><span style={{ width: `${(selected.credits/MONTHLY_CAP)*100}%`, background: `linear-gradient(90deg,${selected.accent},#25d9ff)` }} /></div>
            <div style={styles.actionGrid}>
              <button onClick={() => addClicks(selected.id)} style={styles.primary}>+100 CLICKS</button>
              <button onClick={() => addCredits(selected.id,1000)} style={{ ...styles.secondary, borderColor: "#ffb52e", color: "#ffd66b" }}>+1K CRÉDITOS</button>
            </div>
            <button onClick={() => setProfileId(selected.id)} style={styles.fullButton}>VER PERFIL COMPLETO →</button>
          </aside>
        </div>
      </section>

      <section id="winners" style={styles.section}>
        <div style={styles.sectionHead}><div><div style={styles.eyebrow}>02 · TOP 5</div><h2 style={styles.h2}>Los que están captando atención este mes.</h2></div></div>
        <div style={styles.winnerGrid}>
          {ranking.slice(0,5).map(p => (
            <button key={p.id} onClick={() => setProfileId(p.id)} style={{ ...styles.winnerCard, textAlign: "left", color: "#fff", cursor: "pointer" }}>
              <div style={styles.winnerVisual}><span>{p.rank === 1 ? "🏆" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : `#${p.rank}`}</span><span style={{ ...styles.miniBadge, borderColor:p.accent, color:p.accent }}>{p.category}</span></div>
              <h3>{p.name}</h3><p style={styles.p}>{p.banner}</p>
              <div style={styles.winnerStats}><span>{p.clicks.toLocaleString()} clicks</span><strong>{p.score}</strong></div>
            </button>
          ))}
        </div>
      </section>

      <section id="how" style={styles.section}>
        <div style={styles.sectionHead}><div><div style={styles.eyebrow}>03 · HOW IT WORKS</div><h2 style={styles.h2}>Promoción + atención + interacción.</h2></div></div>
        <div style={styles.steps}>
          <Step n="01" title="PROMOCIONÁ" text="Comprá créditos y llevá tu publicación hasta un máximo de 20.000 créditos mensuales." />
          <Step n="02" title="GENERÁ INTERÉS" text="Tu presencia recibe visualizaciones y clics. La respuesta de la audiencia mueve el ranking." />
          <Step n="03" title="MOSTRÁ TU MARCA" text="Tu perfil y tu banner aparecen dentro de Creative Rank para que otros puedan descubrirte." />
        </div>
      </section>

      <section style={styles.testPanel}>
        <div><div style={styles.eyebrow}>MVP TEST CONSOLE</div><h2 style={{...styles.h2,fontSize:32}}>Probá la mecánica en tiempo real.</h2><p style={styles.p}>Seleccioná una marca, sumá clics y mirá cómo cambia su posición.</p></div>
        <button onClick={() => { setMonth("NOVIEMBRE 2026"); resetDemo(); }} style={styles.primary}>SIMULAR NUEVO MES</button>
      </section>

      <footer style={styles.footer}><strong>CREATIVE<span style={{color:"#ff3cac"}}>RANK</span></strong><span>MVP · Monthly Competition Engine</span><span>© 2026</span></footer>

      {profile && (
        <div style={styles.modalBackdrop} onClick={() => setProfileId(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button onClick={() => setProfileId(null)} style={styles.close}>×</button>
            <div style={{ ...styles.modalBanner, background: `linear-gradient(135deg,${profile.accent},#784cff 55%,#07131c)` }}>
              <span style={styles.modalRank}>#{profile.rank}</span><span style={styles.modalLive}>● BANNER ACTIVO</span>
              <div><small>CREATIVE RANK · {month}</small><h2>{profile.name}</h2><p>{profile.banner}</p></div>
            </div>
            <div style={styles.modalBody}>
              <div><div style={styles.eyebrow}>{profile.category}</div><h3>{profile.handle}</h3></div>
              <div style={styles.modalMetrics}><Metric label="POSICIÓN" value={`#${profile.rank}`} /><Metric label="CR SCORE" value={profile.score.toLocaleString()} /><Metric label="IMPRESIONES" value={profile.impressions.toLocaleString()} /><Metric label="CLICKS" value={profile.clicks.toLocaleString()} /></div>
              <div style={styles.fakeChart}><div style={styles.chartLine}><i/><i/><i/><i/><i/><i/><i/></div><span>EVOLUCIÓN DEL SCORE · ÚLTIMOS 30 DÍAS</span></div>
              <div style={styles.modalActions}><button onClick={() => addClicks(profile.id)} style={styles.primary}>IMPULSAR +100 CLICKS</button><button onClick={() => setProfileId(null)} style={styles.secondary}>CERRAR</button></div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Metric({label,value}:{label:string;value:string}) {
  return <div style={styles.metric}><small>{label}</small><strong>{value}</strong></div>;
}

function Step({n,title,text}:{n:string;title:string;text:string}) {
  return <article style={styles.step}><div style={styles.stepN}>{n}</div><h3>{title}</h3><p>{text}</p></article>;
}

const styles: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",background:"radial-gradient(circle at 10% 0%,#251044 0,transparent 30%),radial-gradient(circle at 90% 10%,#063c52 0,transparent 28%),#07070d",color:"#f8f7ff",fontFamily:"Inter,ui-sans-serif,system-ui,sans-serif",padding:"0 22px 40px"},
  header:{maxWidth:1380,margin:"0 auto",padding:"22px 0",display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,borderBottom:"1px solid rgba(255,255,255,.08)"},
  logo:{fontSize:27,fontWeight:950,letterSpacing:"-.07em"},tagline:{color:"#8e8ba0",fontSize:9,letterSpacing:".2em",marginTop:4},nav:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},
  navA:{color:"#bcb8ca",textDecoration:"none",fontSize:10,fontWeight:800,letterSpacing:".1em",padding:"9px 10px"},smallButton:{border:"1px solid rgba(255,255,255,.14)",background:"rgba(255,255,255,.04)",color:"#aaa6b7",borderRadius:9,padding:"8px 10px",fontSize:9,fontWeight:900,cursor:"pointer"},
  hero:{maxWidth:1380,margin:"0 auto",minHeight:510,display:"grid",gridTemplateColumns:"1.25fr .75fr",gap:22,alignItems:"center",padding:"65px 0 45px"},heroCopy:{position:"relative"},
  eyebrow:{color:"#65f4d0",fontSize:10,fontWeight:900,letterSpacing:".18em",textTransform:"uppercase" as const},h1:{fontSize:"clamp(54px,8vw,112px)",lineHeight:.86,letterSpacing:"-.085em",margin:"18px 0 25px",fontWeight:950},gradientText:{background:"linear-gradient(90deg,#25d9ff,#ff3cac,#ffd447)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  heroCopyP:{color:"#b5b0c1",fontSize:16,lineHeight:1.65,maxWidth:720,margin:0},heroButtons:{display:"flex",gap:10,flexWrap:"wrap",marginTop:27},
  primary:{border:0,borderRadius:13,padding:"13px 18px",background:"linear-gradient(135deg,#ff3cac,#784cff 55%,#25d9ff)",color:"white",fontWeight:900,fontSize:10,letterSpacing:".11em",cursor:"pointer",textDecoration:"none",display:"inline-flex",alignItems:"center",justifyContent:"center",boxShadow:"0 10px 35px rgba(120,76,255,.28)"},
  secondary:{border:"1px solid rgba(255,255,255,.14)",borderRadius:13,padding:"12px 18px",background:"rgba(255,255,255,.04)",color:"#f0edf7",fontWeight:900,fontSize:10,letterSpacing:".11em",cursor:"pointer",textDecoration:"none",display:"inline-flex",alignItems:"center",justifyContent:"center"},
  heroCard:{minHeight:365,border:"1px solid rgba(255,255,255,.12)",borderRadius:30,padding:30,background:"linear-gradient(145deg,rgba(255,60,172,.16),rgba(37,217,255,.08) 48%,rgba(12,11,20,.94))",boxShadow:"0 25px 70px rgba(0,0,0,.35)",display:"flex",flexDirection:"column",justifyContent:"center"},cardLabel:{color:"#8e8ba0",fontSize:9,letterSpacing:".18em",fontWeight:900},monthTitle:{fontSize:26,fontWeight:900,margin:"8px 0 24px"},heroStats:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8},livePill:{marginTop:28,color:"#65f4d0",fontSize:10,letterSpacing:".12em",fontWeight:900},
  notice:{maxWidth:1380,margin:"0 auto 22px",border:"1px solid rgba(101,244,208,.2)",background:"rgba(101,244,208,.06)",borderRadius:14,padding:"12px 16px",color:"#b9f9e8",fontSize:11},section:{maxWidth:1380,margin:"0 auto",padding:"72px 0 20px"},sectionHead:{display:"flex",justifyContent:"space-between",alignItems:"end",gap:20,marginBottom:24},h2:{fontSize:"clamp(30px,4vw,54px)",lineHeight:1,letterSpacing:"-.065em",margin:"9px 0 0",maxWidth:800},monthBadge:{border:"1px solid rgba(255,255,255,.14)",borderRadius:999,padding:"9px 13px",color:"#d5d0df",fontSize:9,letterSpacing:".13em",fontWeight:900,background:"rgba(255,255,255,.04)"},
  dashboard:{display:"grid",gridTemplateColumns:"1.4fr .6fr",gap:16},tableCard:{border:"1px solid rgba(255,255,255,.11)",borderRadius:24,overflow:"hidden",background:"rgba(12,11,18,.86)",boxShadow:"0 20px 60px rgba(0,0,0,.2)"},tableHeader:{display:"grid",gridTemplateColumns:"36px minmax(130px,1.4fr) 90px 90px 70px 80px 75px 55px",gap:8,padding:"15px 14px",color:"#777487",fontSize:8,letterSpacing:".1em",fontWeight:900,borderBottom:"1px solid rgba(255,255,255,.07)"},
  row:{display:"grid",gridTemplateColumns:"36px minmax(130px,1.4fr) 90px 90px 70px 80px 75px 55px",gap:8,alignItems:"center",padding:"14px",borderBottom:"1px solid rgba(255,255,255,.055)",background:"transparent",color:"#eeeaf5",cursor:"pointer",fontSize:11,transition:"all .18s"},rowSelected:{background:"linear-gradient(90deg,rgba(255,60,172,.12),rgba(37,217,255,.06))",boxShadow:"inset 3px 0 #ff3cac"},rank:{color:"#f4c7ff",fontSize:14},person:{display:"flex",flexDirection:"column",gap:3},category:{border:"1px solid",borderRadius:999,padding:"4px 7px",fontSize:8,fontWeight:900,width:"fit-content"},score:{color:"#ffd447",fontSize:13},viewButton:{border:0,borderRadius:8,padding:"8px 9px",background:"linear-gradient(135deg,#ff3cac,#784cff)",color:"#fff",fontSize:8,fontWeight:900,cursor:"pointer"},
  sideCard:{border:"1px solid rgba(255,255,255,.12)",borderRadius:24,padding:20,background:"linear-gradient(160deg,rgba(120,76,255,.15),rgba(12,11,18,.94))",boxShadow:"0 20px 60px rgba(0,0,0,.25)"},profileBanner:{height:130,borderRadius:18,position:"relative",overflow:"hidden",background:"linear-gradient(135deg,#27114e,#0c5060)",padding:14,marginBottom:18},bannerGlow:{position:"absolute",width:160,height:160,borderRadius:"50%",filter:"blur(55px)",opacity:.55,right:-30,top:-40},profileRank:{position:"relative",fontSize:24,fontWeight:950},avatar:{position:"absolute",right:16,bottom:14,width:58,height:58,borderRadius:"50%",background:"rgba(255,255,255,.16)",border:"2px solid rgba(255,255,255,.5)",display:"grid",placeItems:"center",fontSize:24,fontWeight:950,backdropFilter:"blur(8px)"},metrics:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,margin:"18px 0"},metric:{border:"1px solid rgba(255,255,255,.08)",borderRadius:13,padding:11,background:"rgba(0,0,0,.2)",display:"flex",flexDirection:"column",gap:6},progressLabel:{display:"flex",justifyContent:"space-between",color:"#8e8ba0",fontSize:9,marginTop:8},progress:{height:8,background:"#211d2b",borderRadius:99,overflow:"hidden",margin:"8px 0 18px"},actionGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},fullButton:{width:"100%",marginTop:9,border:"1px solid rgba(255,255,255,.12)",borderRadius:11,padding:"11px",background:"rgba(255,255,255,.04)",color:"#ddd8e8",fontSize:9,fontWeight:900,cursor:"pointer"},
  winnerGrid:{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12},winnerCard:{border:"1px solid rgba(255,255,255,.1)",borderRadius:20,padding:18,background:"linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.015))",transition:"transform .2s"},winnerVisual:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18},miniBadge:{border:"1px solid",borderRadius:999,padding:"4px 7px",fontSize:8,fontWeight:900},winnerStats:{display:"flex",justifyContent:"space-between",alignItems:"end",marginTop:24,color:"#777487",fontSize:10},steps:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14},step:{border:"1px solid rgba(255,255,255,.1)",borderRadius:20,padding:22,background:"rgba(255,255,255,.035)"},stepN:{color:"#ff64bb",fontWeight:950,fontSize:12,letterSpacing:".1em"},
  testPanel:{maxWidth:1380,margin:"72px auto 20px",border:"1px solid rgba(255,60,172,.25)",borderRadius:26,padding:28,background:"linear-gradient(110deg,rgba(255,60,172,.12),rgba(37,217,255,.07),rgba(12,11,18,.95))",display:"flex",justifyContent:"space-between",alignItems:"center",gap:20},footer:{maxWidth:1380,margin:"55px auto 0",padding:"28px 0",borderTop:"1px solid rgba(255,255,255,.08)",color:"#6e6a79",display:"flex",justifyContent:"space-between",gap:16,fontSize:10},
  modalBackdrop:{position:"fixed",inset:0,zIndex:50,background:"rgba(2,2,8,.78)",backdropFilter:"blur(12px)",display:"grid",placeItems:"center",padding:20},modal:{width:"min(720px,100%)",maxHeight:"90vh",overflow:"auto",border:"1px solid rgba(255,255,255,.16)",borderRadius:28,background:"#0b0a12",boxShadow:"0 30px 100px rgba(0,0,0,.6)",position:"relative"},close:{position:"absolute",right:14,top:12,zIndex:2,width:36,height:36,borderRadius:"50%",border:"1px solid rgba(255,255,255,.2)",background:"rgba(0,0,0,.35)",color:"#fff",fontSize:22,cursor:"pointer"},modalBanner:{minHeight:240,padding:28,display:"flex",flexDirection:"column",justifyContent:"space-between",borderRadius:"28px 28px 0 0"},modalRank:{fontSize:34,fontWeight:950},modalLive:{alignSelf:"flex-end",marginTop:-30,fontSize:9,fontWeight:900,letterSpacing:".12em"},modalBody:{padding:24},modalMetrics:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,margin:"20px 0"},fakeChart:{height:130,border:"1px solid rgba(255,255,255,.08)",borderRadius:16,padding:14,background:"linear-gradient(180deg,rgba(120,76,255,.08),transparent)",position:"relative",overflow:"hidden"},chartLine:{position:"absolute",left:15,right:15,bottom:35,height:75,display:"flex",alignItems:"end",gap:7},modalActions:{display:"flex",gap:9,marginTop:18}
};

if (typeof window !== "undefined") {
  const styleId = "creative-rank-mvp-responsive";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      *{box-sizing:border-box} html{scroll-behavior:smooth}
      button:hover,a:hover{filter:brightness(1.12);transform:translateY(-1px)}
      @media(max-width:1050px){.cr-dashboard{grid-template-columns:1fr!important}.cr-table-card{overflow-x:auto}.cr-winners{grid-template-columns:repeat(3,1fr)!important}}
      @media(max-width:800px){.cr-hero{grid-template-columns:1fr!important}.cr-winners{grid-template-columns:repeat(2,1fr)!important}.cr-steps{grid-template-columns:1fr!important}.cr-table-head{display:none!important}}
      @media(max-width:620px){.cr-header{flex-direction:column!important;align-items:flex-start!important}.cr-nav{width:100%!important}.cr-row{grid-template-columns:34px 1fr 55px!important}.cr-row>span:nth-child(3),.cr-row>span:nth-child(4),.cr-row>span:nth-child(5),.cr-row>span:nth-child(6),.cr-row>span:nth-child(7){display:none!important}.cr-winners{grid-template-columns:1fr!important}.cr-test{flex-direction:column!important;align-items:flex-start!important}.cr-footer{flex-direction:column!important}.cr-modal-metrics{grid-template-columns:1fr 1fr!important}}
    `;
    document.head.appendChild(style);
  }
}
