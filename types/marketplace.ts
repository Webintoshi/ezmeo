export type MarketplaceType =
  | "hepsiburada"
  | "trendyol"
  | "n11"
  | "amazon"
  | "etsy"
  | "amazon-usa"
  | "ebay";

export type MarketplaceStatus = "connected" | "disconnected" | "error" | "syncing";

export type SyncStatus = "idle" | "syncing" | "completed" | "failed";

export type SyncType = "products" | "orders" | "inventory" | "all";

export interface MarketplaceCredentials {
  apiKey?: string;
  apiSecret?: string;
  sellerId?: string;
  marketplaceId?: string;
  storeUrl?: string;
  username?: string;
  password?: string;
}

export interface MarketplaceConfig {
  id: string;
  type: MarketplaceType;
  name: string;
  logo: string;
  color: string;
  status: MarketplaceStatus;
  credentials: MarketplaceCredentials;
  connectedAt?: Date;
  lastSyncAt?: Date;
  syncSettings: {
    autoSyncProducts: boolean;
    autoSyncOrders: boolean;
    autoSyncInventory: boolean;
    syncInterval: number; // minutes
  };
  stats: {
    totalProducts: number;
    syncedProducts: number;
    totalOrders: number;
    syncedOrders: number;
    lastError?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketplaceProduct {
  id: string;
  marketplaceId: string;
  marketplaceProductId: string;
  productId: string;
  status: "active" | "inactive" | "error";
  syncStatus: "synced" | "pending" | "failed";
  lastSyncAt?: Date;
  price?: number;
  stock?: number;
}

export interface MarketplaceOrder {
  id: string;
  marketplaceId: string;
  marketplaceOrderId: string;
  internalOrderId?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  syncStatus: "synced" | "pending" | "failed";
  total: number;
  items: number;
  customer: {
    name: string;
    email?: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncResult {
  marketplaceId: string;
  type: SyncType;
  success: boolean;
  total: number;
  synced: number;
  failed: number;
  errors: string[];
  startedAt: Date;
  completedAt?: Date;
}

export const MARKETPLACES: {
  type: MarketplaceType;
  name: string;
  logo: string;
  color: string;
  description: string;
  website: string;
  requires: string[];
}[] = [
  {
    type: "hepsiburada",
    name: "Hepsiburada",
    logo: "🛒",
    color: "from-orange-500 to-red-600",
    description: "Türkiye'nin en büyük e-ticaret platformu",
    website: "https://hepsiburada.com",
    requires: ["apiKey", "merchantId"],
  },
  {
    type: "trendyol",
    name: "Trendyol",
    logo: "🛍️",
    color: "from-blue-500 to-indigo-600",
    description: "Moda ve yaşam tarzı kategorisi",
    website: "https://trendyol.com",
    requires: ["apiKey", "sellerId"],
  },
  {
    type: "n11",
    name: "N11",
    logo: "🛋️",
    color: "from-purple-500 to-pink-600",
    description: "Türkiye'nin önde gelen pazaryeri",
    website: "https://n11.com",
    requires: ["apiKey", "appKey", "appSecret"],
  },
  {
    type: "amazon",
    name: "Amazon Türkiye",
    logo: "📦",
    color: "from-yellow-500 to-orange-600",
    description: "Global e-ticaret devi - Türkiye",
    website: "https://amazon.com.tr",
    requires: ["accessKey", "secretKey", "sellerId"],
  },
  {
    type: "amazon-usa",
    name: "Amazon USA",
    logo: "🌎",
    color: "from-gray-700 to-black",
    description: "Global e-ticaret devi - ABD",
    website: "https://amazon.com",
    requires: ["accessKey", "secretKey", "sellerId"],
  },
  {
    type: "etsy",
    name: "Etsy",
    logo: "🎨",
    color: "from-orange-600 to-amber-600",
    description: "El yapımı ürünleri için pazaryeri",
    website: "https://etsy.com",
    requires: ["apiKey", "shopId"],
  },
  {
    type: "ebay",
    name: "eBay",
    logo: "💎",
    color: "from-blue-600 to-cyan-600",
    description: "Global açık artırma ve alışveriş platformu",
    website: "https://ebay.com",
    requires: ["appId", "certId", "devId", "token"],
  },
];

export const SYNC_TYPES: {
  value: SyncType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "products",
    label: "Ürün Senkronizasyonu",
    description: "Ürünleri pazaryerine gönder",
    icon: "Package",
  },
  {
    value: "orders",
    label: "Sipariş Senkronizasyonu",
    description: "Siparişleri sisteme çek",
    icon: "ShoppingBag",
  },
  {
    value: "inventory",
    label: "Stok Senkronizasyonu",
    description: "Stok durumlarını güncelle",
    icon: "Warehouse",
  },
  {
    value: "all",
    label: "Tam Senkronizasyon",
    description: "Tüm verileri senkronize et",
    icon: "RefreshCw",
  },
];
