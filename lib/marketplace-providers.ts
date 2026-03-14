import type {
  MarketplaceInventorySyncResultItem,
  MarketplaceProvider,
  MarketplaceProviderAdapter,
  MarketplaceProviderAdapterResult,
  MarketplaceProviderDefinition,
} from "@/types/marketplace";

export const MARKETPLACE_PROVIDER_DEFINITIONS: MarketplaceProviderDefinition[] = [
  {
    id: "trendyol",
    name: "Trendyol",
    description: "Trendyol satici paneli icin katalog, stok ve siparis orkestrasyonu.",
    websiteUrl: "https://partner.trendyol.com",
    docsUrl: "https://developers.trendyol.com",
    logo: "TY",
    color: "from-orange-500 to-red-600",
    supportsWebhook: true,
    credentialFields: [
      { key: "sellerId", label: "Seller ID", required: true },
      { key: "apiKey", label: "API Key", required: true, type: "password" },
      { key: "apiSecret", label: "API Secret", required: true, type: "password" },
    ],
    mappingFields: [
      { key: "defaultCargoCompany", label: "Varsayilan kargo firmasi" },
      { key: "warehouseCode", label: "Depo kodu" },
    ],
    capabilities: ["listing", "inventory", "orders", "status", "webhook"],
  },
  {
    id: "hepsiburada",
    name: "Hepsiburada",
    description: "Hepsiburada merchant entegrasyonu icin operasyon paneli.",
    websiteUrl: "https://merchant.hepsiburada.com",
    docsUrl: "https://developers.hepsiburada.com",
    logo: "HB",
    color: "from-blue-500 to-indigo-600",
    supportsWebhook: true,
    credentialFields: [
      { key: "merchantId", label: "Merchant ID", required: true },
      { key: "username", label: "Kullanici adi", required: true },
      { key: "password", label: "Sifre", required: true, type: "password" },
    ],
    mappingFields: [
      { key: "shipmentTemplate", label: "Shipment template" },
      { key: "warehouseCode", label: "Depo kodu" },
    ],
    capabilities: ["listing", "inventory", "orders", "status", "webhook"],
  },
  {
    id: "n11",
    name: "N11",
    description: "N11 katalog, fiyat, stok ve siparis akislari icin entegrasyon katmani.",
    websiteUrl: "https://seller.n11.com",
    docsUrl: "https://api.n11.com",
    logo: "N11",
    color: "from-purple-500 to-pink-600",
    supportsWebhook: false,
    credentialFields: [
      { key: "appKey", label: "App Key", required: true, type: "password" },
      { key: "appSecret", label: "App Secret", required: true, type: "password" },
    ],
    mappingFields: [
      { key: "sellerCode", label: "Satici kodu" },
      { key: "shipmentCompany", label: "Kargo firmasi" },
    ],
    capabilities: ["listing", "inventory", "orders", "status", "polling"],
  },
  {
    id: "amazon_tr",
    name: "Amazon TR",
    description: "Amazon Selling Partner API tabanli Turkiye entegrasyonu.",
    websiteUrl: "https://sellercentral.amazon.com.tr",
    docsUrl: "https://developer-docs.amazon.com/sp-api",
    logo: "AMZ",
    color: "from-slate-700 to-black",
    supportsWebhook: false,
    credentialFields: [
      { key: "clientId", label: "LWA Client ID", required: true },
      { key: "clientSecret", label: "LWA Client Secret", required: true, type: "password" },
      { key: "refreshToken", label: "Refresh Token", required: true, type: "password" },
      { key: "sellerId", label: "Seller ID", required: true },
      { key: "marketplaceId", label: "Marketplace ID" },
    ],
    mappingFields: [
      { key: "fulfillmentLatency", label: "Hazirlama suresi" },
      { key: "merchantShippingGroup", label: "Shipping group" },
    ],
    capabilities: ["listing", "inventory", "orders", "status", "polling"],
  },
];

const providerIdSet = new Set<string>(MARKETPLACE_PROVIDER_DEFINITIONS.map((provider) => provider.id));

