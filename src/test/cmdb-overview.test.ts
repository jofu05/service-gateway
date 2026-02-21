import { describe, it, expect } from "vitest";
import { resolveCmdbUserId, getUserOverview } from "@/lib/cmdb/service";

describe("CMDB User Mapping", () => {
  it("resolves CMDB user by email", () => {
    const id = resolveCmdbUserId(undefined, "anna.johansson@kommun.se");
    expect(id).toBe("u-1");
  });

  it("resolves CMDB user by email case-insensitive", () => {
    const id = resolveCmdbUserId(undefined, "ERIK.LINDBERG@kommun.se");
    expect(id).toBe("u-2");
  });

  it("resolves CMDB user by displayName when email not found", () => {
    const id = resolveCmdbUserId(undefined, "notfound@test.se", "Oscar Nilsson");
    expect(id).toBe("u-4");
  });

  it("falls back to u-1 when nothing matches", () => {
    const id = resolveCmdbUserId("random-supabase-id", "unknown@test.se", "Nobody");
    expect(id).toBe("u-1");
  });

  it("resolves by direct CMDB userId", () => {
    const id = resolveCmdbUserId("u-3");
    expect(id).toBe("u-3");
  });
});

describe("CMDB UserOverview with ownership/management", () => {
  it("includes apps where user is owner/manager/operationsLead", async () => {
    // Anna Johansson (u-1) is manager AND operationsLead on all apps
    const overview = await getUserOverview("u-1");
    const appNames = overview.applications.map(a => a.name);
    expect(appNames).toContain("Kommunportalen Webb");
    expect(appNames).toContain("Ekonomiverktyget");
    expect(appNames).toContain("HR Self-Service");
    expect(appNames).toContain("Kartverktyget"); // operationsLead
  });

  it("includes systems where user is owner/manager/operationsLead", async () => {
    // Anna is manager of sys-1, operationsLead of all systems
    const overview = await getUserOverview("u-1");
    const sysNames = overview.systemAccess.map(s => s.name);
    expect(sysNames).toContain("Kommunportalen");
    expect(sysNames).toContain("Ekonomisystemet");
    expect(sysNames).toContain("HR-Portalen");
    expect(sysNames).toContain("GIS-plattformen");
  });

  it("returns correct devices for user", async () => {
    const overview = await getUserOverview("u-1");
    expect(overview.devices).toHaveLength(2);
    expect(overview.devices.map(d => d.id)).toContain("dev-1");
    expect(overview.devices.map(d => d.id)).toContain("dev-2");
  });

  it("returns no devices for Sara (u-5)", async () => {
    const overview = await getUserOverview("u-5");
    expect(overview.devices).toHaveLength(0);
  });

  it("includes systems from ownership even without app access", async () => {
    // Maria (u-3) owns sys-2 and sys-4, has access to app-2
    const overview = await getUserOverview("u-3");
    const sysNames = overview.systemAccess.map(s => s.name);
    expect(sysNames).toContain("Ekonomisystemet"); // owner
    expect(sysNames).toContain("GIS-plattformen"); // owner
  });
});
