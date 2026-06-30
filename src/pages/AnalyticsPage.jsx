import { useMemo } from "react";
import { BarChart } from "../components/ui/BarChart";
import { SBadge } from "../components/ui/Badge";
import { fmtDate } from "../lib/utils";

export function AnalyticsPage({ monthlyChart, topLocs, locations, getVisit, getStatus }) {
  // Compute overall status statistics for dashboard analytics
  const stats = useMemo(() => {
    let completed = 0, partial = 0, pending = 0;
    locations.forEach((loc) => {
      const st = getStatus(loc.location_id);
      if (st === "Completed") completed++;
      else if (st === "Partial") partial++;
      else pending++;
    });
    const total = locations.length || 1;
    return {
      completed,
      partial,
      pending,
      total: locations.length,
      completedPct: Math.round((completed / total) * 100),
      partialPct: Math.round((partial / total) * 100),
      pendingPct: Math.round((pending / total) * 100),
    };
  }, [locations, getStatus]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Completion Status Summary Card */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4, fontFamily: "var(--font)" }}>
          Visit Completion Progress
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font)", marginBottom: 14 }}>
          Overall status breakdown of all {stats.total} locations
        </div>
        
        {/* Stacked Progress Bar */}
        <div style={{ display: "flex", height: 16, borderRadius: 8, overflow: "hidden", background: "var(--hover)", marginBottom: 18 }}>
          {stats.completed > 0 && <div style={{ width: `${stats.completedPct}%`, background: "linear-gradient(90deg, #22c55e, #16a34a)", transition: "width 0.4s" }} title={`Completed: ${stats.completed}`} />}
          {stats.partial > 0 && <div style={{ width: `${stats.partialPct}%`, background: "linear-gradient(90deg, #f59e0b, #d97706)", transition: "width 0.4s" }} title={`Partial: ${stats.partial}`} />}
          {stats.pending > 0 && <div style={{ width: `${stats.pendingPct}%`, background: "linear-gradient(90deg, #ef4444, #dc2626)", transition: "width 0.4s" }} title={`Pending: ${stats.pending}`} />}
        </div>
        
        {/* Status Count Legend cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12 }}>
          {[
            { label: "Completed", count: stats.completed, pct: stats.completedPct, color: "#22c55e", bg: "#22c55e10" },
            { label: "Partial", count: stats.partial, pct: stats.partialPct, color: "#f59e0b", bg: "#f59e0b10" },
            { label: "Pending", count: stats.pending, pct: stats.pendingPct, color: "#ef4444", bg: "#ef444410" },
          ].map((item) => (
            <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.color}25`, borderRadius: 12, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: item.color, fontFamily: "var(--font)" }}>
                {item.count} <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>({item.pct}%)</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", fontFamily: "var(--font)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        <BarChart data={monthlyChart} title="Monthly Visits (Last 6 Months)" color="#3b82f6" />
        <BarChart data={topLocs} title="Top Locations by Visit Count" color="#6366f1" />
      </div>
     
      {/* Monthly breakdown */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14, fontFamily: "var(--font)" }}>
          Current Month Breakdown
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
          {locations.map((loc) => {
            const v1 = getVisit(loc.location_id, 1),
              v2 = getVisit(loc.location_id, 2),
              st = getStatus(loc.location_id);
            return (
              <div
                key={loc.location_id}
                style={{
                  padding: "12px 14px",
                  background: "var(--hover)",
                  borderRadius: 10,
                  borderLeft: `3px solid ${st === "Completed" ? "#22c55e" : st === "Partial" ? "#f59e0b" : "#ef4444"}`,
                }}
              >
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#3b82f6" }}>{loc.location_id}</span>
                  <SBadge status={st} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font)", marginBottom: 3 }}>
                  {loc.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font)" }}>
                  {v1 ? `V1: ${fmtDate(v1.visited_at)}` : "V1: —"} · {v2 ? `V2: ${fmtDate(v2.visited_at)}` : "V2: —"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
