import {
  MarketplaceConfig,
  MarketplaceCredentials,
  MarketplaceType,
  MarketplaceStatus,
  SyncStatus,
  SyncType,
  SyncResult,
  MarketplaceProduct,
  MarketplaceOrder,
  MARKETPLACES,
} from "@/types/marketplace";
import { getAllProducts } from "@/lib/products";
import { Product } from "@/types/product";
import { getOrders } from "@/lib/orders";
import { Order } from "@/types/order";

// Marketplace storage
let marketplaces: MarketplaceConfig[] = [];
let marketplaceProducts: MarketplaceProduct[] = [];
let marketplaceOrders: MarketplaceOrder[] = [];

// Initialize from localStorage
export function initializeMarketplaces() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const stored = localStorage.getItem("marketplaces");
    const storedProducts = localStorage.getItem("marketplace_products");
    const storedOrders = localStorage.getItem("marketplace_orders");

    if (stored) {
      marketplaces = JSON.parse(stored);
    }
    if (storedProducts) {
      marketplaceProducts = JSON.parse(storedProducts);
    }
    if (storedOrders) {
      marketplaceOrders = JSON.parse(storedOrders);
    }
  } catch (error) {
    console.error("Marketplaces initialization error:", error);
    marketplaces = [];
    marketplaceProducts = [];
    marketplaceOrders = [];
  }
}

function saveMarketplaces() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem("marketplaces", JSON.stringify(marketplaces));
    localStorage.setItem("marketplace_products", JSON.stringify(marketplaceProducts));
    localStorage.setItem("marketplace_orders", JSON.stringify(marketplaceOrders));
  } catch (error) {
    console.error("Marketplaces save error:", error);
  }
}

// Get all marketplaces
export function getMarketplaces(): MarketplaceConfig[] {
  return marketplaces;
}

// Get marketplace by ID
export function getMarketplaceById(id: string): MarketplaceConfig | undefined {
  return marketplaces.find(m => m.id === id);
}

// Get marketplace by type
export function getMarketplaceByType(type: MarketplaceType): MarketplaceConfig | undefined {
  return marketplaces.find(m => m.type === type);
}

