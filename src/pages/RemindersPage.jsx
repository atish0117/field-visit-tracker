import { Icon, I } from "../lib/icons";
import { Btn } from "../components/ui/Form";

export function RemindersPage({ pendingRem, getVisit, markVisit, vLoad, currentDay }) {
  if (currentDay !== undefined && currentDay <= 25) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "var(--muted)", fontFamily: "var(--font)", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16 }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>📅</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>No Active Reminders</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>
          Reminders are shown after the 25th of the month.
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
          Current Date: Day {currentDay} of the month
        </div>
      </div>
    );
  }

  if (pendingRem.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 70, color: "var(--muted)", fontFamily: "var(--font)" }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>🎉</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>All visits completed!</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>Great work this month.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {pendingRem.map((loc) => {
        const v1 = getVisit(loc.location_id, 1),
          v2 = getVisit(loc.location_id, 2);
        return (
          <div
            key={loc.location_id}
            style={{
              background: "var(--card)",
              border: "1px solid #f59e0b40",
              borderRadius: 12,
              padding: 16,
              borderLeft: "4px solid #f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "#f59e0b18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={I.warn} size={18} />
              </div>
              <div>
                <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: "#3b82f6" }}>{loc.location_id}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font)" }}>{loc.name}</div>
                <div style={{ fontSize: 12, color: "#f59e0b", marginTop: 2 }}>
                  ⚠ {!v1 ? "Both visits pending" : "2nd visit pending"} this month
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {!v1 && (
                <Btn size="sm" onClick={() => markVisit(loc.location_id, 1)} loading={vLoad[`${loc.location_id}_1`]}>
                  Mark Visit 1
                </Btn>
              )}
              {v1 && !v2 && (
                <Btn size="sm" onClick={() => markVisit(loc.location_id, 2)} loading={vLoad[`${loc.location_id}_2`]}>
                  Mark Visit 2
                </Btn>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
