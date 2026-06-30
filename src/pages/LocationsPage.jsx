import { FilterBar } from "../components/FilterBar";
import { Btn } from "../components/ui/Form";
import { Icon, I } from "../lib/icons";
import { SBadge } from "../components/ui/Badge";
import { fmtDate } from "../lib/utils";

export function LocationsPage({
  locations,
  filters,
  setFilters,
  applyFilters,
  openAdd,
  openEdit,
  setDel,
  getStatus,
  getVisit,
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--font)" }}>
          {locations.length} locations in Appwrite
        </div>
        <Btn onClick={openAdd}>
          <Icon d={I.plus} size={14} />Add Location
        </Btn>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 12 }}>
        {applyFilters.map((loc) => (
          <div
            key={loc.location_id}
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18, transition: "box-shadow .15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(59,130,246,.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "#3b82f6", background: "#3b82f610", padding: "3px 8px", borderRadius: 5 }}>
                  {loc.location_id}
                </span>
              </div>
              <SBadge status={getStatus(loc.location_id)} />
            </div>
            {/* Name */}
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font)", marginBottom: 6 }}>
              {loc.name}
            </div>
            {/* Reason */}
            {loc.reason && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#eab308", background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", padding: "2px 8px", borderRadius: 6, marginBottom: 10, fontFamily: "var(--font)" }}>
                📋 {loc.reason}
              </div>
            )}
            {/* Address */}
            {loc.address && (
              <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font)", marginBottom: 10, lineHeight: 1.5 }}>
                📍 {loc.address}
              </div>
            )}
            {/* Visits summary */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {[1, 2].map((n) => {
                const v = getVisit(loc.location_id, n);
                return v ? (
                  <div key={n} style={{ flex: 1, background: "#22c55e10", border: "1px solid #22c55e30", borderRadius: 7, padding: "5px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e" }}>V{n} ✓</div>
                    <div style={{ fontSize: 9, color: "var(--muted)" }}>{fmtDate(v.visited_at)}</div>
                  </div>
                ) : (
                  <div key={n} style={{ flex: 1, background: "var(--hover)", border: "1px solid var(--border)", borderRadius: 7, padding: "5px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)" }}>V{n}</div>
                    <div style={{ fontSize: 9, color: "var(--muted)" }}>Pending</div>
                  </div>
                );
              })}
            </div>
            {/* Footer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {loc.link ? (
                <a href={loc.link} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none", fontWeight: 600 }}>
                  <Icon d={I.link} size={12} />View Map
                </a>
              ) : (
                <span />
              )}
              <div style={{ display: "flex", gap: 6 }}>
                <Btn size="sm" variant="ghost" onClick={() => openEdit(loc)}>
                  <Icon d={I.edit} size={12} />Edit
                </Btn>
                <Btn size="sm" variant="danger" onClick={() => setDel(loc.location_id)}>
                  <Icon d={I.trash} size={12} />
                </Btn>
              </div>
            </div>
          </div>
        ))}
        {applyFilters.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 50, color: "var(--muted)", fontFamily: "var(--font)", fontSize: 13 }}>
            {locations.length === 0 ? "No locations yet. Click \"Add Location\" to get started!" : "No locations match the current filters."}
          </div>
        )}
      </div>
    </div>
  );
}
