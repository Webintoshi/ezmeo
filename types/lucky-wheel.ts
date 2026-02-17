export type LuckyWheelProbabilityMode = 'percentage' | 'weight';
export type LuckyWheelPrizeType = 'coupon' | 'product' | 'discount' | 'none';

export interface LuckyWheelConfig {
  id: string;
  name: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  max_total_spins: number;
  max_spins_per_user: number;
  cooldown_hours: number;
  probability_mode: LuckyWheelProbabilityMode;
  require_membership: boolean;
  require_email_verified: boolean;
  wheel_segments: number;
  primary_color: string;
  secondary_color: string;
  created_at: string;
  updated_at: string;
}

export interface LuckyWheelPrize {
  id: string;
  config_id: string;
  name: string;
  description: string | null;
  prize_type: LuckyWheelPrizeType;
  coupon_code: string | null;
  coupon_discount_percent: number | null;
  coupon_discount_amount: number | null;
  product_id: string | null;
  discount_value: number | null;
  probability_value: number;
  stock_total: number;
  stock_remaining: number;
  is_unlimited_stock: boolean;
  color_hex: string;
  icon_emoji: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LuckyWheelSpin {
  id: string;
  config_id: string | null;
  prize_id: string | null;
  user_email: string | null;
  user_phone: string | null;
  user_name: string | null;
  customer_id: string | null;
  fingerprint_hash: string | null;
  ip_address: string | null;
  user_agent: string | null;
  is_winner: boolean;
  prize_name: string | null;
  coupon_code: string | null;
  spin_number: number | null;
  spin_result: Record<string, any> | null;
  created_at: string;
}

export interface LuckyWheelSpinRequest {
  configId: string;
  userEmail?: string;
  userPhone?: string;
  userName: string;
  fingerprint: string;
}

export interface LuckyWheelSpinResponse {
  success: boolean;
  spin: LuckyWheelSpin;
  prize?: LuckyWheelPrize;
  canSpin: boolean;
  remainingSpins: number;
  message: string;
}

export interface LuckyWheelValidationResult {
  canSpin: boolean;
  reason?: string;
  remainingCooldown?: number;
  spinsRemaining: number;
}

export interface LuckyWheelStats {
  totalSpins: number;
  uniqueUsers: number;
  winners: number;
  winRate: number;
  prizeDistribution: {
    prizeName: string;
    count: number;
    percentage: number;
  }[];
  recentSpins: LuckyWheelSpin[];
  dailySpins: {
    date: string;
    count: number;
  }[];
}

export interface LuckyWheelSimulationResult {
  totalSpins: number;
  prizeResults: {
    prizeName: string;
    won: number;
    expected: number;
    difference: number;
  }[];
  actualWinRate: number;
  expectedWinRate: number;
}
