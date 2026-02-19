// ===== CMDB SERVICE LAYER (builds DTOs from repository) =====
import type { CmdbUserOverview, CmdbSystemTree, CmdbDevice, CmdbApplication, CmdbSystem } from "./types";
import * as repo from "./repository";

/** Simulate async network delay */
const delay = (ms = 120) => new Promise(r => setTimeout(r, ms));

export async function getUserOverview(userId: string): Promise<CmdbUserOverview> {
  await delay();
  const identity = repo.identities.find(i => i.userId === userId) ?? repo.identities[0];
  const userPerms = repo.permissions;
  const userDevices = repo.devices.filter(d => d.assignedUserId === userId);
  const accessEntries = repo.userAccess.filter(a => a.userId === userId);
  const userApps = accessEntries
    .map(a => repo.applications.find(app => app.id === a.applicationId))
    .filter(Boolean) as CmdbApplication[];
  const systemIds = new Set(userApps.map(a => a.systemId));
  const userSystems = repo.systems.filter(s => systemIds.has(s.id));

  return { identity, permissions: userPerms, devices: userDevices, applications: userApps, systemAccess: userSystems };
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
