import { PaymentGatewayConfig, PaymentGatewayFormData, PaymentGatewayFormState, PaymentGateway, PaymentMethodStatus } from "@/types/payment";
import { PaymentService } from "./payment-service";

let paymentGateways: PaymentGatewayConfig[] = [];

// Initialize with empty or default, but real data comes from async API
// Removed DEFAULT_GATEWAYS

export async function getPaymentGateways(): Promise<PaymentGatewayConfig[]> {
  try {
    const fromApi = await PaymentService.getAll();
    if (fromApi.length > 0) {
      paymentGateways = fromApi;
    } else {
      paymentGateways = [];
    }
  } catch (error) {
    console.error("Failed to fetch gateways:", error);
    // paymentGateways remains as is (empty)
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

export async function addPaymentGateway(data: PaymentGatewayFormState): Promise<PaymentGatewayConfig> {
  // Ensure we have the latest data
  await getPaymentGateways();

  const newGateway: PaymentGatewayConfig = {
    id: `pg-${Date.now()}`,
    ...data,
    gateway: data.gateway as PaymentGateway,
    icon: data.icon || getGatewayIcon(data.gateway),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedGateways = [...paymentGateways, newGateway];
  await PaymentService.saveAll(updatedGateways);

  // Update local cache
  paymentGateways = updatedGateways;

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

export async function updatePaymentGateway(id: string, data: Partial<PaymentGatewayFormState>): Promise<void> {
  const index = paymentGateways.findIndex(g => g.id === id);
  if (index !== -1) {
    const { gateway: newGateway, ...rest } = data;
    paymentGateways[index] = {
      ...paymentGateways[index],
      ...rest,
      ...(newGateway ? { gateway: newGateway } : {}),
      updatedAt: new Date(),
    };
    await PaymentService.saveAll(paymentGateways);
  }
}

export async function deletePaymentGateway(id: string): Promise<void> {
  const index = paymentGateways.findIndex(g => g.id === id);
  if (index !== -1) {
    paymentGateways.splice(index, 1);
    await PaymentService.saveAll(paymentGateways);
  }
}

export async function togglePaymentGatewayStatus(id: string, status: PaymentMethodStatus): Promise<void> {
  const gateway = getPaymentGatewayById(id);
  if (gateway) {
    gateway.status = status;
    gateway.updatedAt = new Date();
    await PaymentService.saveAll(paymentGateways);
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

export async function updatePaymentGatewayOrder(ids: string[]): Promise<void> {
  const sortedGateways = ids.map(id => getPaymentGatewayById(id)).filter((g): g is PaymentGatewayConfig => g !== undefined);
  paymentGateways = sortedGateways;
  await PaymentService.saveAll(paymentGateways);
}

export async function duplicatePaymentGateway(id: string): Promise<PaymentGatewayConfig> {
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

  return await addPaymentGateway(duplicate);
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
