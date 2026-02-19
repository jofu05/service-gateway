// ===== CMDB GATEWAY (public API for UI/flow-engine) =====
// All frontend code should import from this file only.
import type { CmdbUserOverview, CmdbSystemTree, CmdbDevice, CmdbApplication, CmdbSystem } from "./types";
import * as service from "./service";

export type { CmdbUserOverview, CmdbSystemTree, CmdbDevice, CmdbApplication, CmdbSystem };

/** Current user's full CMDB overview: identity, permissions, devices, apps, system access */
export async function getMyOverview(userId?: string): Promise<CmdbUserOverview> {
  return service.getUserOverview(userId ?? "u-1");
}

/** Devices assigned to a user (or all if no userId) */
export async function getUserDevices(userId?: string): Promise<CmdbDevice[]> {
  return service.getUserDevices(userId);
}

/** Search systems by name/description/owner – used in autocomplete questions */
export async function searchSystems(query: string): Promise<CmdbSystem[]> {
  return service.searchSystems(query);
}

/** Full system hierarchy: servers → databases, direct databases, apis */
export async function getSystemTree(systemId: string): Promise<CmdbSystemTree | null> {
  return service.getSystemTree(systemId);
}

/** Single application with owner, manager, operations lead */
export async function getApplication(applicationId: string): Promise<CmdbApplication | null> {
  return service.getApplication(applicationId);
}

/** All systems for selects/lookups */
export async function getAllSystems(): Promise<CmdbSystem[]> {
  return service.getAllSystems();
}

/** All applications for selects/lookups */
export async function getAllApplications(): Promise<CmdbApplication[]> {
  return service.getAllApplications();
}
