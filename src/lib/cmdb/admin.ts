// ===== CMDB Admin CRUD Operations =====
// All write operations go through this module
import * as repo from "./repository";
import type {
  CmdbIdentity, CmdbDevice, CmdbSystem, CmdbServer,
  CmdbDatabase, CmdbApi, CmdbApplication, CmdbUserAccess,
} from "./types";

const delay = (ms = 80) => new Promise(r => setTimeout(r, ms));

// --- Identity ---
export async function getAllUsers(): Promise<CmdbIdentity[]> {
  await delay();
  return [...repo.identities];
}

export async function createUser(user: Omit<CmdbIdentity, "userId">): Promise<CmdbIdentity> {
  await delay();
  const newUser: CmdbIdentity = { ...user, userId: `u-${Date.now()}` };
  repo.identities.push(newUser);
  return newUser;
}

export async function updateUser(userId: string, updates: Partial<CmdbIdentity>): Promise<CmdbIdentity | null> {
  await delay();
  const idx = repo.identities.findIndex(u => u.userId === userId);
  if (idx < 0) return null;
  repo.identities[idx] = { ...repo.identities[idx], ...updates };
  return repo.identities[idx];
}

export async function deleteUser(userId: string): Promise<boolean> {
  await delay();
  const idx = repo.identities.findIndex(u => u.userId === userId);
  if (idx < 0) return false;
  repo.identities.splice(idx, 1);
  return true;
}

// --- Devices ---
export async function getAllDevices(): Promise<CmdbDevice[]> {
  await delay();
  return [...repo.devices];
}

export async function createDevice(device: Omit<CmdbDevice, "id">): Promise<CmdbDevice> {
  await delay();
  const newDevice: CmdbDevice = { ...device, id: `dev-${Date.now()}` };
  repo.devices.push(newDevice);
  return newDevice;
}

export async function updateDevice(id: string, updates: Partial<CmdbDevice>): Promise<CmdbDevice | null> {
  await delay();
  const idx = repo.devices.findIndex(d => d.id === id);
  if (idx < 0) return null;
  repo.devices[idx] = { ...repo.devices[idx], ...updates };
  return repo.devices[idx];
}

export async function deleteDevice(id: string): Promise<boolean> {
  await delay();
  const idx = repo.devices.findIndex(d => d.id === id);
  if (idx < 0) return false;
  repo.devices.splice(idx, 1);
  return true;
}

export async function assignDeviceToUser(deviceId: string, userId: string): Promise<boolean> {
  await delay();
  const device = repo.devices.find(d => d.id === deviceId);
  if (!device) return false;
  device.assignedUserId = userId;
  return true;
}

// --- Systems ---
export async function getAllSystems(): Promise<CmdbSystem[]> {
  await delay();
  return [...repo.systems];
}

export async function createSystem(system: Omit<CmdbSystem, "id">): Promise<CmdbSystem> {
  await delay();
  const newSystem: CmdbSystem = { ...system, id: `sys-${Date.now()}` };
  repo.systems.push(newSystem);
  return newSystem;
}

export async function updateSystem(id: string, updates: Partial<CmdbSystem>): Promise<CmdbSystem | null> {
  await delay();
  const idx = repo.systems.findIndex(s => s.id === id);
  if (idx < 0) return null;
  repo.systems[idx] = { ...repo.systems[idx], ...updates };
  return repo.systems[idx];
}

export async function deleteSystem(id: string): Promise<boolean> {
  await delay();
  const idx = repo.systems.findIndex(s => s.id === id);
  if (idx < 0) return false;
  repo.systems.splice(idx, 1);
  return true;
}

// --- Servers ---
export async function getAllServers(): Promise<CmdbServer[]> {
  await delay();
  return [...repo.servers];
}

export async function createServer(server: Omit<CmdbServer, "id">): Promise<CmdbServer> {
  await delay();
  const newServer: CmdbServer = { ...server, id: `srv-${Date.now()}` };
  repo.servers.push(newServer);
  return newServer;
}

export async function updateServer(id: string, updates: Partial<CmdbServer>): Promise<CmdbServer | null> {
  await delay();
  const idx = repo.servers.findIndex(s => s.id === id);
  if (idx < 0) return null;
  repo.servers[idx] = { ...repo.servers[idx], ...updates };
  return repo.servers[idx];
}

