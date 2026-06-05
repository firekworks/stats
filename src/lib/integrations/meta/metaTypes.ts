import type { ConnectedAssetInput, DbRow } from "@/lib/integrations/store";

export const META_PROVIDER = "meta";

export const META_READ_SCOPES = [
  "ads_read",
  "pages_show_list",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_manage_insights",
  "leads_retrieval"
] as const;

export type MetaTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
};

export type MetaUser = {
  id: string;
  name?: string;
};

export type MetaAssetDiscovery = {
  assets: ConnectedAssetInput[];
  user: MetaUser | null;
};

export type MetaSyncResult = {
  integrationsChecked: number;
  assetsChecked: number;
  recordsInserted: number;
  recordsUpdated: number;
  errors: string[];
};

export type MetaGraphList<T extends DbRow> = {
  data?: T[];
  paging?: {
    next?: string;
  };
};
