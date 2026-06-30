import { useState, useMemo, useEffect, useRef } from "react";
import { getDIM, getFDM, getNow, fmtDateFull, fmtTime } from "../lib/utils";

export function CalendarPage({ calYear, calMonth, calDay, setCalMonth, setCalYear, setCalDay, calVisits }) {
  const days = getDIM(calYear, calMonth),
    fd = getFDM(calYear, calMonth);
  const cells = Array.from({ length: fd + days }, (_, i) => (i < fd ? null : i - fd + 1));
  const selV = calDay ? calVisits[calDay] || [] : [];

  // State to hold the currently selected visit details
  const [selectedVisit, setSelectedVisit] = useState(null);
  const detailsRef = useRef(null);

  // Reset selected visit details whenever selected day changes
  useEffect(() => {
    setSelectedVisit(null);
  }, [calDay]);

  // Scroll details panel into view when selected
  useEffect(() => {
    if (selectedVisit) {
      const timer = setTimeout(() => {
        if (detailsRef.current) {
          detailsRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedVisit]);

  // Compute total visits recorded in this month
  const totalMonthVisits = useMemo(() => {
    let count = 0;
    Object.values(calVisits).forEach((dayVisits) => {
      count += dayVisits.length;
    });
    return count;
  }, [calVisits]);

  return (
    <div 
      className={`cal-grid ${selectedVisit ? "with-details" : ""}`} 
      style={{ 
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      {/* Calendar Card */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button
            onClick={() => {
              let m = calMonth - 1,
                y = calYear;
              if (m < 0) {
                m = 11;
                y--;
              }
              setCalMonth(m);
              setCalYear(y);
              setCalDay(null);
              setSelectedVisit(null);
            }}
            style={{ background: "var(--hover)", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", color: "var(--text)", fontFamily: "var(--font)", fontSize: 13, fontWeight: 600, transition: "background 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--border)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--hover)")}
          >
            ‹
          </button>
          
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font)" }}>
              {new Date(calYear, calMonth).toLocaleString("default", { month: "long", year: "numeric" })}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font)", marginTop: 2, fontWeight: 600 }}>
              {totalMonthVisits} visits recorded this month
            </div>
          </div>
          
          <button
            onClick={() => {
              let m = calMonth + 1,
                y = calYear;
              if (m > 11) {
                m = 0;
                y++;
              }
              setCalMonth(m);
              setCalYear(y);
              setCalDay(null);
              setSelectedVisit(null);
            }}
            style={{ background: "var(--hover)", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", color: "var(--text)", fontFamily: "var(--font)", fontSize: 13, fontWeight: 600, transition: "background 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--border)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--hover)")}
          >
            ›
          </button>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--muted)", padding: "2px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {d}
            </div>
          ))}
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            
            const dayVisits = calVisits[d] || [];
            const visitsCount = dayVisits.length;
            const hv = visitsCount > 0;
            const isT = d === getNow().getDate() && calMonth === getNow().getMonth() && calYear === getNow().getFullYear();
            const isSel = d === calDay;
            
            // Dynamic cell background based on visit density
            let cellBg = "transparent";
            if (isSel) {
              cellBg = "#3b82f625";
            } else if (isT) {
              cellBg = "#3b82f612";
            } else if (hv) {
              cellBg = visitsCount >= 2 ? "rgba(34, 197, 94, 0.15)" : "rgba(34, 197, 94, 0.06)";
            }

            return (
              <button
                key={i}
                onClick={() => {
                  setCalDay(d === calDay ? null : d);
                  setSelectedVisit(null);
                }}
                style={{
                  aspectRatio: "1",
                  borderRadius: 8,
                  border: `2px solid ${isSel ? "#3b82f6" : "transparent"}`,
                  background: cellBg,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  padding: 2,
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.06)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ fontSize: 13, fontWeight: isT ? 800 : 600, color: isT ? "#3b82f6" : "var(--text)", fontFamily: "var(--font)" }}>
                  {d}
                </span>
                {hv && (
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#22c55e", background: "#22c55e15", padding: "1px 5px", borderRadius: 5 }}>
                    {visitsCount}v
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Visits List Sidebar */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 18, minHeight: 200 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font)", marginBottom: 14, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
          {calDay ? fmtDateFull(new Date(calYear, calMonth, calDay).getTime()) : "Select a date"}
        </div>
        {calDay && selV.length === 0 && (
          <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>
            No visits recorded
          </div>
        )}
        {!calDay && (
          <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>
            Click on a calendar date to view registered visits.
          </div>
        )}
        {selV.map((v, i) => {
          const isClicked = selectedVisit === v;
          return (
            <div 
              key={i} 
              onClick={() => setSelectedVisit(isClicked ? null : v)}
              style={{ 
                padding: "10px 12px", 
                background: "var(--hover)", 
                borderRadius: 10, 
                marginBottom: 8, 
                borderLeft: `3px solid ${isClicked ? "#10b981" : "#3b82f6"}`, 
                cursor: "pointer", 
                boxShadow: isClicked ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                transform: isClicked ? "translateX(2px)" : "none",
                transition: "all 0.2s ease" 
              }}
              onMouseEnter={(e) => {
                if (!isClicked) e.currentTarget.style.transform = "translateX(2px)";
              }}
              onMouseLeave={(e) => {
                if (!isClicked) e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "#3b82f6", background: "#3b82f612", padding: "1px 6px", borderRadius: 4 }}>
                  {v.loc.location_id}
                </span>
                {v.loc.reason && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#eab308", background: "rgba(234,179,8,0.1)", padding: "1px 6px", borderRadius: 4 }}>
                    📋 {v.loc.reason}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font)" }}>{v.loc.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, fontFamily: "var(--font)" }}>
                Visit {v.num} · ⏰ {fmtTime(v.ts)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Visit Full Location Details Panel */}
      {selectedVisit && (
        <div 
          ref={detailsRef}
          style={{ 
            background: "var(--card)", 
            border: "1px solid var(--border)", 
            borderRadius: 16, 
            padding: 18, 
            position: "relative", 
            animation: "popIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          {/* Close button */}
          <button 
            onClick={() => setSelectedVisit(null)}
            style={{ 
              position: "absolute", 
              right: 12, 
              top: 12, 
              background: "none", 
              border: "none", 
              color: "var(--muted)", 
              cursor: "pointer", 
              fontSize: 16, 
              fontWeight: "bold",
              padding: 4
            }}
          >
            ×
          </button>
          
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font)", marginBottom: 14, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
            Location Details
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 3, letterSpacing: "0.03em" }}>Location ID</div>
              <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: "#3b82f6", background: "#3b82f612", padding: "2px 8px", borderRadius: 4 }}>
                {selectedVisit.loc.location_id}
              </span>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 3, letterSpacing: "0.03em" }}>Location Name</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font)" }}>
                {selectedVisit.loc.name}
              </div>
            </div>

            {selectedVisit.loc.reason && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 3, letterSpacing: "0.03em" }}>RBO Reason</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#eab308", background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", padding: "2px 8px", borderRadius: 6, display: "inline-block" }}>
                  📋 {selectedVisit.loc.reason}
                </span>
              </div>
            )}

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 3, letterSpacing: "0.03em" }}>Full Address</div>
              <div style={{ fontSize: 12, color: "var(--text)", fontFamily: "var(--font)", lineHeight: 1.5 }}>
                📍 {selectedVisit.loc.address || "—"}
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4, letterSpacing: "0.03em" }}>Visit Log</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font)" }}>
                Visit #{selectedVisit.num}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
                📅 Date: {new Date(selectedVisit.ts).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
                ⏰ Time: {fmtTime(selectedVisit.ts)}
              </div>
            </div>

            {selectedVisit.loc.link && (
              <a 
                href={selectedVisit.loc.link} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  marginTop: 6,
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  gap: 8,
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", 
                  color: "#fff", 
                  fontSize: 12,
                  fontWeight: 700, 
                  textDecoration: "none", 
                  padding: "9px 12px", 
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                  fontFamily: "var(--font)",
                  textAlign: "center"
                }}
              >
                🗺️ Open in Google Maps
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