// Add marketplace
export function addMarketplace(config: Omit<MarketplaceConfig, "id" | "stats" | "createdAt" | "updatedAt">): MarketplaceConfig {
  const newMarketplace: MarketplaceConfig = {
    id: `mk-${Date.now()}`,
    ...config,
    stats: {
      totalProducts: 0,
      syncedProducts: 0,
      totalOrders: 0,
      syncedOrders: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  marketplaces.push(newMarketplace);
  saveMarketplaces();
  return newMarketplace;
}

// Update marketplace
export function updateMarketplace(id: string, data: Partial<MarketplaceConfig>): void {
  const index = marketplaces.findIndex(m => m.id === id);
  if (index !== -1) {
    marketplaces[index] = {
      ...marketplaces[index],
      ...data,
      updatedAt: new Date(),
    };
    saveMarketplaces();
  }
}

// Delete marketplace
export function deleteMarketplace(id: string): void {
  marketplaces = marketplaces.filter(m => m.id !== id);
  marketplaceProducts = marketplaceProducts.filter(p => p.marketplaceId !== id);
  marketplaceOrders = marketplaceOrders.filter(o => o.marketplaceId !== id);
  saveMarketplaces();
}

// Test marketplace connection
export async function testMarketplaceConnection(id: string): Promise<{ success: boolean; error?: string }> {
  const marketplace = getMarketplaceById(id);
  if (!marketplace) {
    return { success: false, error: "Marketplace bulunamadı" };
  }

  // Simulate API connection test
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check if credentials are provided
  const hasCredentials = Object.values(marketplace.credentials).some(v => v && v.length > 0);

  if (!hasCredentials) {
    return { success: false, error: "API kimlik bilgileri eksik" };
  }

  // Simulate successful connection
  return { success: true };
}

// Sync products to marketplace
export async function syncProductsToMarketplace(id: string): Promise<SyncResult> {
  const marketplace = getMarketplaceById(id);
  if (!marketplace) {
    return {
      marketplaceId: id,
      type: "products",
      success: false,
      total: 0,
      synced: 0,
      failed: 0,
      errors: ["Marketplace bulunamadı"],
      startedAt: new Date(),
    };
  }

  const products = await getAllProducts();
  const result: SyncResult = {
    marketplaceId: id,
    type: "products",
    success: true,
    total: products.length,
    synced: 0,
    failed: 0,
    errors: [],
    startedAt: new Date(),
  };

  // Update marketplace status
  updateMarketplace(id, {
    status: "syncing",
  });

  // Simulate product sync
  for (const product of products) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call

      const existingProduct = marketplaceProducts.find(
        p => p.marketplaceId === id && p.productId === product.id
      );

      if (existingProduct) {
        existingProduct.syncStatus = "synced";
        existingProduct.lastSyncAt = new Date();
        existingProduct.status = "active";
        existingProduct.price = product.variants[0]?.price || 0;
        existingProduct.stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
      } else {
        marketplaceProducts.push({
          id: `mp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          marketplaceId: id,
          marketplaceProductId: `${marketplace.type}-${product.id}`,
          productId: product.id,
          status: "active",
          syncStatus: "synced",
          lastSyncAt: new Date(),
          price: product.variants[0]?.price || 0,
          stock: product.variants.reduce((sum, v) => sum + v.stock, 0),
        });
      }

      result.synced++;
    } catch (error) {
      result.failed++;
      result.errors.push(`Ürün ${product.name} senkronize edilemedi`);
    }
  }

  result.completedAt = new Date();

  // Update marketplace stats
  updateMarketplace(id, {
    status: "connected",
    lastSyncAt: result.completedAt,
    stats: {
      ...marketplace.stats,
      totalProducts: products.length,
      syncedProducts: marketplaceProducts.filter(p => p.marketplaceId === id).length,
    },
  });

  saveMarketplaces();
  return result;
}

// Sync orders from marketplace
export async function syncOrdersFromMarketplace(id: string): Promise<SyncResult> {
  const marketplace = getMarketplaceById(id);
  if (!marketplace) {
    return {
      marketplaceId: id,
      type: "orders",
      success: false,
      total: 0,
      synced: 0,
      failed: 0,
      errors: ["Marketplace bulunamadı"],
      startedAt: new Date(),
    };
  }

  // Simulate order sync
  await new Promise(resolve => setTimeout(resolve, 1500));

  const result: SyncResult = {
    marketplaceId: id,
    type: "orders",
    success: true,
    total: 0, // Would come from API
    synced: 0,
    failed: 0,
    errors: [],
    startedAt: new Date(),
    completedAt: new Date(),
  };

  // Update marketplace status
  updateMarketplace(id, {
    status: "connected",
    lastSyncAt: result.completedAt,
  });

  return result;
}

// Sync inventory
export async function syncInventory(id: string): Promise<SyncResult> {
  const marketplace = getMarketplaceById(id);
  if (!marketplace) {
    return {
      marketplaceId: id,
      type: "inventory",
      success: false,
      total: 0,
      synced: 0,
      failed: 0,
      errors: ["Marketplace bulunamadı"],
      startedAt: new Date(),
    };
  }

  const products = await getAllProducts();
  const result: SyncResult = {
    marketplaceId: id,
    type: "inventory",
    success: true,
    total: products.length,
    synced: 0,
    failed: 0,
    errors: [],
    startedAt: new Date(),
  };

  // Update marketplace status
  updateMarketplace(id, {
    status: "syncing",
  });

  // Sync inventory
  for (const product of products) {
    try {
      await new Promise(resolve => setTimeout(resolve, 50)); // Faster than full product sync

      const marketplaceProduct = marketplaceProducts.find(
        p => p.marketplaceId === id && p.productId === product.id
      );

      if (marketplaceProduct) {
        marketplaceProduct.stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
        marketplaceProduct.lastSyncAt = new Date();
      }

      result.synced++;
    } catch (error) {
      result.failed++;
      result.errors.push(`Stok güncellenemedi: ${product.name}`);
    }
  }

  result.completedAt = new Date();

  // Update marketplace status
  updateMarketplace(id, {
    status: "connected",
    lastSyncAt: result.completedAt,
  });

  saveMarketplaces();
  return result;
}

// Get marketplace products
export function getMarketplaceProducts(id: string): MarketplaceProduct[] {
  return marketplaceProducts.filter(p => p.marketplaceId === id);
}

// Get marketplace orders
export function getMarketplaceOrders(id: string): MarketplaceOrder[] {
  return marketplaceOrders.filter(o => o.marketplaceId === id);
}

// Get marketplace stats
export function getMarketplaceStats(id: string) {
  const marketplace = getMarketplaceById(id);
  if (!marketplace) return null;

  const products = getMarketplaceProducts(id);
  const orders = getMarketplaceOrders(id);

  return {
    totalProducts: products.length,
    syncedProducts: products.filter(p => p.syncStatus === "synced").length,
    pendingProducts: products.filter(p => p.syncStatus === "pending").length,
    failedProducts: products.filter(p => p.syncStatus === "failed").length,
    totalOrders: orders.length,
    syncedOrders: orders.filter(o => o.syncStatus === "synced").length,
    pendingOrders: orders.filter(o => o.syncStatus === "pending").length,
    lastSync: marketplace.lastSyncAt,
    status: marketplace.status,
  };
}

// Get overall marketplace stats
export function getOverallMarketplaceStats() {
  const connected = marketplaces.filter(m => m.status === "connected").length;
  const syncing = marketplaces.filter(m => m.status === "syncing").length;
  const error = marketplaces.filter(m => m.status === "error").length;
  const totalProducts = marketplaceProducts.length;
  const totalOrders = marketplaceOrders.length;

  return {
    totalMarketplaces: marketplaces.length,
    connected,
    syncing,
    error,
    totalProducts,
    totalOrders,
    syncInProgress: syncing > 0,
  };
}

// Initialize marketplaces on module load
initializeMarketplaces();
