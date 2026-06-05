export type Role = "admin" | "sales" | "viewer" | "client";

export type ClientStatus = "active" | "paused" | "churned";

export type RoiMode = "estimated" | "real" | "insufficient_data";

export type CampaignPlatform =
  | "Meta Ads"
  | "Instagram"
  | "Facebook"
  | "Google Business"
  | "WhatsApp"
  | "Landing";

export type CampaignObjective =
  | "Mensajes"
  | "Reservas"
  | "Leads"
  | "Trafico"
  | "Llamadas"
  | "Reconocimiento";

export type CampaignStatus =
  | "draft"
  | "active"
  | "learning"
  | "paused"
  | "completed";

export type ContentType =
  | "Reel"
  | "Post"
  | "Carrusel"
  | "Story"
  | "Anuncio"
  | "Creatividad"
  | "Foto"
  | "Video"
  | "Copy"
  | "Landing"
  | "Miniatura";

export type ContentStatus =
  | "idea"
  | "recorded"
  | "editing"
  | "pending_approval"
  | "scheduled"
  | "published";

export type ContentPerformance = "low" | "ok" | "high" | "viral";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled";

export type ClientLevel = 1 | 2 | 3 | 4 | 5;

export type Client = {
  id: string;
  slug: string;
  publicName: string;
  legalName: string;
  leadId?: string | null;
  source?: string | null;
  taxId?: string | null;
  billingEmail?: string | null;
  billingAddress?: string | null;
  phone?: string | null;
  website?: string | null;
  industry: string;
  status: ClientStatus;
  city: string;
  averageTicket: number;
  allowPublicLeaderboardName: boolean;
  planName: string;
  planStatus: "Activo" | "Pausado" | "Baja";
  monthlyFee: number;
  onboardedAt: string;
  publicLeaderboardName: string;
};

export type MonthlyMetric = {
  id: string;
  clientId: string;
  month: number;
  year: number;
  reach: number;
  impressions: number;
  profileVisits: number;
  websiteClicks: number;
  calls: number;
  whatsappClicks: number;
  messages: number;
  leads: number;
  bookings: number;
  estimatedRevenue: number;
  realRevenue: number | null;
  adSpend: number;
  serviceFee: number;
  extras: number;
  totalInvestment: number;
  estimatedRoi: number | null;
  realRoi: number | null;
  roiMode: RoiMode;
  bestContentId: string | null;
  worstContentId: string | null;
  summary: string;
  diagnosis: string;
  nextMonthPlan: string;
};

export type Campaign = {
  id: string;
  clientId: string;
  name: string;
  platform: CampaignPlatform;
  objective: CampaignObjective;
  budget: number;
  spend: number;
  startDate: string;
  endDate: string | null;
  status: CampaignStatus;
  ctr: number;
  cpc: number;
  cpm: number;
  leads: number;
  costPerLead: number;
  roas: number | null;
  visibleSummary: string;
};

export type ContentItem = {
  id: string;
  clientId: string;
  title: string;
  type: ContentType;
  platform: CampaignPlatform;
  publishDate: string;
  status: ContentStatus;
  url: string;
  storagePath: string | null;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number;
  performance: ContentPerformance;
  reusable: boolean;
  learning: string;
};

export type Report = {
  id: string;
  clientId: string;
  month: number;
  year: number;
  title: string;
  status: "draft" | "generated" | "sent";
  storagePath: string | null;
  generatedAt: string;
};

export type Invoice = {
  id: string;
  clientId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  taxableBase: number;
  vatRate: number;
  withholdingRate: number;
  total: number;
  paymentMethod: string;
  publicNotes: string;
  items: InvoiceItem[];
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type LeaderboardEntry = {
  id: string;
  clientId: string;
  category: string;
  rank: number;
  displayName: string;
  metricLabel: string;
  trend: number;
  isCurrentClient?: boolean;
};

export type ClientScore = {
  clientId: string;
  score: number;
  level: ClientLevel;
  levelName: "Nuevo" | "Colaborador" | "Pro" | "Partner" | "VIP";
  punctualPayment: number;
  approvalsSpeed: number;
  collaboration: number;
  profitability: number;
  growth: number;
  churnRisk: number;
  communication: number;
  satisfaction: number;
  action: string;
  updatedAt: string;
};

export type Alert = {
  id: string;
  clientId: string;
  title: string;
  severity: "info" | "warning" | "critical" | "success";
  visibility: "internal" | "client";
  createdAt: string;
};

export type Task = {
  id: string;
  clientId: string;
  title: string;
  dueDate: string;
  status: "open" | "in_progress" | "done";
  visibleToClient: boolean;
};

export type PortalData = {
  clients: Client[];
  selectedClient: Client;
  metrics: MonthlyMetric[];
  campaigns: Campaign[];
  content: ContentItem[];
  reports: Report[];
  invoices: Invoice[];
  leaderboards: LeaderboardEntry[];
  scores: ClientScore[];
  alerts: Alert[];
  tasks: Task[];
};
