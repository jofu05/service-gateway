// ===== CMDB DATA MODEL =====

export interface CmdbIdentity {
  userId: string;
  displayName: string;
  email: string;
  department: string;
  title: string;
  manager: string;
}

export interface CmdbPermission {
  systemId: string;
  systemName: string;
  accessLevel: "read" | "write" | "admin";
  grantedAt: string;
}

export interface CmdbDevice {
  id: string;
  type: "laptop" | "desktop" | "mobile" | "tablet";
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  os: string;
  primaryUserId: string;
  assignedUserId: string;
  status: "active" | "decommissioned" | "repair";
  warrantyEnd: string;
  batteryHealth?: number; // 0-100, only for laptops/mobile
}

export interface CmdbSystem {
  id: string;
  name: string;
  description: string;
  owner: string;
  manager: string;        // förvaltare
  operationsLead: string; // driftansvarig
  criticality: "low" | "medium" | "high" | "critical";
  status: "active" | "deprecated" | "planned";
}

export interface CmdbServer {
  id: string;
  name: string;
  systemId: string;
  environment: "prod" | "test" | "dev";
  os: string;
  ip: string;
  status: "running" | "stopped" | "maintenance";
}

export interface CmdbDatabase {
  id: string;
  name: string;
  type: string; // postgres, mssql, oracle, etc
  serverId?: string;  // kopplad till server
  systemId: string;   // kopplad till system
  environment: "prod" | "test" | "dev";
  sizeGb: number;
}

export interface CmdbApi {
  id: string;
  name: string;
  systemId: string;
  url: string;
  type: "REST" | "SOAP" | "GraphQL";
  status: "active" | "deprecated";
}

export interface CmdbApplication {
  id: string;
  name: string;
  systemId: string;
  description: string;
  owner: string;
  manager: string;        // förvaltare
  operationsLead: string; // driftansvarig
  url?: string;
}

export interface CmdbUserAccess {
  userId: string;
  applicationId: string;
  accessLevel: "user" | "power_user" | "admin";
  grantedAt: string;
}

export interface CmdbSystemTree {
  system: CmdbSystem;
  servers: Array<CmdbServer & { databases: CmdbDatabase[] }>;
  databases_direct: CmdbDatabase[];
  apis: CmdbApi[];
}

export interface CmdbUserOverview {
  identity: CmdbIdentity;
  permissions: CmdbPermission[];
  devices: CmdbDevice[];
  applications: CmdbApplication[];
  systemAccess: CmdbSystem[];
}
