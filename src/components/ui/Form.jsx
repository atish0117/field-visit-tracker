import { useState } from "react";
import { Icon, I } from "../../lib/icons";

export function Inp({ label, value, onChange, placeholder, type = "text", mono, hint, rows }) {
  const [show, setShow] = useState(false);
  const isP = type === "password";
  const base = {
    width: "100%",
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--hover)",
    color: "var(--text)",
    fontSize: 14,
    fontFamily: mono ? "monospace" : "var(--font)",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  };
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--muted)",
            marginBottom: 6,
            fontFamily: "var(--font)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {rows ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            style={{ ...base, padding: "12px 14px", resize: "vertical" }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3b82f6";
              e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.25)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
            }}
          />
        ) : (
          <input
            type={isP && !show ? "password" : "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ ...base, padding: isP ? "12px 40px 12px 14px" : "12px 14px" }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3b82f6";
              e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.25)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
            }}
          />
        )}
        {isP && (
          <button
            onClick={() => setShow((s) => !s)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            <Icon d={show ? I.eyeOff : I.eye} size={16} />
          </button>
        )}
      </div>
      {hint && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, fontFamily: "var(--font)" }}>{hint}</div>}
    </div>
  );
}

export function Sel({ label, value, onChange, options, hint }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--muted)",
            marginBottom: 6,
            fontFamily: "var(--font)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid var(--border)",
          background: "var(--hover)",
          color: "var(--text)",
          fontSize: 14,
          fontFamily: "var(--font)",
          outline: "none",
          cursor: "pointer",
          appearance: "none",
          boxSizing: "border-box",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#3b82f6";
          e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.25)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
        }}
      >
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
      {hint && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, fontFamily: "var(--font)" }}>{hint}</div>}
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", size = "md", disabled, loading, style: s = {}, className }) {
  const base = {
    border: "none",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    fontFamily: "var(--font)",
    fontWeight: 600,
    borderRadius: 12,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: disabled || loading ? 0.6 : 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };
  const sz = {
    sm: { padding: "8px 16px", fontSize: 13 },
    md: { padding: "12px 24px", fontSize: 14 },
    lg: { padding: "16px 32px", fontSize: 16 },
  };
  const vr = {
    primary: { background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "#fff", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)" },
    success: { background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "#fff", boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)" },
    danger: { background: "#ef444415", color: "#ef4444", border: "1px solid #ef444430" },
    ghost: { background: "var(--hover)", color: "var(--text)" },
    outline: { background: "var(--card)", color: "var(--text)", border: "1px solid var(--border)" },
  };
  return (
    <button 
      onClick={disabled || loading ? undefined : onClick} 
      style={{ ...base, ...sz[size], ...vr[variant], ...s }}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = "translateY(-1px)";
          if (variant === 'primary' || variant === 'success') {
            e.currentTarget.style.filter = "brightness(1.1)";
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = "translateY(0)";
          if (variant === 'primary' || variant === 'success') {
            e.currentTarget.style.filter = "brightness(1)";
          }
        }
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) e.currentTarget.style.transform = "translateY(1px)";
      }}
      onMouseUp={(e) => {
        if (!disabled && !loading) e.currentTarget.style.transform = "translateY(-1px)";
      }}
    >
      {loading ? "⏳ " : ""}
      {children}
    </button>
  );
}
