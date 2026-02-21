// ===== CMDB SERVICE LAYER (builds DTOs from repository) =====
import type { CmdbUserOverview, CmdbSystemTree, CmdbDevice, CmdbApplication, CmdbSystem, CmdbInstalledSoftware } from "./types";
import * as repo from "./repository";

/** Simulate async network delay */
const delay = (ms = 120) => new Promise(r => setTimeout(r, ms));

/** Resolve a Supabase user to a CMDB userId via email → displayName → fallback */
export function resolveCmdbUserId(
  supabaseUserId?: string,
  email?: string,
  displayName?: string,
): string {
  if (email) {
    const byEmail = repo.identities.find(i => i.email.toLowerCase() === email.toLowerCase());
    if (byEmail) return byEmail.userId;
  }
  if (displayName) {
    const byName = repo.identities.find(i => i.displayName.toLowerCase() === displayName.toLowerCase());
    if (byName) return byName.userId;
  }
  if (supabaseUserId) {
    const byId = repo.identities.find(i => i.userId === supabaseUserId);
    if (byId) return byId.userId;
  }
  return "u-1"; // fallback
}

export async function getUserOverview(userId: string): Promise<CmdbUserOverview> {
  await delay();
  const identity = repo.identities.find(i => i.userId === userId) ?? repo.identities[0];
  const userPerms = repo.permissions;
  const userDevices = repo.devices.filter(d => d.assignedUserId === userId);

  // Apps from userAccess
  const accessEntries = repo.userAccess.filter(a => a.userId === userId);
  const accessAppIds = new Set(accessEntries.map(a => a.applicationId));

  // Apps where user is owner/manager/operationsLead
  const roleApps = repo.applications.filter(a =>
    a.owner === identity.displayName ||
    a.manager === identity.displayName ||
    a.operationsLead === identity.displayName
  );

  const allAppIds = new Set([...accessAppIds, ...roleApps.map(a => a.id)]);
  const userApps = repo.applications.filter(a => allAppIds.has(a.id));

  // Systems: from apps + where user is owner/manager/operationsLead
  const systemIdsFromApps = new Set(userApps.map(a => a.systemId));
  const roleSystems = repo.systems.filter(s =>
    s.owner === identity.displayName ||
    s.manager === identity.displayName ||
    s.operationsLead === identity.displayName
  );
  const allSystemIds = new Set([...systemIdsFromApps, ...roleSystems.map(s => s.id)]);
  const userSystems = repo.systems.filter(s => allSystemIds.has(s.id));

  return { identity, permissions: userPerms, devices: userDevices, applications: userApps, systemAccess: userSystems };
}

export async function getDeviceInstalledSoftware(deviceId: string): Promise<CmdbInstalledSoftware[]> {
  await delay(80);
  return repo.installedSoftware.filter(s => s.deviceId === deviceId);
}

export async function getUserDevices(userId?: string): Promise<CmdbDevice[]> {
  await delay(80);
  if (!userId) return repo.devices;
  return repo.devices.filter(d => d.assignedUserId === userId);
}

export async function searchSystems(query: string): Promise<CmdbSystem[]> {
  await delay(100);
  const q = query.toLowerCase();
  return repo.systems.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.owner.toLowerCase().includes(q)
  );
}

export async function getSystemTree(systemId: string): Promise<CmdbSystemTree | null> {
  await delay(150);
  const system = repo.systems.find(s => s.id === systemId);
  if (!system) return null;

  const sysServers = repo.servers.filter(s => s.systemId === systemId);
  const serversWithDbs = sysServers.map(srv => ({
    ...srv,
    databases: repo.databases.filter(db => db.serverId === srv.id),
  }));
  const directDbs = repo.databases.filter(db => db.systemId === systemId && !db.serverId);
  const sysApis = repo.apis.filter(a => a.systemId === systemId);

  return { system, servers: serversWithDbs, databases_direct: directDbs, apis: sysApis };
}

export async function getApplication(applicationId: string): Promise<CmdbApplication | null> {
  await delay(80);
  return repo.applications.find(a => a.id === applicationId) ?? null;
}

export async function getAllSystems(): Promise<CmdbSystem[]> {
  await delay(60);
  return repo.systems;
}

export async function getAllApplications(): Promise<CmdbApplication[]> {
  await delay(60);
  return repo.applications;
}
