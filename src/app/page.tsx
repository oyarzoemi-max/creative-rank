const navItems = ["LIVE BIDS", "SHOWCASE", "TRENDING", "HOW IT WORKS"];

const conceptCards = [
  {
    title: "COMPETE",
    text: "Bid for real visibility every 48 hours.",
  },
  {
    title: "SHOWCASE",
    text: "Top 10 get featured for the world to see.",
  },
  {
    title: "GET DISCOVERED",
    text: "Brands find talent that delivers.",
  },
];

const liveBids = [
  { rank: 1, name: "Aster Vale", specialty: "Motion Design", bid: "$18.4K", score: "96.8" },
  { rank: 2, name: "Nova Kline", specialty: "Brand Systems", bid: "$16.1K", score: "95.6" },
  { rank: 3, name: "Luma Reed", specialty: "3D Illustration", bid: "$15.7K", score: "94.9" },
  { rank: 4, name: "Kiro Sato", specialty: "Product Storytelling", bid: "$14.8K", score: "93.7" },
  { rank: 5, name: "Zee Sol", specialty: "Campaign Art", bid: "$13.9K", score: "92.4" },
  { rank: 6, name: "Rae Moss", specialty: "Editorial Design", bid: "$12.6K", score: "91.3" },
  { rank: 7, name: "Iris Noon", specialty: "AI Visuals", bid: "$11.3K", score: "90.8" },
  { rank: 8, name: "Juno Faye", specialty: "Brand Film", bid: "$10.9K", score: "89.2" },
  { rank: 9, name: "Milo Hart", specialty: "UX Motion", bid: "$9.8K", score: "88.6" },
  { rank: 10, name: "Sora Venn", specialty: "Packaging Design", bid: "$9.2K", score: "87.9" },
];

const showcaseCards = [
  { name: "Aster Vale", specialty: "Motion Design", score: "96.8" },
  { name: "Nova Kline", specialty: "Brand Systems", score: "95.6" },
  { name: "Luma Reed", specialty: "3D Illustration", score: "94.9" },
  { name: "Kiro Sato", specialty: "Product Storytelling", score: "93.7" },
  { name: "Zee Sol", specialty: "Campaign Art", score: "92.4" },
  { name: "Rae Moss", specialty: "Editorial Design", score: "91.3" },
  { name: "Iris Noon", specialty: "AI Visuals", score: "90.8" },
  { name: "Juno Faye", specialty: "Brand Film", score: "89.2" },
  { name: "Milo Hart", specialty: "UX Motion", score: "88.6" },
  { name: "Sora Venn", specialty: "Packaging Design", score: "87.9" },
];

const trendingCreators = [
  { rank: 1, name: "Aster Vale", specialty: "Motion Design", score: 96.8 },
  { rank: 2, name: "Nova Kline", specialty: "Brand Systems", score: 95.6 },
  { rank: 3, name: "Luma Reed", specialty: "3D Illustration", score: 94.9 },
  { rank: 4, name: "Kiro Sato", specialty: "Product Storytelling", score: 93.7 },
  { rank: 5, name: "Zee Sol", specialty: "Campaign Art", score: 92.4 },
];