function getMissingRequiredCredentialKeys(provider: MarketplaceProvider, credentials: Record<string, string>) {
  const definition = getMarketplaceProviderDefinition(provider);
  if (!definition) {
    return ["provider"];
  }

  return definition.credentialFields
    .filter((field) => field.required)
    .filter((field) => !credentials[field.key]?.trim())
    .map((field) => field.key);
}

function buildSuccess(message: string, raw?: Record<string, unknown>): MarketplaceProviderAdapterResult {
  return {
    success: true,
    message,
    raw,
  };
}

function buildFailure(message: string, raw?: Record<string, unknown>): MarketplaceProviderAdapterResult {
  return {
    success: false,
    message,
    raw,
  };
}

function buildMockAdapter(provider: MarketplaceProvider): MarketplaceProviderAdapter {
  return {
    async connect({ credentials }) {
      const missingFields = getMissingRequiredCredentialKeys(provider, credentials);
      if (missingFields.length > 0) {
        return buildFailure(`Zorunlu alanlar eksik: ${missingFields.join(", ")}`);
      }

      return buildSuccess(`${provider} baglanti bilgileri kaydedildi.`, { simulated: true });
    },
    async testConnection({ credentials }) {
      const missingFields = getMissingRequiredCredentialKeys(provider, credentials);
      if (missingFields.length > 0) {
        return buildFailure(`Test icin zorunlu alanlar eksik: ${missingFields.join(", ")}`);
      }

      return buildSuccess(`${provider} baglanti testi basarili.`, { simulated: true });
    },
    async upsertListings({ listings, existingMappings }) {
      const existingByVariantId = new Map(
        existingMappings.map((mapping) => [mapping.variantId, mapping] as const),
      );

      return listings.map((listing) => {
        const existing = existingByVariantId.get(listing.variantId);
        return {
          variantId: listing.variantId,
          externalListingId:
            existing?.externalListingId ||
            `${provider}-listing-${(listing.sku || listing.variantId).replace(/[^a-zA-Z0-9_-]/g, "-")}`,
          externalSku: existing?.externalSku || listing.sku || null,
          status: listing.isActive ? "active" : "inactive",
          raw: {
            simulated: true,
            provider,
            productId: listing.productId,
            variantId: listing.variantId,
          },
        };
      });
    },
    async updateInventory({ inventory }) {
      return inventory.map<MarketplaceInventorySyncResultItem>((item) => ({
        variantId: item.variantId,
        externalListingId: item.externalListingId,
        raw: {
          simulated: true,
          provider,
          stock: item.stock,
          price: item.price,
        },
      }));
    },
    async pullOrders() {
      return [];
    },
    async acknowledgeOrder({ externalOrderId }) {
      return buildSuccess(`${provider} siparis ack basarili.`, {
        simulated: true,
        externalOrderId,
      });
    },
    async updateOrderStatus({ update }) {
      return buildSuccess(`${provider} siparis durumu guncellendi.`, {
        simulated: true,
        externalOrderId: update.externalOrderId,
        status: update.status,
      });
    },
    normalizeError(error) {
      return error instanceof Error ? error.message : "Bilinmeyen pazaryeri saglayici hatasi.";
    },
  };
}

const ADAPTERS: Record<MarketplaceProvider, MarketplaceProviderAdapter> = {
  trendyol: buildMockAdapter("trendyol"),
  hepsiburada: buildMockAdapter("hepsiburada"),
  n11: buildMockAdapter("n11"),
  amazon_tr: buildMockAdapter("amazon_tr"),
};

export function isMarketplaceProvider(value: string): value is MarketplaceProvider {
  return providerIdSet.has(value);
}

export function getMarketplaceProviderDefinition(provider: MarketplaceProvider) {
  return MARKETPLACE_PROVIDER_DEFINITIONS.find((item) => item.id === provider) || null;
}

export function getMarketplaceProviderAdapter(provider: MarketplaceProvider) {
  return ADAPTERS[provider];
}
