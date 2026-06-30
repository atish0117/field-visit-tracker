import { Icon, I } from "../../lib/icons";

export function Modal({ open, onClose, title, children, width = 500 }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          borderRadius: 18,
          padding: 26,
          width: "100%",
          maxWidth: width,
          boxShadow: "0 24px 60px rgba(0,0,0,.3)",
          border: "1px solid var(--border)",
          animation: "popIn .18s ease",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font)" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}
          >
            <Icon d={I.x} size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
