// ===== CMDB MOCK REPOSITORY (seed data) =====
import type {
  CmdbIdentity, CmdbPermission, CmdbDevice, CmdbSystem,
  CmdbServer, CmdbDatabase, CmdbApi, CmdbApplication, CmdbUserAccess,
} from "./types";

// --- Users / Identities ---
export const identities: CmdbIdentity[] = [
  { userId: "u-1", displayName: "Anna Johansson", email: "anna.johansson@kommun.se", department: "IT-avdelningen", title: "Systemadministratör", manager: "Erik Lindberg" },
  { userId: "u-2", displayName: "Erik Lindberg", email: "erik.lindberg@kommun.se", department: "IT-avdelningen", title: "IT-chef", manager: "Maria Svensson" },
  { userId: "u-3", displayName: "Maria Svensson", email: "maria.svensson@kommun.se", department: "Förvaltningsledning", title: "Förvaltningsdirektör", manager: "" },
  { userId: "u-4", displayName: "Oscar Nilsson", email: "oscar.nilsson@kommun.se", department: "Ekonomi", title: "Controller", manager: "Maria Svensson" },
  { userId: "u-5", displayName: "Sara Bergström", email: "sara.bergstrom@kommun.se", department: "HR", title: "HR-specialist", manager: "Erik Lindberg" },
];

// --- Devices ---
export const devices: CmdbDevice[] = [
  { id: "dev-1", type: "laptop", name: "LAPTOP-AJ01", manufacturer: "Lenovo", model: "ThinkPad X1 Carbon", serialNumber: "SN-LP-001", os: "Windows 11", primaryUserId: "u-1", assignedUserId: "u-1", status: "active", warrantyEnd: "2026-06-15", batteryHealth: 92 },
  { id: "dev-2", type: "desktop", name: "DESKTOP-AJ02", manufacturer: "Dell", model: "OptiPlex 7090", serialNumber: "SN-DT-002", os: "Windows 11", primaryUserId: "u-1", assignedUserId: "u-1", status: "active", warrantyEnd: "2025-12-01" },
  { id: "dev-3", type: "laptop", name: "LAPTOP-EL01", manufacturer: "HP", model: "EliteBook 840", serialNumber: "SN-LP-003", os: "Windows 11", primaryUserId: "u-2", assignedUserId: "u-2", status: "active", warrantyEnd: "2027-03-10", batteryHealth: 85 },
  { id: "dev-4", type: "mobile", name: "MOB-EL01", manufacturer: "Apple", model: "iPhone 15", serialNumber: "SN-MB-004", os: "iOS 18", primaryUserId: "u-2", assignedUserId: "u-2", status: "active", warrantyEnd: "2026-09-20", batteryHealth: 97 },
  { id: "dev-5", type: "laptop", name: "LAPTOP-ON01", manufacturer: "Lenovo", model: "ThinkPad T14", serialNumber: "SN-LP-005", os: "Windows 11", primaryUserId: "u-4", assignedUserId: "u-4", status: "active", warrantyEnd: "2025-08-30", batteryHealth: 68 },
  // Sara has NO devices
  // Maria has NO devices
];

// --- Systems ---
export const systems: CmdbSystem[] = [
  { id: "sys-1", name: "Kommunportalen", description: "Självserviceportal för kommunanställda", owner: "Erik Lindberg", manager: "Anna Johansson", operationsLead: "Anna Johansson", criticality: "high", status: "active" },
  { id: "sys-2", name: "Ekonomisystemet", description: "Central ekonomi- och fakturahantering", owner: "Maria Svensson", manager: "Oscar Nilsson", operationsLead: "Anna Johansson", criticality: "critical", status: "active" },
  { id: "sys-3", name: "HR-Portalen", description: "Personaladministration och tidrapportering", owner: "Erik Lindberg", manager: "Sara Bergström", operationsLead: "Anna Johansson", criticality: "medium", status: "active" },
  { id: "sys-4", name: "GIS-plattformen", description: "Geografisk informationsplattform", owner: "Maria Svensson", manager: "Erik Lindberg", operationsLead: "Anna Johansson", criticality: "low", status: "deprecated" },
];

// --- Servers ---
export const servers: CmdbServer[] = [
  { id: "srv-1", name: "KPSRV-PROD-01", systemId: "sys-1", environment: "prod", os: "Ubuntu 22.04", ip: "10.0.1.10", status: "running" },
  { id: "srv-2", name: "KPSRV-TEST-01", systemId: "sys-1", environment: "test", os: "Ubuntu 22.04", ip: "10.0.2.10", status: "running" },
  { id: "srv-3", name: "EKOSRV-PROD-01", systemId: "sys-2", environment: "prod", os: "Windows Server 2022", ip: "10.0.1.20", status: "running" },
  { id: "srv-4", name: "EKOSRV-PROD-02", systemId: "sys-2", environment: "prod", os: "Windows Server 2022", ip: "10.0.1.21", status: "running" },
  { id: "srv-5", name: "HRSRV-PROD-01", systemId: "sys-3", environment: "prod", os: "Ubuntu 22.04", ip: "10.0.1.30", status: "running" },
  { id: "srv-6", name: "HRSRV-DEV-01", systemId: "sys-3", environment: "dev", os: "Ubuntu 22.04", ip: "10.0.3.30", status: "stopped" },
];

