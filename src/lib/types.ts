export type Role = "admin" | "team" | "sales" | "viewer" | "client" | "demo_viewer";

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
  | "completed"
  | "cancelled";

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
  | "Miniatura"
  | "GBP"
  | "WhatsApp";

export type ContentStatus =
  | "idea"
  | "recorded"
  | "editing"
  | "pending_approval"
  | "scheduled"
  | "published"
  | "archived";

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
  isDemo?: boolean;
  demoLabel?: string | null;
  leadId?: string | null;
  source?: string | null;
  taxId?: string | null;
  billingEmail?: string | null;
  billingAddress?: string | null;
  phone?: string | null;
  contactName?: string | null;
  website?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  googleBusinessProfileUrl?: string | null;
  whatsappUrl?: string | null;
  internalNotes?: string | null;
  industry: string;
  status: ClientStatus;
  city: string;
  logoUrl?: string | null;
  brandColors?: string[];
  brandVoice?: string | null;
  targetAudience?: string | null;
  objective?: string | null;
  services?: string[];
  driveFolderId?: string | null;
  driveFolderUrl?: string | null;
  canvaFolderUrl?: string | null;
  canvaAccountUrl?: string | null;
  portalAccessToken?: string | null;
  convertedFromLead?: boolean;
  conversionDate?: string | null;
  originalLeadScore?: number | null;
  originalLeadCity?: string | null;
  originalLeadSector?: string | null;
  averageTicket: number;
  allowPublicLeaderboardName: boolean;
  planName: string;
  planStatus: "Activo" | "Pausado" | "Baja";
  monthlyFee: number;
  adBudget?: number;
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
  campaignType?: string | null;
  offer?: string | null;
  targetAudience?: string | null;
  funnelStage?: string | null;
  funnelStagePlan?: Record<string, unknown> | null;
  recommendations?: string | null;
  launchChecklist?: unknown[] | null;
  isDemo?: boolean;
  metricMode?: "demo" | "real" | "manual" | null;
  budget: number;
  spend: number;
  startDate: string;
  endDate: string | null;
  status: CampaignStatus;
  impressions?: number;
  reach?: number;
  clicks?: number;
  ctr: number;
  cpc: number;
  cpm: number;
  leads: number;
  messages?: number;
  conversions?: number;
  costPerLead: number;
  roas: number | null;
  visibleSummary: string;
  source?: string | null;
  syncStatus?: string | null;
  metaAdAccountId?: string | null;
  metaCampaignId?: string | null;
  metaAdsetId?: string | null;
  metaAdId?: string | null;
  externalCampaignId?: string | null;
  externalAdAccountId?: string | null;
  plannedBudget?: number;
  realSpend?: number;
  servicePrice?: number;
  internalPrice?: number;
  lifecycleStatus?: string | null;
  lastSyncedAt?: string | null;
};

export type ContentItem = {
  id: string;
  clientId: string;
  campaignId?: string | null;
  contentCode?: string | null;
  title: string;
  type: ContentType;
  platform: CampaignPlatform;
  objective?: string | null;
  funnelStage?: string | null;
  hook?: string | null;
  caption?: string | null;
  visualBrief?: string | null;
  cta?: string | null;
  dueDate?: string | null;
  publishDate: string;
  status: ContentStatus;
  url: string;
  storagePath: string | null;
  driveFolderId?: string | null;
  googleDriveFolderId?: string | null;
  googleDriveFileId?: string | null;
  driveFileUrl?: string | null;
  canvaDesignId?: string | null;
  canvaEditUrl?: string | null;
  canvaViewUrl?: string | null;
  metaPostId?: string | null;
  previewImageUrl?: string | null;
  previewData?: Record<string, unknown> | null;
  notes?: string | null;
  assignedTo?: string | null;
  isDemo?: boolean;
  clientVisible?: boolean;
  isPromoted?: boolean;
  promotionBudget?: number;
  views: number;
  reach: number;
  impressions?: number;
  plays?: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks?: number;
  engagementRate: number;
  performance: ContentPerformance;
  reusable: boolean;
  learning: string;
  source?: string | null;
  syncStatus?: string | null;
  externalMediaId?: string | null;
  externalAccountId?: string | null;
  servicePrice?: number;
  internalPrice?: number;
  lifecycleStatus?: string | null;
  lastSyncedAt?: string | null;
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

export type CalendarEvent = {
  id: string;
  clientId: string | null;
  leadId: string | null;
  campaignId: string | null;
  contentItemId: string | null;
  title: string;
  type: string;
  status: "pending" | "confirmed" | "done" | "cancelled";
  startAt: string;
  endAt: string | null;
  location: string | null;
  googleMapsUrl: string | null;
  googleCalendarEventId: string | null;
  notes: string | null;
  assignedTo: string | null;
  createdBy?: string | null;
  isDemo?: boolean;
};

export type ContentIdea = {
  code?: string;
  title: string;
  objective: string;
  format: ContentType;
  funnelStage: string;
  pain: string;
  centralIdea: string;
  hook: string;
  screenText: string;
  voiceover: string;
  shot1: string;
  shot2: string;
  shot3: string;
  broll: string;
  resources: string;
  suggestedDate: string;
  promoted: boolean;
  adsSuggestion: string | null;
  copyBase: string;
  caption: string;
  cta: string;
  visualBrief: string;
  strategicReason: string;
  aida: {
    attention: string;
    interest: string;
    desire: string;
    action: string;
  };
};

export type CampaignPlan = {
  monthLabel: string;
  packName: string;
  packPrice: 390 | 590;
  objective: string;
  offer: string;
  targetAudience: string;
  mainPain: string;
  promise: string;
  brandTone: string;
  visualStyle: string;
  recommendedAdBudget: string;
  gbpChecklist: string[];
  whatsappChecklist: string[];
  calendarSummary: string;
  internalStatus: string;
  pieces: ContentIdea[];
};

export type IntegrationStatus = {
  id: string;
  clientId: string;
  provider: string;
  status: string;
  externalAccountName: string | null;
  providerUserName: string | null;
  lastSyncAt: string | null;
  errorMessage: string | null;
};

export type ConnectedAsset = {
  id: string;
  clientId: string;
  provider: string;
  assetType: string;
  externalId: string;
  name: string;
  status: string;
  isSelected: boolean;
  lastSyncedAt: string | null;
};

export type IntegrationSyncLog = {
  id: string;
  clientId: string;
  provider: string;
  status: "started" | "success" | "error";
  recordsInserted: number;
  recordsUpdated: number;
  startedAt: string;
  finishedAt: string | null;
  errorMessage: string | null;
};

export type LeadEvent = {
  id: string;
  clientId: string;
  provider: string;
  channel: string;
  campaignId: string | null;
  contentItemId: string | null;
  contactName: string | null;
  occurredAt: string;
  createdAt: string;
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
  calendarEvents: CalendarEvent[];
  integrations: IntegrationStatus[];
  connectedAssets: ConnectedAsset[];
  syncLogs: IntegrationSyncLog[];
  leadEvents: LeadEvent[];
};
