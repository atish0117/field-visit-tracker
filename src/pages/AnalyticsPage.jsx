import { useMemo, useState } from "react";
import { BarChart } from "../components/ui/BarChart";
import { SBadge } from "../components/ui/Badge";
import { fmtDate } from "../lib/utils";
import { Icon, I } from "../lib/icons";

export function AnalyticsPage({ monthlyChart, locations, getVisit, getStatus }) {
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [breakdownSearch, setBreakdownSearch] = useState("");

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

  // Advanced Operations Metrics Calculations
  const operationsMetrics = useMemo(() => {
    let totalVisitsLogged = 0;
    let coveredLocations = 0;

    locations.forEach((loc) => {
      const v1 = getVisit(loc.location_id, 1);
      const v2 = getVisit(loc.location_id, 2);
      if (v1) totalVisitsLogged++;
      if (v2) totalVisitsLogged++;
      if (v1 || v2) {
        coveredLocations++;
      }
    });

    const maxPossibleVisits = locations.length * 2;
    const complianceRate = maxPossibleVisits > 0 ? Math.round((totalVisitsLogged / maxPossibleVisits) * 100) : 0;
    const remainingVisits = maxPossibleVisits - totalVisitsLogged;
    const coverageRate = locations.length > 0 ? Math.round((coveredLocations / locations.length) * 100) : 0;

    return {
      totalVisitsLogged,
      maxPossibleVisits,
      complianceRate,
      remainingVisits,
      coveredLocations,
      coverageRate
    };
  }, [locations, getVisit]);

  // Filter locations for Monthly Breakdown
  const filteredBreakdownLocations = useMemo(() => {
    return locations.filter((loc) => {
      const st = getStatus(loc.location_id);
      const statusMatch = activeStatusFilter === "all" || st === activeStatusFilter;

      const q = breakdownSearch.toLowerCase().trim();
      const searchMatch = !q || loc.location_id.toLowerCase().includes(q) || loc.name.toLowerCase().includes(q);

      return statusMatch && searchMatch;
    });
  }, [locations, activeStatusFilter, breakdownSearch, getStatus]);

  const visitsByWeekday = useMemo(() => {
    const weekdayCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const weekdaysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    locations.forEach((loc) => {
      [1, 2].forEach((n) => {
        const v = getVisit(loc.location_id, n);
        if (v?.visited_at) {
          const d = new Date(v.visited_at);
          const dayName = dayNames[d.getDay()];
          if (weekdayCounts[dayName] !== undefined) {
            weekdayCounts[dayName]++;
          }
        }
      });
    });

    return weekdaysOrder.map((day) => ({
      label: day,
      value: weekdayCounts[day]
    }));
  }, [locations, getVisit]);

  const toggleStatusFilter = (status) => {
    setActiveStatusFilter((prev) => (prev === status ? "all" : status));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Completion Status Summary Card */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4, fontFamily: "var(--font)" }}>
              Visit Completion Progress
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font)", marginBottom: 14 }}>
              Overall status breakdown of all {stats.total} locations. Click cards below to filter breakdown.
            </div>
          </div>
          {activeStatusFilter !== "all" && (
            <button
              onClick={() => setActiveStatusFilter("all")}
              style={{
                fontSize: 11,
                color: "#3b82f6",
                background: "#3b82f610",
                border: "1px solid #3b82f630",
                borderRadius: 6,
                padding: "3px 10px",
                cursor: "pointer",
                fontFamily: "var(--font)",
                fontWeight: 600,
                alignSelf: "flex-start"
              }}
            >
              Clear Status Filter
            </button>
          )}
        </div>

        {/* Stacked Progress Bar */}
        <div style={{ display: "flex", height: 16, borderRadius: 8, overflow: "hidden", background: "var(--hover)", marginBottom: 18 }}>
          {stats.completed > 0 && <div style={{ width: `${stats.completedPct}%`, background: "linear-gradient(90deg, #22c55e, #16a34a)", transition: "width 0.4s" }} title={`Completed: ${stats.completed}`} />}
          {stats.partial > 0 && <div style={{ width: `${stats.partialPct}%`, background: "linear-gradient(90deg, #f59e0b, #d97706)", transition: "width 0.4s" }} title={`Partial: ${stats.partial}`} />}
          {stats.pending > 0 && <div style={{ width: `${stats.pendingPct}%`, background: "linear-gradient(90deg, #ef4444, #dc2626)", transition: "width 0.4s" }} title={`Pending: ${stats.pending}`} />}
        </div>

        {/* Status Count Legend cards (Interactive) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12 }}>
          {[
            { label: "Completed", count: stats.completed, pct: stats.completedPct, color: "#22c55e", bg: "#22c55e10", statusVal: "Completed" },
            { label: "Partial", count: stats.partial, pct: stats.partialPct, color: "#f59e0b", bg: "#f59e0b10", statusVal: "Partial" },
            { label: "Pending", count: stats.pending, pct: stats.pendingPct, color: "#ef4444", bg: "#ef444410", statusVal: "Pending" },
          ].map((item) => {
            const isActive = activeStatusFilter === item.statusVal;
            return (
              <div
                key={item.label}
                onClick={() => toggleStatusFilter(item.statusVal)}
                style={{
                  background: item.bg,
                  border: `2px solid ${isActive ? item.color : "transparent"}`,
                  outline: `1px solid ${isActive ? "transparent" : `${item.color}25`}`,
                  borderRadius: 12,
                  padding: "10px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isActive ? "translateY(-1px)" : "none",
                  boxShadow: isActive ? `0 4px 12px ${item.color}20` : "none"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  if (!isActive) e.currentTarget.style.border = `2px solid ${item.color}35`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = isActive ? "translateY(-1px)" : "none";
                  if (!isActive) e.currentTarget.style.border = "2px solid transparent";
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800, color: item.color, fontFamily: "var(--font)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{item.count} <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>({item.pct}%)</span></span>
                  {isActive && <span style={{ fontSize: 12 }}>✓</span>}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", fontFamily: "var(--font)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advanced Performance & Config Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
        {/* Compliance Rate KPI Card */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", flexShrink: 0 }}>
            <span style={{ fontSize: 18, margin: "auto" }}>📈</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font)" }}>
              {operationsMetrics.complianceRate}%
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>
              Visit Compliance Rate
            </div>
          </div>
        </div>

        {/* Remaining Visits KPI Card */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", flexShrink: 0 }}>
            <span style={{ fontSize: 18, margin: "auto" }}>⏳</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font)" }}>
              {operationsMetrics.remainingVisits}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>
              Remaining Logs (Target: {operationsMetrics.maxPossibleVisits})
            </div>
          </div>
        </div>

        {/* Active Site Coverage KPI Card */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", flexShrink: 0 }}>
            <span style={{ fontSize: 18, margin: "auto" }}>📍</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font)" }}>
              {operationsMetrics.coverageRate}%
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>
              Active Site Coverage ({operationsMetrics.coveredLocations} of {locations.length})
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        <BarChart data={monthlyChart} title="Monthly Visits (Last 6 Months)" color="#3b82f6" />
        <BarChart data={visitsByWeekday} title="Visits by Day of the Week" color="#6366f1" />
      </div>

      {/* Monthly breakdown */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>

        {/* Header with Search Input */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font)" }}>
              Current Month Breakdown
            </div>
            {activeStatusFilter !== "all" && (
              <span style={{ background: "#3b82f615", color: "#3b82f6", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px", fontFamily: "var(--font)" }}>
                Filtered: {activeStatusFilter}
              </span>
            )}
          </div>
          <div style={{ position: "relative", width: "100%", maxWidth: 260 }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", display: "flex", alignItems: "center" }}>
              <Icon d={I.search} size={12} />
            </div>
            <input
              value={breakdownSearch}
              onChange={(e) => setBreakdownSearch(e.target.value)}
              placeholder="Search breakdown ID, name…"
              style={{
                width: "100%",
                padding: "6px 12px 6px 28px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: 11,
                fontFamily: "var(--font)",
                outline: "none"
              }}
            />
            {breakdownSearch && (
              <button
                onClick={() => setBreakdownSearch("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: "bold",
                  padding: 2
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Grid List */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
          {filteredBreakdownLocations.map((loc) => {
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
          {filteredBreakdownLocations.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "var(--muted)", fontFamily: "var(--font)", fontSize: 12 }}>
              No breakdown items match the active filters or search query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/*
* Git Commit Message Details for AnalyticsPage.jsx:
* - Update operationsMetrics calculations to compute active site coverage and coverage rate.
* - Remove R1 (Top RBO Reason) KPI card and replace with Active Site Coverage KPI card.
* - Remove Top Locations by Visit Count chart and replace with Visits by Day of the Week bar chart.
*/