export async function deleteServer(id: string): Promise<boolean> {
  await delay();
  const idx = repo.servers.findIndex(s => s.id === id);
  if (idx < 0) return false;
  repo.servers.splice(idx, 1);
  return true;
}

// --- Databases ---
export async function getAllDatabases(): Promise<CmdbDatabase[]> {
  await delay();
  return [...repo.databases];
}

export async function createDatabase(db: Omit<CmdbDatabase, "id">): Promise<CmdbDatabase> {
  await delay();
  const newDb: CmdbDatabase = { ...db, id: `db-${Date.now()}` };
  repo.databases.push(newDb);
  return newDb;
}

export async function updateDatabase(id: string, updates: Partial<CmdbDatabase>): Promise<CmdbDatabase | null> {
  await delay();
  const idx = repo.databases.findIndex(d => d.id === id);
  if (idx < 0) return null;
  repo.databases[idx] = { ...repo.databases[idx], ...updates };
  return repo.databases[idx];
}

export async function deleteDatabase(id: string): Promise<boolean> {
  await delay();
  const idx = repo.databases.findIndex(d => d.id === id);
  if (idx < 0) return false;
  repo.databases.splice(idx, 1);
  return true;
}

// --- APIs ---
export async function getAllApis(): Promise<CmdbApi[]> {
  await delay();
  return [...repo.apis];
}

export async function createApi(api: Omit<CmdbApi, "id">): Promise<CmdbApi> {
  await delay();
  const newApi: CmdbApi = { ...api, id: `api-${Date.now()}` };
  repo.apis.push(newApi);
  return newApi;
}

export async function updateApi(id: string, updates: Partial<CmdbApi>): Promise<CmdbApi | null> {
  await delay();
  const idx = repo.apis.findIndex(a => a.id === id);
  if (idx < 0) return null;
  repo.apis[idx] = { ...repo.apis[idx], ...updates };
  return repo.apis[idx];
}

export async function deleteApi(id: string): Promise<boolean> {
  await delay();
  const idx = repo.apis.findIndex(a => a.id === id);
  if (idx < 0) return false;
  repo.apis.splice(idx, 1);
  return true;
}

// --- Applications ---
export async function getAllApplications(): Promise<CmdbApplication[]> {
  await delay();
  return [...repo.applications];
}

export async function createApplication(app: Omit<CmdbApplication, "id">): Promise<CmdbApplication> {
  await delay();
  const newApp: CmdbApplication = { ...app, id: `app-${Date.now()}` };
  repo.applications.push(newApp);
  return newApp;
}

export async function updateApplication(id: string, updates: Partial<CmdbApplication>): Promise<CmdbApplication | null> {
  await delay();
  const idx = repo.applications.findIndex(a => a.id === id);
  if (idx < 0) return null;
  repo.applications[idx] = { ...repo.applications[idx], ...updates };
  return repo.applications[idx];
}

export async function deleteApplication(id: string): Promise<boolean> {
  await delay();
  const idx = repo.applications.findIndex(a => a.id === id);
  if (idx < 0) return false;
  repo.applications.splice(idx, 1);
  return true;
}

// --- User Access ---
export async function getUserAccess(userId?: string): Promise<CmdbUserAccess[]> {
  await delay();
  if (!userId) return [...repo.userAccess];
  return repo.userAccess.filter(a => a.userId === userId);
}

export async function setUserAppAccess(userId: string, applicationId: string, accessLevel: CmdbUserAccess["accessLevel"]): Promise<boolean> {
  await delay();
  const existing = repo.userAccess.find(a => a.userId === userId && a.applicationId === applicationId);
  if (existing) {
    existing.accessLevel = accessLevel;
  } else {
    repo.userAccess.push({ userId, applicationId, accessLevel, grantedAt: new Date().toISOString().split("T")[0] });
  }
  return true;
}

export async function removeUserAppAccess(userId: string, applicationId: string): Promise<boolean> {
  await delay();
  const idx = repo.userAccess.findIndex(a => a.userId === userId && a.applicationId === applicationId);
  if (idx < 0) return false;
  repo.userAccess.splice(idx, 1);
  return true;
}
