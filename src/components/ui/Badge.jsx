export function SBadge({ status }) {
  const c = {
    Completed: { bg: "#22c55e15", col: "#22c55e", bdr: "#22c55e30", lbl: "✓ Completed" },
    Partial: { bg: "#f59e0b15", col: "#f59e0b", bdr: "#f59e0b30", lbl: "◑ Partial" },
    Pending: { bg: "#ef444415", col: "#ef4444", bdr: "#ef444430", lbl: "○ Pending" },
  }[status] || { bg: "#ef444415", col: "#ef4444", bdr: "#ef444430", lbl: "○ Pending" };
  
  return (
    <span
      style={{
        background: c.bg,
        color: c.col,
        border: `1px solid ${c.bdr}`,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "var(--font)",
        whiteSpace: "nowrap",
      }}
    >
      {c.lbl}
    </span>
  );
}
