import { useState, useEffect } from "react";

const TC = { fns: [] };

export const toast = (msg, type = "success") => TC.fns.forEach((f) => f(msg, type));

export function Toasts() {
  const [list, setList] = useState([]);
  
  useEffect(() => {
    const fn = (msg, type) => {
      const id = Date.now() + Math.random();
      setList((p) => [...p, { id, msg, type }]);
      setTimeout(() => setList((p) => p.filter((t) => t.id !== id)), 3500);
    };
    TC.fns.push(fn);
    return () => {
      TC.fns = TC.fns.filter((f) => f !== fn);
    };
  }, []);

  const c = { success: "#22c55e", error: "#ef4444", warning: "#f59e0b", info: "#3b82f6" };
  
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {list.map((t) => (
        <div
          key={t.id}
          style={{
            background: "var(--card)",
            border: `1px solid ${c[t.type]}40`,
            borderLeft: `3px solid ${c[t.type]}`,
            padding: "10px 16px",
            borderRadius: 10,
            boxShadow: "0 4px 20px rgba(0,0,0,.18)",
            fontSize: 13,
            color: "var(--text)",
            fontFamily: "var(--font)",
            animation: "slideIn .2s ease",
            maxWidth: 300,
            fontWeight: 500,
          }}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
