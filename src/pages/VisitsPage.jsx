import { Icon, I } from "../lib/icons";
import { FilterBar } from "../components/FilterBar";
import { VBtn } from "../components/ui/VisitButton";
import { SBadge } from "../components/ui/Badge";

export function VisitsPage({
  loading,
  stats,
  filters,
  setFilters,
  applyFilters,
  locations,
  getVisit,
  markVisit,
  vLoad,
  getStatus,
  openEdit,
  setDel,
}) {
  return (
    <div>
      {loading && (
        <div style={{ background: "#3b82f610", border: "1px solid #3b82f625", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#3b82f6", fontFamily: "var(--font)" }}>
          ⏳ Loading from Appwrite…
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginBottom: 16 }}>
        {[
          ["Total", stats.total, "#3b82f6"],
          ["Completed", stats.completed, "#22c55e"],
          ["Partial", stats.partial, "#f59e0b"],
          ["Pending", stats.pending, "#ef4444"],
          ["Visits/Month", stats.tv, "#6366f1"],
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", borderTop: `3px solid ${c}` }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: c, fontFamily: "var(--font)" }}>{v}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font)", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} setFilters={setFilters} />

      {/* Results count */}
      <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font)", marginBottom: 10 }}>
        Showing <strong style={{ color: "var(--text)" }}>{applyFilters.length}</strong> of {locations.length} locations
      </div>

      {/* Table */}
      <div className="visits-table-container">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--hover)" }}>
              {["Location ID", "Name", "Address", "Map", "Visit 1", "Visit 2", "Status", ""].map((h) => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "var(--muted)", fontFamily: "var(--font)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applyFilters.length === 0 && (
              <tr key="empty-state">
                <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontFamily: "var(--font)", fontSize: 13 }}>
                  {locations.length === 0 ? "No locations yet — add your first location!" : "No locations match your filters."}
                </td>
              </tr>
            )}
            {applyFilters.map((loc, idx) => {
              const v1 = getVisit(loc.location_id, 1),
                v2 = getVisit(loc.location_id, 2);
              return (
                <tr
                  key={loc.location_id || loc._docId || `fallback-${idx}`}
                  style={{ borderBottom: "1px solid var(--border)", transition: "background .1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#3b82f6", background: "#3b82f610", padding: "2px 8px", borderRadius: 4 }}>
                      {loc.location_id}
                    </span>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--text)", fontFamily: "var(--font)", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {loc.name}
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--muted)", fontFamily: "var(--font)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={loc.address}>
                    {loc.address || "—"}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    {loc.link ? (
                      <a href={loc.link} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none", fontWeight: 600 }}>
                        <Icon d={I.link} size={12} />Map
                      </a>
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <VBtn n={1} data={v1} onClick={() => markVisit(loc.location_id, 1)} disabled={!!v1} loading={vLoad[`${loc.location_id}_1`]} />
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <VBtn n={2} data={v2} onClick={() => markVisit(loc.location_id, 2)} disabled={!v1 || !!v2} loading={vLoad[`${loc.location_id}_2`]} />
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <SBadge status={getStatus(loc.location_id)} />
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(loc)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 4 }} title="Edit">
                        <Icon d={I.edit} size={14} />
                      </button>
                      <button onClick={() => setDel(loc.location_id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4, borderRadius: 4 }} title="Delete">
                        <Icon d={I.trash} size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="visits-cards-container">
        {applyFilters.length === 0 && (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 30, textAlign: "center", color: "var(--muted)", fontFamily: "var(--font)", fontSize: 13 }}>
            {locations.length === 0 ? "No locations yet — add your first location!" : "No locations match your filters."}
          </div>
        )}
        {applyFilters.map((loc, idx) => {
          const v1 = getVisit(loc.location_id, 1),
            v2 = getVisit(loc.location_id, 2);
          return (
            <div key={loc.location_id || loc._docId || `mobile-${idx}`} className="visits-card">
              <div className="visits-card-header">
                <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "#3b82f6", background: "#3b82f610", padding: "3px 8px", borderRadius: 4 }}>
                  {loc.location_id}
                </span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <SBadge status={getStatus(loc.location_id)} />
                  <button onClick={() => openEdit(loc)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 4 }}>
                    <Icon d={I.edit} size={15} />
                  </button>
                  <button onClick={() => setDel(loc.location_id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4, borderRadius: 4 }}>
                    <Icon d={I.trash} size={15} />
                  </button>
                </div>
              </div>
              
              <div className="visits-card-title">{loc.name}</div>
              
              {loc.address && (
                <div className="visits-card-address">
                  📍 {loc.address}
                </div>
              )}
              
              <div className="visits-card-actions">
                <VBtn n={1} data={v1} onClick={() => markVisit(loc.location_id, 1)} disabled={!!v1} loading={vLoad[`${loc.location_id}_1`]} />
                <VBtn n={2} data={v2} onClick={() => markVisit(loc.location_id, 2)} disabled={!v1 || !!v2} loading={vLoad[`${loc.location_id}_2`]} />
              </div>
              
              {loc.link && (
                <div className="visits-card-footer">
                  <a href={loc.link} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none", fontWeight: 600 }}>
                    <Icon d={I.link} size={12} />Open Map
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