// --- Databases ---
export const databases: CmdbDatabase[] = [
  { id: "db-1", name: "kommunportal_db", type: "PostgreSQL", serverId: "srv-1", systemId: "sys-1", environment: "prod", sizeGb: 45 },
  { id: "db-2", name: "kommunportal_test_db", type: "PostgreSQL", serverId: "srv-2", systemId: "sys-1", environment: "test", sizeGb: 12 },
  { id: "db-3", name: "ekonomi_prod", type: "MSSQL", serverId: "srv-3", systemId: "sys-2", environment: "prod", sizeGb: 320 },
  { id: "db-4", name: "ekonomi_archive", type: "MSSQL", serverId: "srv-4", systemId: "sys-2", environment: "prod", sizeGb: 1200 },
  { id: "db-5", name: "hr_db", type: "PostgreSQL", serverId: "srv-5", systemId: "sys-3", environment: "prod", sizeGb: 28 },
  { id: "db-6", name: "gis_spatial", type: "PostgreSQL", systemId: "sys-4", environment: "prod", sizeGb: 85 }, // direct to system, no server
];

// --- APIs ---
export const apis: CmdbApi[] = [
  { id: "api-1", name: "Kommunportal REST API", systemId: "sys-1", url: "https://api.kommun.se/portal/v2", type: "REST", status: "active" },
  { id: "api-2", name: "Ekonomi SOAP Gateway", systemId: "sys-2", url: "https://api.kommun.se/ekonomi/ws", type: "SOAP", status: "active" },
  { id: "api-3", name: "HR REST API", systemId: "sys-3", url: "https://api.kommun.se/hr/v1", type: "REST", status: "active" },
  { id: "api-4", name: "GIS GraphQL", systemId: "sys-4", url: "https://api.kommun.se/gis/graphql", type: "GraphQL", status: "deprecated" },
];

// --- Applications ---
export const applications: CmdbApplication[] = [
  { id: "app-1", name: "Kommunportalen Webb", systemId: "sys-1", description: "Webbportal för självservice", owner: "Erik Lindberg", manager: "Anna Johansson", operationsLead: "Anna Johansson", url: "https://portal.kommun.se" },
  { id: "app-2", name: "Ekonomiverktyget", systemId: "sys-2", description: "Klientapplikation för ekonomihantering", owner: "Maria Svensson", manager: "Oscar Nilsson", operationsLead: "Anna Johansson", url: "https://ekonomi.kommun.se" },
  { id: "app-3", name: "HR Self-Service", systemId: "sys-3", description: "Personaladministration och tidrapportering", owner: "Erik Lindberg", manager: "Sara Bergström", operationsLead: "Anna Johansson", url: "https://hr.kommun.se" },
  { id: "app-4", name: "Kartverktyget", systemId: "sys-4", description: "GIS-baserat kartverktyg", owner: "Maria Svensson", manager: "Erik Lindberg", operationsLead: "Anna Johansson" },
];

// --- User Access ---
export const userAccess: CmdbUserAccess[] = [
  { userId: "u-1", applicationId: "app-1", accessLevel: "admin", grantedAt: "2023-01-15" },
  { userId: "u-1", applicationId: "app-2", accessLevel: "user", grantedAt: "2023-06-01" },
  { userId: "u-1", applicationId: "app-3", accessLevel: "power_user", grantedAt: "2024-02-10" },
  { userId: "u-2", applicationId: "app-1", accessLevel: "admin", grantedAt: "2022-08-01" },
  { userId: "u-2", applicationId: "app-3", accessLevel: "admin", grantedAt: "2023-01-01" },
  { userId: "u-3", applicationId: "app-2", accessLevel: "admin", grantedAt: "2021-03-15" },
  { userId: "u-4", applicationId: "app-2", accessLevel: "power_user", grantedAt: "2023-03-20" },
  { userId: "u-5", applicationId: "app-3", accessLevel: "admin", grantedAt: "2023-05-01" },
];

// --- Permissions ---
export const permissions: CmdbPermission[] = [
  { systemId: "sys-1", systemName: "Kommunportalen", accessLevel: "admin", grantedAt: "2023-01-15" },
  { systemId: "sys-2", systemName: "Ekonomisystemet", accessLevel: "read", grantedAt: "2023-06-01" },
  { systemId: "sys-3", systemName: "HR-Portalen", accessLevel: "write", grantedAt: "2024-02-10" },
];
