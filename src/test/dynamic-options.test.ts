import { describe, it, expect } from "vitest";
import { fetchDynamicOptions } from "@/lib/cmdb/dynamic-options";
import type { RuntimeContext, DynamicOptionsConfig } from "@/lib/flow-engine/types";

function makeCtx(overrides: Partial<RuntimeContext> = {}): RuntimeContext {
  return {
    user: { id: "u-1", displayName: "Anna Johansson", roles: ["user"], ad_groups: [] },
    answers: {},
    lookups: {},
    derived: {},
    cmdb: {
      devices: [
        { id: "dev-1", name: "LAPTOP-AJ01", model: "ThinkPad X1 Carbon", type: "laptop" },
        { id: "dev-2", name: "DESKTOP-AJ02", model: "OptiPlex 7090", type: "desktop" },
      ],
      applications: [
        { id: "app-1", name: "Kommunportalen Webb" },
        { id: "app-2", name: "Ekonomiverktyget" },
      ],
      systemAccess: [
        { id: "sys-1", name: "Kommunportalen", criticality: "high" },
        { id: "sys-2", name: "Ekonomisystemet", criticality: "critical" },
      ],
    },
    ai_suggestions: [],
    logs: [],
    current_step_id: "step-1",
    step_history: ["step-1"],
    ...overrides,
  };
}

describe("Dynamic Options - user-scoped data", () => {
  it("userDevices returns devices from ctx.cmdb", async () => {
    const config: DynamicOptionsConfig = {
      provider: "cmdb",
      source: "userDevices",
      valuePath: "id",
      labelPath: "name",
    };
    const ctx = makeCtx();
    const options = await fetchDynamicOptions(config, ctx);
    expect(options).toHaveLength(2);
    expect(options[0].value).toBe("dev-1");
  });

  it("userSystems returns systems from ctx.cmdb", async () => {
    const config: DynamicOptionsConfig = {
      provider: "cmdb",
      source: "userSystems",
      valuePath: "id",
      labelPath: "name",
    };
    const ctx = makeCtx();
    const options = await fetchDynamicOptions(config, ctx);
    expect(options).toHaveLength(2);
    expect(options.map(o => o.value)).toContain("sys-1");
    expect(options.map(o => o.value)).toContain("sys-2");
  });

  it("userApplications returns apps from ctx.cmdb", async () => {
    const config: DynamicOptionsConfig = {
      provider: "cmdb",
      source: "userApplications",
      valuePath: "id",
      labelPath: "name",
    };
    const ctx = makeCtx();
    const options = await fetchDynamicOptions(config, ctx);
    expect(options).toHaveLength(2);
  });
});

describe("Dynamic Options - deviceInstalledSoftware", () => {
  it("returns installed software for dev-1", async () => {
    const config: DynamicOptionsConfig = {
      provider: "cmdb",
      source: "deviceInstalledSoftware",
      params: { deviceId: "dev-1" },
      valuePath: "id",
      labelPath: "name",
    };
    const ctx = makeCtx();
    const options = await fetchDynamicOptions(config, ctx);
    expect(options.length).toBeGreaterThanOrEqual(3);
    expect(options.map(o => o.label)).toContain("Kommunportalen Webb");
    expect(options.map(o => o.label)).toContain("Ekonomiverktyget");
  });

  it("returns empty for non-existent device", async () => {
    const config: DynamicOptionsConfig = {
      provider: "cmdb",
      source: "deviceInstalledSoftware",
      params: { deviceId: "dev-999" },
      valuePath: "id",
      labelPath: "name",
    };
    const ctx = makeCtx();
    const options = await fetchDynamicOptions(config, ctx);
    expect(options).toHaveLength(0);
  });
});

describe("Dynamic Options - system sub-resources", () => {
  it("systemServers returns servers for sys-1", async () => {
    const config: DynamicOptionsConfig = {
      provider: "cmdb",
      source: "systemServers",
      params: { systemId: "sys-1" },
      valuePath: "id",
      labelPath: "name",
    };
    const ctx = makeCtx();
    const options = await fetchDynamicOptions(config, ctx);
    expect(options).toHaveLength(2); // srv-1 + srv-2
  });

  it("systemApis returns APIs for sys-2", async () => {
    const config: DynamicOptionsConfig = {
      provider: "cmdb",
      source: "systemApis",
      params: { systemId: "sys-2" },
      valuePath: "id",
      labelPath: "name",
    };
    const ctx = makeCtx();
    const options = await fetchDynamicOptions(config, ctx);
    expect(options).toHaveLength(1); // api-2
  });
});
