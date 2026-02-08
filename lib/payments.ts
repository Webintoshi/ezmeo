import { PaymentGatewayConfig, PaymentGatewayFormData, PaymentGatewayFormState, PaymentGateway, PaymentMethodStatus } from "@/types/payment";
import { getStoredPaymentGateways, savePaymentGateways } from "./payment-storage";

let paymentGateways: PaymentGatewayConfig[] = [];

const DEFAULT_GATEWAYS: PaymentGatewayConfig[] = [
  {
    id: "bank-transfer",
    gateway: "bank_transfer",
    name: "Havale / EFT",
    description: "Siparişinizi tamamladıktan sonra banka hesabımıza havale yapın.",
    icon: "🏛️",
    status: "active",
    environment: "production",
    merchantId: "",
    apiKey: "",
    apiSecret: "",
    publicKey: "",
    clientId: "",
    secretKey: "",
    webhookUrl: "",
    bankAccount: {
      bankName: "Garanti BBVA",
      iban: "TR12 3456 7890 1234 5678 9012 34",
      accountHolder: "Ezmeo Gıda San. ve Tic. Ltd. Şti.",
      swift: "",
      currency: "TRY",
    },
    codSettings: {
      minOrderAmount: 0,
      maxOrderAmount: 10000,
      applicableRegions: ["Türkiye"],
      instructions: "",
    },
    supportedCardTypes: [],
    supportedMethods: ["bank_transfer", "eft"],
    currency: "TRY",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Initialize on load
if (typeof window !== "undefined") {
  const stored = getStoredPaymentGateways();
  if (stored.length === 0) {
    savePaymentGateways(DEFAULT_GATEWAYS);
    paymentGateways = DEFAULT_GATEWAYS;
  } else {
    paymentGateways = stored;
  }
}

export function getPaymentGateways(): PaymentGatewayConfig[] {
  if (typeof window !== "undefined") {
    paymentGateways = getStoredPaymentGateways();
  }
  return paymentGateways;
}

export function getPaymentGatewayById(id: string): PaymentGatewayConfig | undefined {
  return paymentGateways.find(g => g.id === id);
}

export function getPaymentGatewayByType(type: PaymentGateway): PaymentGatewayConfig | undefined {
  return paymentGateways.find(g => g.gateway === type);
}

export function getActivePaymentGateways(): PaymentGatewayConfig[] {
  return paymentGateways.filter(g => g.status === "active");
}

export function getPaymentGatewaysByStatus(status: PaymentMethodStatus): PaymentGatewayConfig[] {
  return paymentGateways.filter(g => g.status === status);
}

export function addPaymentGateway(data: PaymentGatewayFormState): PaymentGatewayConfig {
  const newGateway: PaymentGatewayConfig = {
    id: `pg-${Date.now()}`,
    ...data,
    gateway: data.gateway as PaymentGateway,
    icon: data.icon || getGatewayIcon(data.gateway),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  paymentGateways.push(newGateway);
  savePaymentGateways(paymentGateways);
  return newGateway;
}

function getGatewayIcon(gateway: PaymentGateway | ""): string {
  const icons: Record<PaymentGateway, string> = {
    paytr: "💳",
    iyzico: "🏦",
    stripe: "💎",
    bank_transfer: "🏛️",
    cod: "📦",
  };
  return icons[gateway as PaymentGateway] || "💳";
}

export function updatePaymentGateway(id: string, data: Partial<PaymentGatewayFormState>): void {
  const index = paymentGateways.findIndex(g => g.id === id);
  if (index !== -1) {
    const { gateway: newGateway, ...rest } = data;
    paymentGateways[index] = {
      ...paymentGateways[index],
      ...rest,
      ...(newGateway ? { gateway: newGateway } : {}),
      updatedAt: new Date(),
    };
    savePaymentGateways(paymentGateways);
  }
}

export function deletePaymentGateway(id: string): void {
  const index = paymentGateways.findIndex(g => g.id === id);
  if (index !== -1) {
    paymentGateways.splice(index, 1);
    savePaymentGateways(paymentGateways);
  }
}

export function togglePaymentGatewayStatus(id: string, status: PaymentMethodStatus): void {
  const gateway = getPaymentGatewayById(id);
  if (gateway) {
    gateway.status = status;
    gateway.updatedAt = new Date();
    savePaymentGateways(paymentGateways);
  }
}

export function testPaymentGatewayConnection(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const gateway = getPaymentGatewayById(id);
      if (!gateway) {
        resolve(false);
        return;
      }

      // Simulate connection test
      const isActive = gateway.status === "active";
      const hasCredentials = gateway.apiKey || gateway.apiSecret || gateway.secretKey || gateway.merchantId;

      resolve(isActive && !!hasCredentials);
    }, 2000);
  });
}

