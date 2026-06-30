// ─── HELPERS ──────────────────────────────────────────────────────────────────
export const getNow = () => new Date();
export const monthYear = (d = getNow()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
export const fmtTime = ts => new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
export const fmtDate = ts => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
export const fmtDateFull = ts => new Date(ts).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
export const getDIM = (y, m) => new Date(y, m + 1, 0).getDate();
export const getFDM = (y, m) => new Date(y, m, 1).getDay();

// ─── LOCAL STORAGE ────────────────────────────────────────────────────────────
export const ls = {
  get: (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};
