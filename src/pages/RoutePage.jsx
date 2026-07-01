import { useState, useMemo, useEffect } from "react";
import { Icon, I } from "../lib/icons";
import { Btn } from "../components/ui/Form";

// Helper to parse coordinates from Google Maps URLs
function parseCoordsFromUrl(url) {
  if (!url) return { latitude: null, longitude: null };
  const matchQ = url.match(/[?&]q=([^&,]+),([^&]+)/);
  if (matchQ) {
    return { latitude: parseFloat(matchQ[1]), longitude: parseFloat(matchQ[2]) };
  }
  const matchAt = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (matchAt) {
    return { latitude: parseFloat(matchAt[1]), longitude: parseFloat(matchAt[2]) };
  }
  return { latitude: null, longitude: null };
}

// Haversine formula to compute geodesic distance in km
function haversineDistance(c1, c2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(c2.latitude - c1.latitude);
  const dLon = toRad(c2.longitude - c1.longitude);
  const lat1 = toRad(c1.latitude);
  const lat2 = toRad(c2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function RoutePage({ locations, getStatus }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [startType, setStartType] = useState("gps"); // "gps" or "loc"
  const [gpsCoords, setGpsCoords] = useState(null); // { latitude, longitude }
  const [startLocId, setStartLocId] = useState("");
  const [loadingGps, setLoadingGps] = useState(true); // Default to true since we fetch on mount
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Parse coordinates for all locations
  const locationsWithCoords = useMemo(() => {
    return locations.map((l) => {
      const lat = parseFloat(l.latitude);
      const lng = parseFloat(l.longitude);
      const hasCoords = !isNaN(lat) && !isNaN(lng);
      return {
        ...l,
        coords: hasCoords ? { latitude: lat, longitude: lng } : parseCoordsFromUrl(l.link),
      };
    });
  }, [locations]);

  // Filter checklist locations based on search query
  const filteredLocations = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return locationsWithCoords;
    return locationsWithCoords.filter((loc) =>
      loc.location_id.toLowerCase().includes(q) ||
      loc.name.toLowerCase().includes(q) ||
      (loc.address || "").toLowerCase().includes(q)
    );
  }, [locationsWithCoords, searchTerm]);

  // On mount, auto-fetch GPS coordinates
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoadingGps(false);
      },
      (err) => {
        console.error("GPS error:", err);
        setLoadingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Auto-optimize route dynamically on any configuration/selection change
  useEffect(() => {
    if (selectedIds.length === 0) {
      setTimeout(() => {
        setOptimizedRoute(null);
      }, 0);
      return;
    }

    // Determine starting coordinates
    let startPoint = null;
    let startLabel = "Starting Point";

    if (startType === "gps") {
      if (!gpsCoords) return;
      startPoint = gpsCoords;
      startLabel = "My GPS Location";
    } else {
      const sLoc = locationsWithCoords.find((l) => l.location_id === startLocId);
      if (!sLoc || !sLoc.coords.latitude) return;
      startPoint = sLoc.coords;
      startLabel = sLoc.name;
    }

    const targets = locationsWithCoords.filter((l) =>
      selectedIds.includes(l.location_id)
    );

    const withCoords = targets.filter((l) => l.coords.latitude && l.coords.longitude);
    const noCoords = targets.filter((l) => !l.coords.latitude || !l.coords.longitude);

    const path = [];
    let currentPos = startPoint;
    let totalDist = 0;
    const unvisited = [...withCoords];

    while (unvisited.length > 0) {
      let nearestIdx = -1;
      let minD = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const d = haversineDistance(currentPos, unvisited[i].coords);
        if (d < minD) {
          minD = d;
          nearestIdx = i;
        }
      }

      if (nearestIdx !== -1) {
        const nextLoc = unvisited.splice(nearestIdx, 1)[0];
        path.push({
          ...nextLoc,
          distanceFromPrev: minD,
        });
        totalDist += minD;
        currentPos = nextLoc.coords;
      } else {
        break;
      }
    }

    // Wrap in setTimeout to prevent React synchronous state update warnings
    const timer = setTimeout(() => {
      setOptimizedRoute({
        startLabel,
        startPoint,
        path: [...path, ...noCoords.map(l => ({ ...l, distanceFromPrev: null }))],
        totalDistance: parseFloat(totalDist.toFixed(2)),
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [gpsCoords, selectedIds, startType, startLocId, locationsWithCoords]);

  // Request browser geolocation
  const fetchGps = () => {
    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoadingGps(false);
      },
      (err) => {
        console.error("GPS error:", err);
        alert("Could not fetch GPS. Please select a starting location instead or check permissions.");
        setLoadingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Helper to pre-select all partial or pending locations
  const selectAllPending = () => {
    const pendingIds = locations
      .filter((l) => getStatus(l.location_id) !== "Completed")
      .map((l) => l.location_id);
    setSelectedIds(pendingIds);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };



  // Generate Google Maps Directions URL
  const gmapsUrl = useMemo(() => {
    if (!optimizedRoute) return "";
    const startStr = `${optimizedRoute.startPoint.latitude},${optimizedRoute.startPoint.longitude}`;
    
    // Filter locations in the path that have valid coordinates
    const pathWithCoords = optimizedRoute.path.filter((p) => p.coords.latitude);
    if (pathWithCoords.length === 0) return "";

    const last = pathWithCoords[pathWithCoords.length - 1];
    const waypoints = pathWithCoords.slice(0, -1);
    
    const destStr = `${last.coords.latitude},${last.coords.longitude}`;
    const waypointsStr = waypoints
      .map((w) => `${w.coords.latitude},${w.coords.longitude}`)
      .join("|");

    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startStr)}&destination=${encodeURIComponent(destStr)}&waypoints=${encodeURIComponent(waypointsStr)}&travelmode=driving`;
  }, [optimizedRoute]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily: "var(--font)" }}>
      
      {/* Configuration Section */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#3b82f6" }}>🧭</span> Configure Route Optimization
        </h2>

        {/* Start Point Config */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>
            Starting Point
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => setStartType("gps")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${startType === "gps" ? "#3b82f6" : "var(--border)"}`,
                background: startType === "gps" ? "#3b82f610" : "transparent",
                color: startType === "gps" ? "#3b82f6" : "var(--text)",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              📍 Use GPS Location
            </button>
            <button
              onClick={() => setStartType("loc")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${startType === "loc" ? "#3b82f6" : "var(--border)"}`,
                background: startType === "loc" ? "#3b82f610" : "transparent",
                color: startType === "loc" ? "#3b82f6" : "var(--text)",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              🏢 Use Location Coordinates
            </button>
          </div>

          {startType === "gps" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8 }}>
              <Btn size="sm" onClick={fetchGps} loading={loadingGps}>
                {gpsCoords ? "🔄 Refresh GPS" : "🛰 Fetch GPS Location"}
              </Btn>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                {gpsCoords
                  ? `Lat: ${gpsCoords.latitude.toFixed(5)}, Lng: ${gpsCoords.longitude.toFixed(5)}`
                  : "GPS location not loaded"}
              </div>
            </div>
          ) : (
            <select
              value={startLocId}
              onChange={(e) => setStartLocId(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: 12,
                fontFamily: "var(--font)",
                outline: "none",
              }}
            >
              <option value="">Select a location to start from...</option>
              {locationsWithCoords
                .filter((l) => l.coords.latitude)
                .map((l) => (
                  <option key={l.location_id} value={l.location_id}>
                    {l.location_id} - {l.name}
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Location Selector */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>
              Locations to Visit Today ({selectedIds.length} selected)
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={selectAllPending}
                style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                Select All Pending
              </button>
              <span style={{ color: "var(--border)" }}>|</span>
              <button
                onClick={() => setSelectedIds([])}
                style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative", marginBottom: 8 }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", display: "flex", alignItems: "center" }}>
              <Icon d={I.search} size={13} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, name, address to select..."
              style={{
                width: "100%",
                padding: "8px 12px 8px 30px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: 12,
                fontFamily: "var(--font)",
                outline: "none",
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <Icon d={I.x} size={12} />
              </button>
            )}
          </div>

          <div
            style={{
              maxHeight: 200,
              overflowY: "auto",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg)",
              padding: 6,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {filteredLocations.length === 0 && (
              <div style={{ padding: 12, textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
                No matching locations found.
              </div>
            )}
            {filteredLocations.map((loc) => {
              const hasCoords = !!(loc.coords.latitude && loc.coords.longitude);
              const isSelected = selectedIds.includes(loc.location_id);
              const status = getStatus(loc.location_id);
              return (
                <div
                  key={loc.location_id}
                  onClick={() => toggleSelect(loc.location_id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: isSelected ? "var(--hover)" : "transparent",
                    transition: "background 0.1s",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by div click
                    style={{ pointerEvents: "none" }}
                  />
                  <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#3b82f6", marginRight: 6 }}>
                        {loc.location_id}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{loc.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: status === "Completed" ? "#22c55e20" : status === "Partial" ? "#f59e0b20" : "#ef444420", color: status === "Completed" ? "#22c55e" : status === "Partial" ? "#f59e0b" : "#ef4444", fontWeight: 700 }}>
                        {status}
                      </span>
                      {!hasCoords && (
                        <span style={{ fontSize: 10, color: "#f59e0b" }} title="No coordinates: link is missing or unparseable. Will be scheduled last.">
                          ⚠️ No GPS
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedIds.length > 0 && !optimizedRoute && (
          <div style={{ padding: "10px", borderRadius: 8, background: "#3b82f610", border: "1px solid #3b82f630", color: "#3b82f6", fontSize: 11, textAlign: "center", fontWeight: 700 }}>
            ⚡ Recalculating path...
          </div>
        )}
      </div>

      {/* Results Section */}
      {optimizedRoute && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: 0 }}>
                ✨ Optimized Field Route
              </h2>
              <p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0 0" }}>
                Computed using Nearest Neighbor geodesic algorithm
              </p>
            </div>
            {optimizedRoute.totalDistance > 0 && (
              <div style={{ background: "#3b82f615", border: "1px solid #3b82f630", borderRadius: 8, padding: "4px 10px", textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#3b82f6" }}>
                  {optimizedRoute.totalDistance} km
                </div>
                <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Est. Travel Distance
                </div>
              </div>
            )}
          </div>

          {/* Path Timeline */}
          <div style={{ display: "flex", flexDirection: "column", position: "relative", paddingLeft: 20, borderLeft: "2px dashed var(--border)", marginLeft: 10, gap: 14 }}>
            {/* Start Node */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: -26, top: 2, width: 10, height: 10, borderRadius: "50%", background: "#3b82f6" }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase" }}>Start</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{optimizedRoute.startLabel}</div>
            </div>

            {/* Waypoints */}
            {optimizedRoute.path.map((loc, idx) => (
              <div key={loc.location_id} style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: -26, top: 4, width: 10, height: 10, borderRadius: "50%", background: getStatus(loc.location_id) === "Completed" ? "#22c55e" : "#f59e0b" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)" }}>
                      STOP {idx + 1}
                      {loc.distanceFromPrev !== null && ` (${loc.distanceFromPrev.toFixed(2)} km away)`}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                      <span style={{ fontFamily: "monospace", color: "#3b82f6", fontSize: 11, marginRight: 6 }}>{loc.location_id}</span>
                      {loc.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {loc.address || "No address provided"}
                    </div>
                  </div>
                  {loc.link && (
                    <a
                      href={loc.link}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "4px 8px",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        color: "var(--text)",
                        background: "var(--hover)",
                        fontSize: 10,
                        textDecoration: "none",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Icon d={I.link} size={10} /> Maps
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Launch Directions */}
          {gmapsUrl ? (
            <a
              href={gmapsUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                marginTop: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
                textDecoration: "none",
                textAlign: "center",
                boxShadow: "0 4px 10px rgba(22, 163, 74, 0.2)",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.9)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
            >
              🚗 Open Optimized Route in Google Maps Directions
            </a>
          ) : (
            <div style={{ marginTop: 18, padding: 10, borderRadius: 8, background: "#f59e0b10", border: "1px solid #f59e0b30", color: "#f59e0b", fontSize: 11, textAlign: "center" }}>
              ⚠️ None of the selected locations have coordinates to generate a Google Maps route.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
