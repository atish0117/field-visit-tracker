import { useState, useEffect, useRef, useMemo } from "react";
import { Icon, I } from "./lib/icons";
import { ls, getNow, monthYear } from "./lib/utils";
import { awSvc } from "./lib/appwrite";
import { Toasts, toast } from "./components/ui/Toast";
import { Modal } from "./components/ui/Modal";
import { Inp, Btn, Sel } from "./components/ui/Form";
import { Sidebar } from "./components/Sidebar";

// Pages
import { VisitsPage } from "./pages/VisitsPage";
import { LocationsPage } from "./pages/LocationsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { RemindersPage } from "./pages/RemindersPage";

function parseCoordsFromUrl(url) {
  if (!url) return { latitude: "", longitude: "" };
  const matchQ = url.match(/[?&]q=([^&,]+),([^&]+)/);
  if (matchQ) {
    return { latitude: matchQ[1], longitude: matchQ[2] };
  }
  const matchAt = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (matchAt) {
    return { latitude: matchAt[1], longitude: matchAt[2] };
  }
  return { latitude: "", longitude: "" };
}

export default function App() {
  const [dark, setDark] = useState(() => ls.get("fv_dark", false));
  const [tab, setTab] = useState("visits");
  const [sidebarOpen, setSO] = useState(false);

  // Global search (top bar)
  const [search, setSearch] = useState("");
  // Rich filter bar (with reason dropdown search)
  const [filters, setFilters] = useState({ location_id: "", name: "", address: "", status: "all", reason: "all" });

  // Calendar
  const [calYear, setCalYear] = useState(getNow().getFullYear());
  const [calMonth, setCalMonth] = useState(getNow().getMonth());
  const [calDay, setCalDay] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [vLoad, setVLoad] = useState({});

  // Data
  const [profile, setProfile] = useState({ name: "", employee_id: "", avatar_url: "" });
  const [locations, setLocations] = useState([]);
  const [visits, setVisits] = useState({});

  // Modals
  const [editProfile, setEP] = useState(false);
  const [locModal, setLocModal] = useState(null);
  const [delConfirm, setDel] = useState(null);
  const [profileForm, setPF] = useState({});
  const [locForm, setLF] = useState({ location_id: "", name: "", address: "", link: "", reason: "R1", latitude: "", longitude: "" });
  const avatarRef = useRef();

  const mk = monthYear();

  // Persist dark mode
  useEffect(() => {
    ls.set("fv_dark", dark);
  }, [dark]);

  // Initial load from Appwrite
  useEffect(() => {
    if (awSvc.isConfigured) {
      syncAll();
    }
  }, []);

  if (!awSvc.isConfigured) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f1117", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ background: "#1a1d27", padding: 40, borderRadius: 24, border: "1px solid #2a2d3a", maxWidth: 480, width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #ef4444, #f97316)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 32 }}>☁️</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 10px 0" }}>Appwrite Integration Missing</h1>
          <p style={{ color: "#9ca3af", lineHeight: 1.6, marginBottom: 24 }}>
            It looks like your <strong style={{ color: "#fff" }}>.env</strong> file is empty or missing your Appwrite credentials. The backend cannot start without it.
          </p>
          <div style={{ background: "#000", padding: 20, borderRadius: 12, border: "1px solid #374151" }}>
            <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 10 }}>Please add your IDs to <code>.env</code>:</div>
            <code style={{ color: "#60a5fa", fontSize: 12, whiteSpace: "pre-wrap", display: "block", lineHeight: 1.5 }}>
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1<br/>
VITE_APPWRITE_PROJECT_ID=your_project_id<br/>
VITE_APPWRITE_DATABASE_ID=your_database_id<br/>
...
            </code>
          </div>
          <p style={{ color: "#fbbf24", fontSize: 13, marginTop: 24, fontWeight: 700 }}>
            ⚠️ Important: After editing .env, you must RESTART your terminal (close it and run `npm run dev` again)!
          </p>
        </div>
      </div>
    );
  }

  const syncAll = async () => {
    setLoading(true);
    try {
      const [locs, vis, prof] = await Promise.all([awSvc.getLocations(), awSvc.getVisits(), awSvc.getProfile()]);
      setLocations(locs);
      setVisits(vis);
      if (prof) setProfile(prof);
      toast("Synced with Appwrite ☁️", "info");
    } catch (e) {
      toast("Sync failed: " + (e.message || "unknown"), "error");
    } finally {
      setLoading(false);
    }
  };

  // Visit helpers
  const getVisit = (locId, n) => visits[mk]?.[locId]?.[`v${n}`];
  const getStatus = (locId) => {
    const v1 = getVisit(locId, 1), v2 = getVisit(locId, 2);
    return v1 && v2 ? "Completed" : v1 || v2 ? "Partial" : "Pending";
  };

  const markVisit = async (locId, n) => {
    const key = `${locId}_${n}`;
    setVLoad((p) => ({ ...p, [key]: true }));
    const ts = new Date().toISOString(); // To send timestamptz format
    try {
      const vd = await awSvc.markVisit(locId, n, ts);
      setVisits((prev) => ({
        ...prev,
        [mk]: { ...prev[mk], [locId]: { ...prev[mk]?.[locId], [`v${n}`]: vd } },
      }));
      toast(`Visit ${n} marked for ${locations.find((l) => l.location_id === locId)?.name}! ✅`);
    } catch (e) {
      toast("Failed: " + e.message, "error");
    } finally {
      setVLoad((p) => ({ ...p, [key]: false }));
    }
  };

  // Location CRUD
  const openAdd = () => {
    setLF({ location_id: `LOC${String(locations.length + 1).padStart(3, "0")}`, name: "", address: "", link: "", reason: "R1", latitude: "", longitude: "" });
    setLocModal({ mode: "add" });
  };
  const openEdit = (loc) => {
    const coords = parseCoordsFromUrl(loc.link);
    setLF({ ...loc, latitude: coords.latitude, longitude: coords.longitude });
    setLocModal({ mode: "edit", orig: loc });
  };

  const handleCoordsChange = (lat, lng) => {
    let link = locForm.link;
    if (lat && lng) {
      link = `https://www.google.com/maps?q=${lat},${lng}`;
    } else if (!lat && !lng) {
      link = "";
    }
    setLF((p) => ({ ...p, latitude: lat, longitude: lng, link }));
  };

  const handleLinkChange = (url) => {
    const coords = parseCoordsFromUrl(url);
    setLF((p) => ({ ...p, link: url, latitude: coords.latitude, longitude: coords.longitude }));
  };

  const saveLoc = async () => {
    if (!locForm.location_id || !locForm.name) { toast("ID and Name required", "error"); return; }
    setSyncing(true);
    try {
      if (locModal.mode === "add") {
        if (locations.find((l) => l.location_id === locForm.location_id)) { toast("Location ID already exists", "error"); return; }
        const nl = await awSvc.addLocation(locForm);
        setLocations((p) => [...p, nl]);
        toast("Location added ☁️");
      } else {
        const dId = locModal.orig._docId;
        await awSvc.updateLocation(dId, locForm);
        setLocations((p) => p.map((l) => (l.location_id === locModal.orig.location_id ? { ...locForm, _docId: dId } : l)));
        toast("Location updated ☁️");
      }
      setLocModal(null);
    } catch (e) {
      toast("Error: " + e.message, "error");
    } finally {
      setSyncing(false);
    }
  };

  const deleteLoc = async (id) => {
    const loc = locations.find((l) => l.location_id === id);
    setSyncing(true);
    try {
      if (loc?._docId) await awSvc.deleteLocation(loc._docId);
      setLocations((p) => p.filter((l) => l.location_id !== id));
      setDel(null);
      toast("Deleted from Appwrite", "warning");
    } catch (e) {
      toast("Error: " + e.message, "error");
    } finally {
      setSyncing(false);
    }
  };

  const saveProfile = async () => {
    setSyncing(true);
    try {
      const saved = await awSvc.saveProfile(profileForm);
      setProfile(saved);
      setEP(false);
      toast("Profile saved ☁️");
    } catch (e) {
      toast("Error: " + e.message, "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleAvatar = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => setPF((p) => ({ ...p, avatar_url: ev.target.result }));
    r.readAsDataURL(f);
  };

  // Combined filter
  const applyFilters = useMemo(() => {
    return locations.filter((l) => {
      const q = search.toLowerCase();
      const globalMatch = !q || l.location_id.toLowerCase().includes(q) || l.name.toLowerCase().includes(q) || (l.address || "").toLowerCase().includes(q) || (l.reason || "R1").toLowerCase().includes(q);
      const idMatch = !filters.location_id || l.location_id.toLowerCase().includes(filters.location_id.toLowerCase());
      const nameMatch = !filters.name || l.name.toLowerCase().includes(filters.name.toLowerCase());
      const addrMatch = !filters.address || (l.address || "").toLowerCase().includes(filters.address.toLowerCase());
      const statMatch = filters.status === "all" || getStatus(l.location_id) === filters.status;
      const reasonMatch = filters.reason === "all" || (l.reason || "R1") === filters.reason;
      return globalMatch && idMatch && nameMatch && addrMatch && statMatch && reasonMatch;
    });
  }, [locations, search, filters, visits, mk]);

  // Stats
  const stats = useMemo(() => {
    const completed = locations.filter((l) => getStatus(l.location_id) === "Completed").length;
    const partial = locations.filter((l) => getStatus(l.location_id) === "Partial").length;
    const pending = locations.filter((l) => getStatus(l.location_id) === "Pending").length;
    let tv = 0;
    Object.values(visits[mk] || {}).forEach((v) => { if (v.v1) tv++; if (v.v2) tv++; });
    return { completed, partial, pending, tv, total: locations.length };
  }, [locations, visits, mk]);

  const pendingRem = locations.filter((l) => getStatus(l.location_id) !== "Completed");

  // Calendar visits map
  const calVisits = useMemo(() => {
    const cmk = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
    const byDay = {};
    Object.entries(visits[cmk] || {}).forEach(([locId, v]) => {
      const loc = locations.find((l) => l.location_id === locId);
      if (!loc) return;
      [1, 2].forEach((n) => {
        if (v[`v${n}`]) {
          const d = new Date(v[`v${n}`].visited_at).getDate();
          if (!byDay[d]) byDay[d] = [];
          byDay[d].push({ loc, num: n, ts: v[`v${n}`].visited_at });
        }
      });
    });
    return byDay;
  }, [visits, calYear, calMonth, locations]);

  // Analytics
  const monthlyChart = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(getNow().getFullYear(), getNow().getMonth() - (5 - i), 1);
      const cmk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      let c = 0;
      Object.values(visits[cmk] || {}).forEach((v) => { if (v.v1) c++; if (v.v2) c++; });
      return { label: d.toLocaleString("default", { month: "short" }), value: c };
    });
  }, [visits]);

  const topLocs = useMemo(() => {
    return locations.map((l) => {
      let c = 0;
      Object.values(visits).forEach((mv) => {
        const v = mv[l.location_id];
        if (v?.v1) c++;
        if (v?.v2) c++;
      });
      return { label: l.location_id, value: c };
    }).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [visits, locations]);

  // Theme
  const theme = dark
    ? { "--bg": "#0f1117", "--card": "#1a1d27", "--border": "#2a2d3a", "--text": "#e8eaf0", "--muted": "#6b7280", "--hover": "#23263a" }
    : { "--bg": "#f0f4ff", "--card": "#ffffff", "--border": "#e2e8f0", "--text": "#1a1f36", "--muted": "#64748b", "--hover": "#f1f5f9" };
  const cssVars = { ...theme, "--font": "'DM Sans', sans-serif" };

  const navItems = [
    { id: "visits", label: "Visits", icon: I.home },
    { id: "locations", label: "Locations", icon: I.map },
    { id: "calendar", label: "Calendar", icon: I.cal },
    { id: "analytics", label: "Analytics", icon: I.chart },
    { id: "reminders", label: "Reminders", icon: I.bell, badge: pendingRem.length || null },
  ];

  const pages = {
    visits: (
      <VisitsPage
        loading={loading} stats={stats} filters={filters} setFilters={setFilters} applyFilters={applyFilters}
        locations={locations} getVisit={getVisit} markVisit={markVisit} vLoad={vLoad} getStatus={getStatus}
        openEdit={openEdit} setDel={setDel}
      />
    ),
    locations: (
      <LocationsPage
        locations={locations} filters={filters} setFilters={setFilters} applyFilters={applyFilters}
        openAdd={openAdd} openEdit={openEdit} setDel={setDel} getStatus={getStatus} getVisit={getVisit}
      />
    ),
    calendar: (
      <CalendarPage
        calYear={calYear} calMonth={calMonth} calDay={calDay} setCalMonth={setCalMonth} setCalYear={setCalYear}
        setCalDay={setCalDay} calVisits={calVisits}
      />
    ),
    analytics: (
      <AnalyticsPage
        monthlyChart={monthlyChart} topLocs={topLocs} locations={locations} getVisit={getVisit} getStatus={getStatus}
      />
    ),
    reminders: (
      <RemindersPage
        pendingRem={pendingRem} getVisit={getVisit} markVisit={markVisit} vLoad={vLoad}
      />
    ),
  };

  const Page = pages[tab] || pages.visits;

  return (
    <div style={cssVars}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }} className="ml">
        <div className="sd">
          <Sidebar
            profile={profile} setPF={setPF} setEP={setEP} tab={tab} setTab={setTab} setSO={setSO} navItems={navItems}
            syncAll={syncAll} dark={dark} setDark={setDark}
          />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ padding: "13px 20px", borderBottom: "1px solid var(--border)", background: "var(--card)", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
            <button onClick={() => setSO((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text)", padding: 4, display: "none" }}>
              <Icon d={I.menu} size={20} />
            </button>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font)" }}>
              {navItems.find((n) => n.id === tab)?.label}
            </div>
            {(tab === "visits" || tab === "locations") && (
              <Btn size="sm" variant="outline" onClick={openAdd} style={{ marginLeft: 0 }}>
                <Icon d={I.plus} size={13} />Add Location
              </Btn>
            )}
            <div style={{ flex: 1, maxWidth: 340, marginLeft: "auto", position: "relative" }}>
              <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>
                <Icon d={I.search} size={13} />
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, name, address…"
                style={{ width: "100%", padding: "7px 12px 7px 30px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 12, fontFamily: "var(--font)", outline: "none" }}
              />
            </div>
            <div
              style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: "pointer", flexShrink: 0 }}
              onClick={() => { setPF({ ...profile }); setEP(true); }}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{(profile.name || "?")[0].toUpperCase()}</span>
              )}
            </div>
          </div>

          <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>{Page}</div>
        </div>
      </div>

      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
          <div onClick={() => setSO(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)" }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 240 }}>
            <Sidebar profile={profile} setPF={setPF} setEP={setEP} tab={tab} setTab={setTab} setSO={setSO} navItems={navItems} syncAll={syncAll} dark={dark} setDark={setDark} />
          </div>
        </div>
      )}

      {/* ── Profile Modal ── */}
      <Modal open={editProfile} onClose={() => setEP(false)} title="Edit Profile">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 18 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: "pointer", position: "relative" }} onClick={() => avatarRef.current?.click()}>
            {profileForm.avatar_url ? (
              <img src={profileForm.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 28 }}>{(profileForm.name || "?")[0]?.toUpperCase()}</span>
            )}
            <div style={{ position: "absolute", bottom: 0, right: 0, background: "#3b82f6", borderRadius: "50%", padding: 5 }}>
              <Icon d={I.cam} size={11} />
            </div>
          </div>
          <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatar} />
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, fontFamily: "var(--font)" }}>Click to change photo</div>
        </div>
        <Inp label="Full Name" value={profileForm.name || ""} onChange={(v) => setPF((p) => ({ ...p, name: v }))} placeholder="Your name" />
        <Inp label="Employee ID" value={profileForm.employee_id || ""} onChange={(v) => setPF((p) => ({ ...p, employee_id: v }))} placeholder="EMP-XXXX" />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <Btn variant="ghost" onClick={() => setEP(false)}>Cancel</Btn>
          <Btn onClick={saveProfile} loading={syncing}>☁️ Save to Appwrite</Btn>
        </div>
      </Modal>

      {/* ── Add / Edit Location Modal ── */}
      <Modal open={!!locModal} onClose={() => setLocModal(null)} title={locModal?.mode === "add" ? "Add New Location" : "Edit Location"}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0 14px" }}>
          <Inp label="Location ID" value={locForm.location_id} onChange={(v) => setLF((p) => ({ ...p, location_id: v }))} placeholder="LOC001" mono hint="Unique identifier" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
          <Inp label="Location Name" value={locForm.name} onChange={(v) => setLF((p) => ({ ...p, name: v }))} placeholder="Branch name, office, site…" />
          <Sel
            label="RBO"
            value={locForm.reason || "R1"}
            onChange={(v) => setLF((p) => ({ ...p, reason: v }))}
            options={[
              { value: "R1", label: "R1" },
              { value: "R2", label: "R2" },
              { value: "R3", label: "R3" },
              { value: "R4", label: "R4" },
              { value: "R5", label: "R5" },
              { value: "R6", label: "R6" },
              { value: "R7", label: "R7" },
              { value: "R8", label: "R8" },
              { value: "R9", label: "R9" },
            ]}
          />
        </div>
        <Inp label="Full Address" value={locForm.address} onChange={(v) => setLF((p) => ({ ...p, address: v }))} placeholder="Street, City, State, ZIP" rows={2} hint="Full mailing address" />
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
          <Inp
            label="Latitude"
            value={locForm.latitude || ""}
            onChange={(v) => handleCoordsChange(v, locForm.longitude)}
            placeholder="e.g. 28.6139"
            hint="Optional coordinate"
          />
          <Inp
            label="Longitude"
            value={locForm.longitude || ""}
            onChange={(v) => handleCoordsChange(locForm.latitude, v)}
            placeholder="e.g. 77.2090"
            hint="Optional coordinate"
          />
        </div>
        
        <Inp
          label="Google Maps / Location Link"
          value={locForm.link}
          onChange={handleLinkChange}
          placeholder="https://maps.google.com/…"
          hint="Automatically generated from coordinates or paste a link"
        />
        
        {/* Preview badge */}
        {(locForm.location_id || locForm.name) && (
          <div style={{ background: "var(--hover)", borderRadius: 10, padding: "12px 14px", marginBottom: 14, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: "#3b82f6", background: "#3b82f610", padding: "2px 8px", borderRadius: 4 }}>
              {locForm.location_id || "ID"}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{locForm.name || "Name"}</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={() => setLocModal(null)}>Cancel</Btn>
          <Btn onClick={saveLoc} loading={syncing}>☁️ {locModal?.mode === "add" ? "Add to Appwrite" : "Save Changes"}</Btn>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal open={!!delConfirm} onClose={() => setDel(null)} title="Delete Location" width={380}>
        {(() => {
          const loc = locations.find((l) => l.location_id === delConfirm);
          return loc ? (
            <div>
              <div style={{ background: "#ef444410", border: "1px solid #ef444430", borderRadius: 10, padding: "14px 16px", marginBottom: 18 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: "#3b82f6" }}>{loc.location_id}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font)" }}>{loc.name}</div>
                {loc.address && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>📍 {loc.address}</div>}
              </div>
              <p style={{ color: "var(--text)", fontFamily: "var(--font)", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                This will permanently delete this location from Appwrite. Visit history is not affected.
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Btn variant="ghost" onClick={() => setDel(null)}>Cancel</Btn>
                <Btn variant="danger" onClick={() => deleteLoc(delConfirm)} loading={syncing}>
                  Delete Permanently
                </Btn>
              </div>
            </div>
          ) : null;
        })()}
      </Modal>

      <Toasts />
    </div>
  );
}
