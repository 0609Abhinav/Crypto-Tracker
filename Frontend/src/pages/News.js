import React, { useEffect, useState, useCallback } from "react";
import { getNews } from "../services/news";

const NewsCard = ({ article }) => {
  const date = article.published_on
    ? new Date(article.published_on * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "flex" }}>
      <div
        style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 14, overflow: "hidden", transition: "all 0.2s",
          width: "100%", display: "flex", flexDirection: "column",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {article.imageurl && (
          <div style={{ height: 160, overflow: "hidden", flexShrink: 0 }}>
            <img
              src={article.imageurl} alt={article.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { e.target.parentElement.style.display = "none"; }}
            />
          </div>
        )}
        <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
              background: "rgba(99,102,241,0.1)", color: "var(--accent)",
              whiteSpace: "nowrap",
            }}>
              {article.source_info?.name || article.source || "News"}
            </span>
            {date && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{date}</span>}
          </div>
          <h3 style={{
            fontSize: 14, fontWeight: 700, color: "var(--text-primary)",
            lineHeight: 1.5, flex: 1, margin: 0,
            display: "-webkit-box", WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {article.title}
          </h3>
          {article.body && (
            <p style={{
              fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0,
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {article.body}
            </p>
          )}
          <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, marginTop: "auto" }}>
            Read more →
          </div>
        </div>
      </div>
    </a>
  );
};

const NewsSkeletons = ({ count = 9 }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        <div className="skeleton" style={{ height: 160, borderRadius: 0 }} />
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="skeleton" style={{ height: 12, width: "40%" }} />
          <div className="skeleton" style={{ height: 14, width: "90%" }} />
          <div className="skeleton" style={{ height: 14, width: "75%" }} />
          <div className="skeleton" style={{ height: 11, width: "60%" }} />
        </div>
      </div>
    ))}
  </div>
);

const CATEGORIES = [
  { label: "All Crypto", value: "all" },
  { label: "Bitcoin", value: "BTC" },
  { label: "Ethereum", value: "ETH" },
  { label: "DeFi", value: "DeFi" },
  { label: "NFT", value: "NFT" },
  { label: "Regulation", value: "Regulation" },
];

export default function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  const fetchNews = useCallback(() => {
    setLoading(true);
    setError(null);
    setPage(1);
    getNews(category.value, 36)
      .then((data) => { setArticles(Array.isArray(data) ? data : []); })
      .catch((err) => { setError(err.message); setArticles([]); })
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const paginated = articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>📰 Crypto News</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Latest news from the crypto world
        </p>
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c)}
            style={{
              padding: "7px 16px", borderRadius: 20, border: "1px solid",
              borderColor: category.value === c.value ? "var(--accent)" : "var(--border)",
              background: category.value === c.value ? "rgba(99,102,241,0.1)" : "transparent",
              color: category.value === c.value ? "var(--accent)" : "var(--text-secondary)",
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "14px 18px", borderRadius: 10, marginBottom: 24,
          background: "var(--red-bg)", border: "1px solid var(--red)",
          color: "var(--red)", fontSize: 14,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>⚠️ {error}</span>
          <button onClick={fetchNews} style={{
            background: "none", border: "none", color: "var(--red)",
            cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: 13,
          }}>Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && <NewsSkeletons />}

      {/* Articles grid */}
      {!loading && articles.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {paginated.map((a, i) => (
              <NewsCard key={a.id ?? a.url ?? i} article={a} />
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32, flexWrap: "wrap" }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: page === 1 ? "var(--text-muted)" : "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid", borderColor: page === p ? "var(--accent)" : "var(--border)", background: page === p ? "rgba(99,102,241,0.1)" : "transparent", color: page === p ? "var(--accent)" : "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: page === totalPages ? "var(--text-muted)" : "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: page === totalPages ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && !error && articles.length === 0 && (
        <div style={{
          textAlign: "center", padding: "80px 20px",
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>No news available</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            Could not load news right now. Try again in a moment.
          </p>
          <button onClick={fetchNews} style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: "var(--accent)", color: "#fff", fontSize: 14,
            fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
