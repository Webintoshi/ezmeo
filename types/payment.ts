export type PaymentGateway = "paytr" | "iyzico" | "stripe" | "bank_transfer" | "cod";

export type PaymentMethodStatus = "active" | "inactive" | "test";

export type PaymentEnvironment = "sandbox" | "production";

export interface PaymentGatewayConfig {
  id: string;
  gateway: PaymentGateway;
  name: string;
  description: string;
  icon: string;
  status: PaymentMethodStatus;
  environment: PaymentEnvironment;
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  publicKey: string;
  clientId: string;
  secretKey: string;
  webhookUrl: string;
  bankAccount: {
    bankName: string;
    iban: string;
    accountHolder: string;
    swift: string;
    currency: string;
  };
  codSettings: {
    minOrderAmount: number;
    maxOrderAmount: number;
    applicableRegions: string[];
    instructions: string;
  };
  supportedCardTypes: string[];
  supportedMethods: string[];
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentGatewayFormData {
  gateway: PaymentGateway;
  name: string;
  description: string;
  status: PaymentMethodStatus;
  environment: PaymentEnvironment;
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  publicKey: string;
  clientId: string;
  secretKey: string;
  webhookUrl: string;
  bankAccount: {
    bankName: string;
    iban: string;
    accountHolder: string;
    swift: string;
    currency: string;
  };
  codSettings: {
    minOrderAmount: number;
    maxOrderAmount: number;
    applicableRegions: string[];
    instructions: string;
  };
  supportedCardTypes: string[];
  supportedMethods: string[];
  currency: string;
}

export interface PaymentGatewayFormState extends Omit<PaymentGatewayFormData, 'gateway'> {
  gateway: PaymentGateway | "";
  icon?: string;
}

export const PAYMENT_GATEWAYS = [
  {
    value: "paytr",
    name: "PAYTR",
    description: "Türkiye'nin en popüler ödeme sistemlerinden biri",
    icon: "💳",
    color: "from-red-500 to-red-600",
    supportedMethods: ["credit_card", "debit_card", "bank_transfer"],
  },
  {
    value: "iyzico",
    name: "İYZİCO",
    description: "Türk Telekom iştiraki modern ödeme çözümü",
    icon: "🏦",
    color: "from-blue-500 to-blue-600",
    supportedMethods: ["credit_card", "installments", "bank_transfer"],
  },
  {
    value: "stripe",
    name: "Stripe",
    description: "Global ödeme çözümleri ve kart işleme",
    icon: "💎",
    color: "from-purple-500 to-purple-600",
    supportedMethods: ["credit_card", "debit_card", "digital_wallets"],
  },
  {
    value: "bank_transfer",
    name: "Banka Hesabına Ödeme",
    description: "Havale ve EFT ile güvenli ödeme",
    icon: "🏛️",
    color: "from-green-500 to-green-600",
    supportedMethods: ["bank_transfer", "eft"],
  },
  {
    value: "cod",
    name: "Kapıda Ödeme",
    description: "Teslimat anında nakit ödeme seçeneği",
    icon: "📦",
    color: "from-orange-500 to-orange-600",
    supportedMethods: ["cash"],
  },
] as const;

export const PAYMENT_METHOD_STATUSES = [
  { value: "active", label: "Aktif", color: "bg-green-100 text-green-700" },
  { value: "inactive", label: "Pasif", color: "bg-red-100 text-red-700" },
  { value: "test", label: "Test Modu", color: "bg-yellow-100 text-yellow-700" },
] as const;

export const PAYMENT_ENVIRONMENTS = [
  { value: "sandbox", label: "Test Ortamı", description: "Geliştirme ve test için" },
  { value: "production", label: "Canlı Ortam", description: "Gerçek işlemler için" },
] as const;

export const CARD_TYPES = ["Visa", "MasterCard", "Amex", "Diners Club", "JCB", "Discover"];

export const INSTALLMENT_PLANS = [
  { value: 1, label: "Tek Çekim" },
  { value: 2, label: "2 Taksit" },
  { value: 3, label: "3 Taksit" },
  { value: 6, label: "6 Taksit" },
  { value: 9, label: "9 Taksit" },
  { value: 12, label: "12 Taksit" },
];

export const CURRENCIES = [
  { value: "TRY", label: "Türk Lirası", symbol: "₺" },
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
];
