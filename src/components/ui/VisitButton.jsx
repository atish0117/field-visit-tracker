import { fmtDate, fmtTime } from "../../lib/utils";

export function VBtn({ n, data, onClick, disabled, loading, lockedReason, isRecommended, onViewNotes }) {
  if (data) {
    const hasNotes = data.notes && (data.notes.feedback || data.notes.problem || data.notes.nextAction || data.notes.remarks);
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
        {hasNotes && (
          <button
            onClick={() => onViewNotes && onViewNotes(data.notes)}
            style={{
              marginTop: 4,
              width: "100%",
              background: "#22c55e10",
              border: "1px solid #22c55e30",
              borderRadius: 4,
              fontSize: 9,
              color: "#16a34a",
              cursor: "pointer",
              padding: "2px 4px",
              fontFamily: "var(--font)",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              outline: "none"
            }}
          >
            📝 Notes
          </button>
        )}
      </div>
    );
  }
  
  const isDateLocked = lockedReason === "date_locked";
  const btnText = loading ? "…" : isDateLocked ? "🔒 Day 16+" : `+ Visit ${n}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
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
        {btnText}
      </button>
      {isRecommended && (
        <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          ★ Recommended
        </span>
      )}
      {isDateLocked && (
        <span style={{ fontSize: 9, color: "var(--muted)", fontWeight: 500, whiteSpace: "nowrap" }}>
          Unlocks Day 16
        </span>
      )}
    </div>
  );
}

