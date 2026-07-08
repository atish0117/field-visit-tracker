import { useRef } from "react";
import { Icon, I } from "../../lib/icons";

export function Modal({ open, onClose, title, children, width = 500 }) {
  const mouseDownTarget = useRef(null);

  if (!open) return null;

  const handleMouseDown = (e) => {
    mouseDownTarget.current = e.target;
  };

  const handleMouseUp = (e) => {
    if (mouseDownTarget.current === e.currentTarget && e.target === e.currentTarget) {
      onClose();
    }
    mouseDownTarget.current = null;
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "60px 16px 16px 16px",
        overflowY: "auto",
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
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
          maxHeight: "none",
          margin: "0 auto",
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
