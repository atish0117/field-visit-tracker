import { fmtDate, fmtTime } from "../../lib/utils";

export function VBtn({ n, data, onClick, disabled, loading }) {
  if (data)
    return (
      <div
        style={{
          background: "#22c55e15",
          border: "1px solid #22c55e40",
          borderRadius: 8,
          padding: "6px 10px",
          textAlign: "center",
          minWidth: 90,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", fontFamily: "var(--font)" }}>Visit {n} ✓</div>
        <div style={{ fontSize: 10, color: "var(--muted)" }}>{fmtDate(data.visited_at)}</div>
        <div style={{ fontSize: 10, color: "var(--muted)" }}>{fmtTime(data.visited_at)}</div>
      </div>
    );
  
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled || loading}
      style={{
        background: disabled ? "var(--hover)" : "#3b82f610",
        border: `1px solid ${disabled ? "var(--border)" : "#3b82f640"}`,
        color: disabled ? "var(--muted)" : "#3b82f6",
        borderRadius: 8,
        padding: "7px 14px",
        fontSize: 12,
        fontWeight: 700,
        fontFamily: "var(--font)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all .15s",
        whiteSpace: "nowrap",
        opacity: loading ? 0.6 : 1,
        minWidth: 90,
      }}
    >
      {loading ? "…" : `+ Visit ${n}`}
    </button>
  );
}
