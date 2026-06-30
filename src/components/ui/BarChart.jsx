export function BarChart({ data, title, color = "#3b82f6" }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ background: "var(--card)", borderRadius: 16, padding: 20, border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 20, fontFamily: "var(--font)", zIndex: 2, position: "relative" }}>
        {title}
      </div>
      
      {/* Background horizontal grid lines */}
      <div style={{ position: "absolute", left: 20, right: 20, top: 55, bottom: 40, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none", opacity: 0.07 }}>
        <div style={{ borderTop: "1px dashed var(--text)", width: "100%" }} />
        <div style={{ borderTop: "1px dashed var(--text)", width: "100%" }} />
        <div style={{ borderTop: "1px dashed var(--text)", width: "100%" }} />
        <div style={{ borderTop: "1px dashed var(--text)", width: "100%" }} />
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120, position: "relative", zIndex: 1 }}>
        {data.map((d, i) => {
          const h = (d.value / max) * 85;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font)", opacity: 0.9 }}>
                {d.value}
              </div>
              <div
                style={{
                  width: "100%",
                  background: `linear-gradient(to top, ${color}dd 0%, ${color} 100%)`,
                  borderRadius: "6px 6px 0 0",
                  height: `${h}px`,
                  minHeight: d.value > 0 ? 4 : 0,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  opacity: 0.8,
                  cursor: "pointer",
                  boxShadow: `0 2px 8px ${color}20`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "scaleY(1.05)";
                  e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.8";
                  e.currentTarget.style.transform = "scaleY(1)";
                  e.currentTarget.style.boxShadow = `0 2px 8px ${color}20`;
                }}
              />
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: "var(--muted)",
                  textAlign: "center",
                  fontFamily: "var(--font)",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                }}
                title={d.label}
              >
                {d.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
