import { useState } from "react";
import { ls } from "../lib/utils";
import { AWSvc } from "../lib/appwrite";
import { toast } from "../components/ui/Toast";
import { Icon, I } from "../lib/icons";
import { Inp, Btn } from "../components/ui/Form";

export function SetupScreen({ onSave }) {
  const [cfg, setCfg] = useState(() =>
    ls.get("fv_cfg", {
      endpoint: "https://cloud.appwrite.io/v1",
      projectId: "",
      databaseId: "",
      locCollId: "",
      visCollId: "",
      usrCollId: "",
    })
  );
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null);
  const [err, setErr] = useState("");
  const set = (k) => (v) => setCfg((p) => ({ ...p, [k]: v }));

  const go = async () => {
    const req = ["endpoint", "projectId", "databaseId", "locCollId", "visCollId", "usrCollId"];
    if (req.some((k) => !cfg[k].trim())) {
      toast("Please fill all fields", "error");
      return;
    }
    setTesting(true);
    setStatus(null);
    setErr("");
    try {
      const svc = new AWSvc(cfg);
      await svc.test();
      ls.set("fv_cfg", cfg);
      setStatus("ok");
      toast("Connected to Appwrite! 🎉");
      setTimeout(() => onSave(cfg), 900);
    } catch (e) {
      setStatus("error");
      setErr(e.message || "Connection failed. Check credentials and collection permissions.");
      toast("Connection failed", "error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "var(--font)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 580 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 60,
              height: 60,
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px #3b82f640",
            }}
          >
            <Icon d={I.cloud} size={28} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>Connect Appwrite</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
            All data (locations, visits, profile) is stored exclusively in Appwrite cloud.
          </p>
        </div>

        {/* Collection schema guide */}
        <div style={{ background: "#3b82f610", border: "1px solid #3b82f625", borderRadius: 14, padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#3b82f6", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d={I.db} size={13} /> APPWRITE SETUP — Add attribute{" "}
            <code style={{ background: "#3b82f620", padding: "1px 5px", borderRadius: 4 }}>reason</code> to your locations collection
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { name: "users", attrs: "name (string,255) · empId (string,50) · avatar (string,65535)" },
              {
                name: "locations",
                attrs: "locationId (string,50) · reason (string,10) · name (string,255) · address (string,1000) · link (string,1000)",
              },
              { name: "visits", attrs: "locationId (string,50) · visitNumber (integer) · timestamp (integer) · monthKey (string,20)" },
            ].map((c) => (
              <div key={c.name} style={{ background: "var(--card)", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text)", marginBottom: 3, fontFamily: "monospace" }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{c.attrs}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 10, fontWeight: 600 }}>
            ⚠ Set permissions on each collection → Any → Create / Read / Update / Delete
          </div>
        </div>

        {/* Form */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
          <Inp label="Appwrite Endpoint" value={cfg.endpoint} onChange={set("endpoint")} placeholder="https://cloud.appwrite.io/v1" hint="Use https://cloud.appwrite.io/v1 for hosted, or your self-hosted URL" />
          <Inp label="Project ID" value={cfg.projectId} onChange={set("projectId")} placeholder="abc123xyz" mono hint="Project Settings → General" />
          <Inp label="Database ID" value={cfg.databaseId} onChange={set("databaseId")} placeholder="your-database-id" mono />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 4 }}>
            <Inp label="Users Coll. ID" value={cfg.usrCollId} onChange={set("usrCollId")} placeholder="users" mono />
            <Inp label="Locations Coll. ID" value={cfg.locCollId} onChange={set("locCollId")} placeholder="locations" mono />
            <Inp label="Visits Coll. ID" value={cfg.visCollId} onChange={set("visCollId")} placeholder="visits" mono />
          </div>
          {status === "error" && (
            <div style={{ background: "#ef444415", border: "1px solid #ef444430", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#ef4444" }}>
              ❌ {err}
            </div>
          )}
          {status === "ok" && (
            <div style={{ background: "#22c55e15", border: "1px solid #22c55e30", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#22c55e" }}>
              ✅ Connected! Loading data…
            </div>
          )}
          <Btn onClick={go} loading={testing} size="lg" style={{ width: "100%" }}>
            <Icon d={I.cloud} size={15} /> {testing ? "Testing connection…" : "Connect & Continue"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
