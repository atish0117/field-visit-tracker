import { Client, Databases, Account, ID, Query, Storage } from "appwrite";
import { monthYear } from "./utils";

class AWSvc {
  constructor() {
    this.cfg = {
      endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
      projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
      databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
      locCollId: import.meta.env.VITE_APPWRITE_LOC_COLL_ID,
      visCollId: import.meta.env.VITE_APPWRITE_VIS_COLL_ID,
      usrCollId: import.meta.env.VITE_APPWRITE_USR_COLL_ID,
      bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID || "6a421560002467478f90",
    };

    // Only configure Appwrite if IDs are provided in .env
    this.isConfigured = !!(this.cfg.projectId && this.cfg.databaseId);

    if (this.isConfigured) {
      this.client = new Client()
        .setEndpoint(this.cfg.endpoint)
        .setProject(this.cfg.projectId);

      this.db = new Databases(this.client);
      this.account = new Account(this.client);
      this.storage = new Storage(this.client);
    }
  }

  // Centralized DB error handler
  async _handleDB(promise) {
    if (!this.isConfigured) {
      console.warn("Appwrite variables are missing in .env. Skipping database call.");
      // Throwing a soft error so the UI handles it gracefully without a real 404 fetch
      throw new Error("Missing .env variables");
    }

    try {
      return await promise;
    } catch (error) {
      console.error("[Appwrite Error]", error);
      throw new Error(error.message || "A database error occurred.");
    }
  }

  async test() {
    await this._handleDB(
      this.db.listDocuments(this.cfg.databaseId, this.cfg.locCollId, [Query.limit(1)])
    );
  }

  // ── Auth & User Isolation ────────────────────────────────────────────────
  // Recommended additions for future production scaling
  async login(email, password) {
    return await this._handleDB(
      this.account.createEmailPasswordSession(email, password)
    );
  }

  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch {
      return null;
    }
  }

  // ── Locations ────────────────────────────────────────────────────────────
  async getLocations() {
    let allLocations = [];
    let cursor = null;

    // Use cursor-based pagination to safely pull all locations over 100 limit
    while (true) {
      const queries = [Query.limit(100), Query.orderAsc("locationId")];
      if (cursor) queries.push(Query.cursorAfter(cursor));

      const r = await this._handleDB(
        this.db.listDocuments(this.cfg.databaseId, this.cfg.locCollId, queries)
      );

      allLocations = allLocations.concat(
        r.documents.map((d) => ({
          _docId: d.$id,
          location_id: d.locationId,
          reason: d.reason || "R1",
          name: d.LocationName,
          address: d.address || "",
          link: d.link || "",
        }))
      );

      if (r.documents.length < 100) break;
      cursor = r.documents[r.documents.length - 1].$id;
    }

    return allLocations;
  }

  async addLocation(loc) {
    const d = await this._handleDB(
      this.db.createDocument(this.cfg.databaseId, this.cfg.locCollId, ID.unique(), {
        locationId: loc.location_id,
        reason: loc.reason || "R1",
        LocationName: loc.name,
        address: loc.address || "",
        link: loc.link || "",
      })
    );
    return { ...loc, _docId: d.$id };
  }

  async updateLocation(docId, loc) {
    await this._handleDB(
      this.db.updateDocument(this.cfg.databaseId, this.cfg.locCollId, docId, {
        locationId: loc.location_id,
        reason: loc.reason || "R1",
        LocationName: loc.name,
        address: loc.address || "",
        link: loc.link || "",
      })
    );
  }

  async deleteLocation(docId) {
    await this._handleDB(
      this.db.deleteDocument(this.cfg.databaseId, this.cfg.locCollId, docId)
    );
  }

  // ── Visits ──
  async getVisits() {
    const out = {};
    let cursor = null;

    // Using pagination to ensure we don't hit Appwrite payload delivery limits
    while (true) {
      const queries = [Query.limit(100)];
      if (cursor) queries.push(Query.cursorAfter(cursor));

      const r = await this._handleDB(
        this.db.listDocuments(this.cfg.databaseId, this.cfg.visCollId, queries)
      );

      r.documents.forEach((d) => {
        if (!out[d.monthYear]) out[d.monthYear] = {};
        if (!out[d.monthYear][d.locationId]) out[d.monthYear][d.locationId] = {};
        out[d.monthYear][d.locationId][`v${d.visitNumber}`] = { visited_at: d.timestamp, _docId: d.$id };
      });

      if (r.documents.length < 100) break;
      cursor = r.documents[r.documents.length - 1].$id;
    }

    return out;
  }

  async markVisit(locationId, visitNumber, timestamp) {
    const mk = monthYear();
    const d = await this._handleDB(
      this.db.createDocument(this.cfg.databaseId, this.cfg.visCollId, ID.unique(), {
        locationId,
        visitNumber,
        timestamp,
        monthYear: mk,
      })
    );
    return { visited_at: timestamp, _docId: d.$id };
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  async getProfile() {
    try {
      const r = await this._handleDB(
        this.db.listDocuments(this.cfg.databaseId, this.cfg.usrCollId, [Query.limit(1)])
      );
      if (r.documents.length) {
        const d = r.documents[0];
        return { _docId: d.$id, name: d.name, employee_id: d.empId, avatar_url: d.avatar || "" };
      }
    } catch {
      // Return null gracefully if profile is not setup or network fails.
    }
    return null;
  }

  async saveProfile(p) {
    if (this.isConfigured && this.cfg.bucketId && p.avatar_url && p.avatar_url.startsWith("data:")) {
      try {
        const fileObj = dataURLtoFile(p.avatar_url, `avatar_${Date.now()}.png`);
        const uploadedFile = await this.storage.createFile(
          this.cfg.bucketId,
          ID.unique(),
          fileObj
        );
        const fileUrl = this.storage.getFilePreview(
          this.cfg.bucketId,
          uploadedFile.$id
        ).toString();
        p.avatar_url = fileUrl;
      } catch (err) {
        console.error("Avatar upload failed:", err);
        throw new Error("Avatar upload failed: " + err.message);
      }
    }

    if (p._docId) {
      await this._handleDB(
        this.db.updateDocument(this.cfg.databaseId, this.cfg.usrCollId, p._docId, {
          name: p.name,
          empId: p.employee_id,
          avatar: p.avatar_url || null,
        })
      );
      return p;
    }
    const d = await this._handleDB(
      this.db.createDocument(this.cfg.databaseId, this.cfg.usrCollId, ID.unique(), {
        name: p.name,
        empId: p.employee_id,
        avatar: p.avatar_url || null,
      })
    );
    return { ...p, _docId: d.$id };
  }
}

function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export const awSvc = new AWSvc();
