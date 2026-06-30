import { Icon, I } from "../lib/icons";

export function Sidebar({ profile, setPF, setEP, tab, setTab, setSO, navItems, syncAll, dark, setDark }) {
  return (
    <div
      style={{
        width: 228,
        background: "var(--card)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px #3b82f640",
            }}
          >
            <Icon d={I.map} size={17} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>FieldTrack</div>
            <div style={{ fontSize: 10, color: "#22c55e", marginTop: 1, fontWeight: 600 }}>☁️ Appwrite Cloud</div>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div style={{ padding: "14px 14px 12px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
                {(profile.name || "?")[0].toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {profile.name || "Set your name"}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{profile.employee_id || "—"}</div>
          </div>
          <button
            onClick={() => {
              setPF({ ...profile });
              setEP(true);
            }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
          >
            <Icon d={I.edit} size={13} />
          </button>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "10px 8px" }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
               setTab(item.id);
               if (setSO) setSO(false);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              marginBottom: 2,
              textAlign: "left",
              background: tab === item.id ? "#3b82f615" : "transparent",
              color: tab === item.id ? "#3b82f6" : "var(--muted)",
              fontFamily: "var(--font)",
              fontSize: 13,
              fontWeight: tab === item.id ? 700 : 500,
            }}
          >
            <Icon d={item.icon} size={15} />
            {item.label}
            {item.badge > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  background: "#f59e0b",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 10,
                  padding: "1px 7px",
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <button
          onClick={syncAll}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 12px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--hover)",
            cursor: "pointer",
            color: "var(--muted)",
            fontFamily: "var(--font)",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <Icon d={I.refresh} size={13} /> Sync DATA
        </button>
        <button
          onClick={() => setDark((d) => !d)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 12px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--hover)",
            cursor: "pointer",
            color: "var(--muted)",
            fontFamily: "var(--font)",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <Icon d={dark ? I.sun : I.moon} size={13} /> {dark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </div>
  );
}