export function validatePaymentGatewayConfig(config: Partial<PaymentGatewayFormState>, gateway: PaymentGateway): string[] {
  const errors: string[] = [];

  if (!config.name?.trim()) {
    errors.push("Ödeme yöntemi adı gereklidir");
  }

  switch (gateway) {
    case "paytr":
    case "iyzico":
    case "stripe":
      if (!config.merchantId?.trim()) {
        errors.push("Merchant ID gereklidir");
      }
      if (!config.apiKey?.trim() && !config.secretKey?.trim() && !config.clientId?.trim()) {
        errors.push("API Key veya Secret Key gereklidir");
      }
      break;

    case "bank_transfer":
      if (!config.bankAccount?.bankName?.trim()) {
        errors.push("Banka adı gereklidir");
      }
      if (!config.bankAccount?.iban?.trim()) {
        errors.push("IBAN gereklidir");
      }
      if (!config.bankAccount?.accountHolder?.trim()) {
        errors.push("Hesap sahibi gereklidir");
      }
      break;

    case "cod":
      // COD doesn't require credentials
      break;

    default:
      errors.push("Geçersiz ödeme yöntemi");
  }

  if (config.environment === "production" && config.status === "active") {
    if (!config.apiKey && !config.apiSecret && !config.secretKey && !config.merchantId) {
      errors.push("Canlı ortamda API bilgileri gereklidir");
    }
  }

  return errors;
}

export function getPaymentGatewayStats() {
  const active = paymentGateways.filter(g => g.status === "active").length;
  const inactive = paymentGateways.filter(g => g.status === "inactive").length;
  const testMode = paymentGateways.filter(g => g.status === "test").length;
  const production = paymentGateways.filter(g => g.environment === "production").length;
  const sandbox = paymentGateways.filter(g => g.environment === "sandbox").length;

  return {
    total: paymentGateways.length,
    active,
    inactive,
    testMode,
    production,
    sandbox,
  };
}

export function updatePaymentGatewayOrder(ids: string[]): void {
  const sortedGateways = ids.map(id => getPaymentGatewayById(id)).filter((g): g is PaymentGatewayConfig => g !== undefined);
  paymentGateways = sortedGateways;
  savePaymentGateways(paymentGateways);
}

export function duplicatePaymentGateway(id: string): PaymentGatewayConfig {
  const original = getPaymentGatewayById(id);
  if (!original) throw new Error("Payment gateway not found");

  const duplicate: PaymentGatewayFormState = {
    gateway: original.gateway,
    name: `${original.name} (Kopya)`,
    description: original.description,
    status: "inactive",
    environment: original.environment,
    merchantId: "",
    apiKey: "",
    apiSecret: "",
    publicKey: "",
    clientId: "",
    secretKey: "",
    webhookUrl: "",
    bankAccount: {
      bankName: "",
      iban: "",
      accountHolder: "",
      swift: "",
      currency: "TRY",
    },
    codSettings: {
      minOrderAmount: 0,
      maxOrderAmount: 10000,
      applicableRegions: ["TÜRKİYE"],
      instructions: "",
    },
    supportedCardTypes: [],
    supportedMethods: [],
    currency: "TRY",
  };

  return addPaymentGateway(duplicate);
}

export function getDefaultPaymentGatewayConfig(gateway: PaymentGateway): PaymentGatewayFormData {
  const baseConfig = {
    merchantId: "",
    apiKey: "",
    apiSecret: "",
    publicKey: "",
    clientId: "",
    secretKey: "",
    webhookUrl: "",
    bankAccount: {
      bankName: "",
      iban: "",
      accountHolder: "",
      swift: "",
      currency: "TRY",
    },
    codSettings: {
      minOrderAmount: 0,
      maxOrderAmount: 10000,
      applicableRegions: ["TÜRKİYE"],
      instructions: "",
    },
    supportedCardTypes: ["Visa", "MasterCard"],
    currency: "TRY",
  };

  switch (gateway) {
    case "paytr":
      return {
        ...baseConfig,
        gateway: "paytr",
        name: "PAYTR",
        description: "PAYTR ödeme yöntemi",
        status: "inactive",
        environment: "sandbox",
        supportedMethods: ["credit_card", "debit_card", "bank_transfer"],
      };

    case "iyzico":
      return {
        ...baseConfig,
        gateway: "iyzico",
        name: "İYZİCO",
        description: "İYZİCO ödeme yöntemi",
        status: "inactive",
        environment: "sandbox",
        supportedMethods: ["credit_card", "installments", "bank_transfer"],
      };

    case "stripe":
      return {
        ...baseConfig,
        gateway: "stripe",
        name: "Stripe",
        description: "Stripe ödeme yöntemi",
        status: "inactive",
        environment: "sandbox",
        supportedCardTypes: ["Visa", "MasterCard", "Amex", "Diners Club", "JCB", "Discover"],
        supportedMethods: ["credit_card", "debit_card", "digital_wallets"],
        currency: "USD",
      };

    case "bank_transfer":
      return {
        ...baseConfig,
        gateway: "bank_transfer",
        name: "Banka Hesabına Ödeme",
        description: "Havale ve EFT ile ödeme",
        status: "inactive",
        environment: "production",
        supportedCardTypes: [],
        supportedMethods: ["bank_transfer", "eft"],
      };

    case "cod":
      return {
        ...baseConfig,
        gateway: "cod",
        name: "Kapıda Ödeme",
        description: "Teslimat anında nakit ödeme",
        status: "inactive",
        environment: "production",
        supportedCardTypes: [],
        supportedMethods: ["cash"],
      };

    default:
      throw new Error(`Unknown payment gateway: ${gateway}`);
  }
}