export default function Home() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-wrap" aria-label="Creative Rank home">
          <div className="brand-mark">CR</div>
          <span>CREATIVE RANK</span>
        </div>

        <nav className="nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a key={item} href="#" className="nav-link">
              {item}
            </a>
          ))}
        </nav>

        <button className="primary-button button-medium">JOIN THE RANKING</button>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow">VISIBLE. VOTED. VERIFIED.</div>
            <h1>
              WHO GETS THE <span className="attention-text">ATTENTION?</span>
            </h1>
            <p className="hero-subtitle">
              Creators compete for visibility.
              <span className="divider-dot">•</span>
              Their work decides who rises.
            </p>

            <div className="hero-actions">
              <button className="primary-button">ENTER THE RANKING</button>
              <button className="secondary-button">DISCOVER TALENT</button>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-glow" />
            <div className="mini-score-card">
              <div className="mini-header">
                <span className="mini-label">TOP CREATOR</span>
                <span className="mini-pill">LIVE</span>
              </div>
              <h2>Aster Vale</h2>
              <p>Motion Design</p>
              <div className="mini-stats">
                <div>
                  <span>Attention</span>
                  <strong>96.8</strong>
                </div>
                <div>
                  <span>Bid</span>
                  <strong>$18.4K</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="concept-grid" aria-label="Platform value propositions">
          {conceptCards.map((card) => (
            <article key={card.title} className="concept-card">
              <div className="concept-title">{card.title}</div>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className="section-block live-bids-block" id="live-bids">
          <div className="section-header">
            <div>
              <div className="section-kicker">LIVE BIDS</div>
              <h3>Round closes in</h3>
            </div>
            <div className="countdown">48:14:09</div>
          </div>

          <div className="bid-layout">
            <div className="ranking-panel">
              <div className="ranking-header">
                <span>TOP 10 RANKING</span>
                <span className="status-pill">48H ROUND</span>
              </div>

              <div className="rank-list">
                {liveBids.map((entry) => (
                  <div key={entry.rank} className="rank-row">
                    <div className="rank-cell rank-index">#{entry.rank}</div>
                    <div className="rank-cell creator-meta">
                      <strong>{entry.name}</strong>
                      <span>{entry.specialty}</span>
                    </div>
                    <div className="rank-cell bid-value">{entry.bid}</div>
                    <div className="rank-cell score-value">{entry.score}</div>
                    <button className="take-button">TAKE #{entry.rank}</button>
                  </div>
                ))}
              </div>
            </div>

            <aside className="leader-panel">
              <div className="leader-topline">CURRENT LEADER</div>
              <h4>Aster Vale</h4>
              <p>Motion Design / Campaign Systems</p>
              <div className="leader-metrics">
                <div>
                  <span>Attention Score</span>
                  <strong>96.8</strong>
                </div>
                <div>
                  <span>Bid Active</span>
                  <strong>$18.4K</strong>
                </div>
              </div>
              <div className="leader-visual">
                <div className="visual-orb orb-1" />
                <div className="visual-orb orb-2" />
                <div className="visual-orb orb-3" />
              </div>
            </aside>
          </div>
        </section>

        <section className="section-block showcase-block" id="showcase">
          <div className="section-header compact">
            <div>
              <div className="section-kicker">SHOWCASE</div>
              <h3>Previous round Top 10</h3>
            </div>
          </div>

          <div className="showcase-grid">
            {showcaseCards.map((card, index) => (
              <article key={card.name} className="showcase-card">
                <div className="card-number">#{index + 1}</div>
                <div className="card-visual" />
                <h4>{card.name}</h4>
                <p>{card.specialty}</p>
                <div className="score-row">
                  <span>Attention Score</span>
                  <strong>{card.score}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block trending-block" id="trending">
          <div className="section-header compact">
            <div>
              <div className="section-kicker">TRENDING CREATORS</div>
              <h3>August</h3>
            </div>
          </div>

          <div className="trending-table-wrap">
            <div className="trending-table" role="table" aria-label="Trending creators list">
              <div className="table-head" role="row">
                <span role="columnheader">Rank</span>
                <span role="columnheader">Creator</span>
                <span role="columnheader">Specialty</span>
                <span role="columnheader">Attention Score</span>
              </div>

              {trendingCreators.map((creator) => (
                <div key={creator.rank} className="table-row" role="row">
                  <span role="cell">#{creator.rank}</span>
                  <span role="cell" className="creator-name">{creator.name}</span>
                  <span role="cell">{creator.specialty}</span>
                  <span role="cell" className="table-score">{creator.score}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-panel">
          <div>
            <div className="section-kicker">ARE YOU A CREATIVE?</div>
            <h3>Get seen. Prove your work. Earn your rank.</h3>
          </div>
          <button className="primary-button">JOIN THE NEXT ROUND</button>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <div className="brand-mark small">CR</div>
          <span>CREATIVE RANK</span>
        </div>

        <p>Visibility is bought. Attention is earned.</p>

        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">FAQ</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}
