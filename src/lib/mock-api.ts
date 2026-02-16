// Mock Integration API client for POB G6 adapter
// Replace with real adapter endpoints when ready

export interface PobTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  comments: { author: string; text: string; date: string }[];
}

export interface LookupValue {
  id: string;
  label: string;
  type: string;
}

export interface StatsData {
  totalTickets: number;
  avgResolutionDays: number;
  byCategory: { category: string; count: number }[];
  byMonth: { month: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const mockTickets: PobTicket[] = [
  { id: "INC-2024-001", title: "Dator startar inte", description: "Min arbetsdator startar inte efter uppdatering", status: "resolved", category: "IT-Support", priority: "Hög", createdAt: "2024-12-01T09:00:00Z", updatedAt: "2024-12-03T14:00:00Z", assignedTo: "Support Team A", comments: [{ author: "Tekniker", text: "Felsökning påbörjad", date: "2024-12-01T11:00:00Z" }] },
  { id: "INC-2024-002", title: "Behörighet till system X", description: "Behöver åtkomst till ekonomisystemet", status: "open", category: "Behörighet", priority: "Medium", createdAt: "2024-12-10T08:30:00Z", updatedAt: "2024-12-10T08:30:00Z", comments: [] },
  { id: "INC-2024-003", title: "Skrivare fungerar ej", description: "Nätverksskrivaren på plan 3 skriver inte ut", status: "in_progress", category: "IT-Support", priority: "Låg", createdAt: "2024-12-15T13:00:00Z", updatedAt: "2024-12-16T09:00:00Z", assignedTo: "Support Team B", comments: [{ author: "Tekniker", text: "Ny tonerkassett beställd", date: "2024-12-16T09:00:00Z" }] },
  { id: "BES-2024-001", title: "Ny mobiltelefon", description: "Beställning av ny tjänstemobil", status: "closed", category: "Beställning", priority: "Låg", createdAt: "2024-11-20T10:00:00Z", updatedAt: "2024-11-28T16:00:00Z", comments: [] },
  { id: "INC-2025-001", title: "VPN-problem hemifrån", description: "Kan inte ansluta till VPN från hemmakontoret", status: "open", category: "Nätverk", priority: "Hög", createdAt: "2025-01-05T07:45:00Z", updatedAt: "2025-01-05T07:45:00Z", comments: [] },
  { id: "BES-2025-001", title: "Programvarulicens", description: "Behöver licens för Adobe Creative Suite", status: "in_progress", category: "Beställning", priority: "Medium", createdAt: "2025-01-10T11:00:00Z", updatedAt: "2025-01-12T14:00:00Z", assignedTo: "Licensansvarig", comments: [] },
];

const mockLookups: Record<string, LookupValue[]> = {
  locations: [
    { id: "loc1", label: "Stadshuset", type: "location" },
    { id: "loc2", label: "Biblioteket", type: "location" },
    { id: "loc3", label: "Skolan Norra", type: "location" },
    { id: "loc4", label: "Förskolan Solen", type: "location" },
  ],
  services: [
    { id: "svc1", label: "IT-Support", type: "service" },
    { id: "svc2", label: "Behörighetshantering", type: "service" },
    { id: "svc3", label: "Beställningar", type: "service" },
    { id: "svc4", label: "Nätverksstöd", type: "service" },
  ],
  categories: [
    { id: "cat1", label: "IT-Support", type: "category" },
    { id: "cat2", label: "Behörighet", type: "category" },
    { id: "cat3", label: "Beställning", type: "category" },
    { id: "cat4", label: "Nätverk", type: "category" },
  ],
};

export const pobApi = {
  async getTickets(): Promise<PobTicket[]> {
    await delay(300);
    return [...mockTickets];
  },

  async getTicket(id: string): Promise<PobTicket | undefined> {
    await delay(200);
    return mockTickets.find(t => t.id === id);
  },

  async createTicket(data: { title: string; description: string; category: string; priority: string }): Promise<{ ticketId: string }> {
    await delay(500);
    const prefix = data.category === "Beställning" ? "BES" : "INC";
    return { ticketId: `${prefix}-2025-${String(Math.floor(Math.random() * 900) + 100)}` };
  },

  async getLookups(type: string): Promise<LookupValue[]> {
    await delay(200);
    return mockLookups[type] || [];
  },

  async getStats(): Promise<StatsData> {
    await delay(400);
    return {
      totalTickets: 47,
      avgResolutionDays: 3.2,
      byCategory: [
        { category: "IT-Support", count: 22 },
        { category: "Behörighet", count: 10 },
        { category: "Beställning", count: 9 },
        { category: "Nätverk", count: 6 },
      ],
      byMonth: [
        { month: "Aug", count: 5 },
        { month: "Sep", count: 7 },
        { month: "Okt", count: 8 },
        { month: "Nov", count: 6 },
        { month: "Dec", count: 12 },
        { month: "Jan", count: 9 },
      ],
      byStatus: [
        { status: "Öppna", count: 8 },
        { status: "Pågående", count: 5 },
        { status: "Lösta", count: 22 },
        { status: "Stängda", count: 12 },
      ],
    };
  },
};
