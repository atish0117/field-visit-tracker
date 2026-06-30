import { Icon, I } from "../lib/icons";

export function FilterBar({ filters, setFilters }) {
  const inp = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: 12,
    fontFamily: "var(--font)",
    outline: "none",
  };
  const sel = {
    ...inp,
    appearance: "none",
    cursor: "pointer",
    paddingRight: 28,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
  };

  const setF = (k) => (v) => setFilters((p) => ({ ...p, [k]: v }));
  const hasActive =
    filters.location_id || filters.address || filters.name || filters.status !== "all" || filters.reason !== "all";

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon d={I.filter} size={14} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--text)",
            fontFamily: "var(--font)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Filters
        </span>
        {hasActive && (
          <button
            onClick={() => setFilters({ location_id: "", name: "", address: "", status: "all", reason: "all" })}
            style={{
              marginLeft: "auto",
              fontSize: 11,
              color: "#ef4444",
              background: "#ef444410",
              border: "1px solid #ef444430",
              borderRadius: 6,
              padding: "3px 10px",
              cursor: "pointer",
              fontFamily: "var(--font)",
              fontWeight: 600,
            }}
          >
            Clear all
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
        {/* Filter by ID */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Location ID
          </div>
          <input
            value={filters.location_id}
            onChange={(e) => setF("location_id")(e.target.value)}
            placeholder="e.g. LOC001"
            style={{ ...inp, width: "100%", boxSizing: "border-box" }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
        
        {/* Filter by Name */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Location Name
          </div>
          <input
            value={filters.name}
            onChange={(e) => setF("name")(e.target.value)}
            placeholder="Branch name…"
            style={{ ...inp, width: "100%", boxSizing: "border-box" }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
        {/* Filter by Address */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Address
          </div>
          <input
            value={filters.address}
            onChange={(e) => setF("address")(e.target.value)}
            placeholder="City, street…"
            style={{ ...inp, width: "100%", boxSizing: "border-box" }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
        {/* Filter by Status */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Status
          </div>
          <select value={filters.status} onChange={(e) => setF("status")(e.target.value)} style={{ ...sel, width: "100%", boxSizing: "border-box" }}>
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        
        {/* Filter by Reason */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Reason
          </div>
          <select value={filters.reason} onChange={(e) => setF("reason")(e.target.value)} style={{ ...sel, width: "100%", boxSizing: "border-box" }}>
            <option value="all">All Reasons</option>
            <option value="R1">R1</option>
            <option value="R2">R2</option>
            <option value="R3">R3</option>
            <option value="R4">R4</option>
            <option value="R5">R5</option>
            <option value="R6">R6</option>
            <option value="R7">R7</option>
            <option value="R8">R8</option>
            <option value="R9">R9</option>
          </select>
        </div>
      </div>
    </div>
  );
}
