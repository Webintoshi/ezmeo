import { createServerClient } from "@/lib/supabase";
import type {
  LuckyWheelConfig,
  LuckyWheelPrize,
  LuckyWheelSpin,
  LuckyWheelSpinRequest,
  LuckyWheelSpinResponse,
  LuckyWheelValidationResult,
  LuckyWheelPrizeType
} from "@/types/lucky-wheel";

const DEFAULT_CONFIG_ID = '00000000-0000-0000-0000-000000000001';

export class PrizeAllocator {
  private prizes: LuckyWheelPrize[];
  private mode: 'percentage' | 'weight';

  constructor(prizes: LuckyWheelPrize[], mode: 'percentage' | 'weight' = 'percentage') {
    this.prizes = prizes.filter(p => p.is_active && (p.is_unlimited_stock || p.stock_remaining > 0));
    this.mode = mode;
  }

  selectPrize(): LuckyWheelPrize | null {
    if (this.prizes.length === 0) return null;

    if (this.mode === 'percentage') {
      return this.selectByPercentage();
    } else {
      return this.selectByWeight();
    }
  }

  private selectByPercentage(): LuckyWheelPrize {
    const totalProbability = this.prizes.reduce((sum, p) => sum + (p.probability_value || 0), 0);
    const random = Math.random() * totalProbability;
    
    let cumulative = 0;
    for (const prize of this.prizes) {
      cumulative += prize.probability_value || 0;
      if (random <= cumulative) {
        return prize;
      }
    }
    
    return this.prizes[this.prizes.length - 1];
  }

  private selectByWeight(): LuckyWheelPrize {
    const weights = this.prizes.map(p => p.probability_value || 1);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const random = Math.random() * totalWeight;
    
    let cumulative = 0;
    for (let i = 0; i < this.prizes.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return this.prizes[i];
      }
    }
    
    return this.prizes[this.prizes.length - 1];
  }

  simulate(spinCount: number): Map<string, number> {
    const results = new Map<string, number>();
    
    for (let i = 0; i < spinCount; i++) {
      const prize = this.selectPrize();
      if (prize) {
        const current = results.get(prize.name) || 0;
        results.set(prize.name, current + 1);
      }
    }
    
    return results;
  }
}

export class SpinEngine {
  private supabase: ReturnType<typeof createServerClient>;

  constructor() {
    this.supabase = createServerClient();
  }

  async executeSpin(request: LuckyWheelSpinRequest): Promise<LuckyWheelSpinResponse> {
    const { configId, userEmail, userPhone, userName, fingerprint } = request;

    const validation = await this.validateSpin(configId, userEmail, userPhone, fingerprint);
    if (!validation.canSpin) {
      return {
        success: false,
        spin: {} as LuckyWheelSpin,
        canSpin: false,
        remainingSpins: validation.spinsRemaining,
        message: validation.reason || 'Şans çarkını çeviremezsiniz'
      };
    }

    const config = await this.getConfig(configId);
    if (!config) {
      return {
        success: false,
        spin: {} as LuckyWheelSpin,
        canSpin: false,
        remainingSpins: 0,
        message: 'Şans çarkı yapılandırması bulunamadı'
      };
    }

    const prizes = await this.getActivePrizes(configId);
    if (prizes.length === 0) {
      return {
        success: false,
        spin: {} as LuckyWheelSpin,
        canSpin: false,
        remainingSpins: 0,
        message: 'Şu anda aktif ödül bulunmuyor'
      };
    }

    const allocator = new PrizeAllocator(prizes, config.probability_mode);
    const selectedPrize = allocator.selectPrize();

    let finalPrize = selectedPrize;
    let isWinner = selectedPrize && selectedPrize.prize_type !== 'none';

    if (selectedPrize && !selectedPrize.is_unlimited_stock && selectedPrize.stock_remaining > 0) {
      await this.decrementStock(selectedPrize.id);
    }

    const spinNumber = await this.getSpinCount(configId) + 1;

    const { data: spin, error } = await this.supabase
      .from('lucky_wheel_spins')
      .insert({
        config_id: configId,
        prize_id: finalPrize?.id || null,
        user_email: userEmail || null,
        user_phone: userPhone || null,
        user_name: userName,
        fingerprint_hash: this.hashFingerprint(fingerprint),
        is_winner: isWinner,
        prize_name: finalPrize?.name || null,
        coupon_code: isWinner ? this.generateCouponCode(finalPrize) : null,
        spin_number: spinNumber,
        spin_result: {
          prize_id: finalPrize?.id,
          prize_type: finalPrize?.prize_type,
          wheel_segment: finalPrize?.display_order
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Spin insert error:', error);
      return {
        success: false,
        spin: {} as LuckyWheelSpin,
        canSpin: false,
        remainingSpins: 0,
        message: 'Spin kaydedilirken hata oluştu'
      };
    }

    return {
      success: true,
      spin,
      prize: finalPrize || undefined,
      canSpin: true,
      remainingSpins: validation.spinsRemaining - 1,
      message: isWinner ? `Tebrikler! ${finalPrize?.name} kazandınız!` : 'Bir sonraki şansınız için şans dileriz!'
    };
  }

  async validateSpin(
    configId: string,
    userEmail?: string,
    userPhone?: string,
    fingerprint?: string
  ): Promise<LuckyWheelValidationResult> {
    const config = await this.getConfig(configId);
    if (!config) {
      return { canSpin: false, reason: 'Şans çarkı yapılandırması bulunamadı', spinsRemaining: 0 };
    }

    if (!config.is_active) {
      return { canSpin: false, reason: 'Şans çarkı şu anda aktif değil', spinsRemaining: 0 };
    }

    const now = new Date();
    if (config.start_date && new Date(config.start_date) > now) {
      return { canSpin: false, reason: 'Şans çarkı henüz başlamadı', spinsRemaining: 0 };
    }

    if (config.end_date && new Date(config.end_date) < now) {
      return { canSpin: false, reason: 'Şans çarkı sona erdi', spinsRemaining: 0 };
    }

    const totalSpins = await this.getSpinCount(configId);
    if (totalSpins >= config.max_total_spins) {
      return { canSpin: false, reason: 'Toplam spin limiti doldu', spinsRemaining: 0 };
    }

    if (userEmail) {
      const userSpinCount = await this.getUserSpinCount(configId, 'email', userEmail);
      if (userSpinCount >= config.max_spins_per_user) {
        return { canSpin: false, reason: 'Bu email ile spin hakkınızı kullandınız', spinsRemaining: 0 };
      }

      const lastSpin = await this.getLastUserSpin(configId, 'email', userEmail);
      if (lastSpin && config.cooldown_hours > 0) {
        const cooldownEnd = new Date(lastSpin.created_at);
        cooldownEnd.setHours(cooldownEnd.getHours() + config.cooldown_hours);
        if (now < cooldownEnd) {
          const remainingHours = Math.ceil((cooldownEnd.getTime() - now.getTime()) / (1000 * 60 * 60));
          return { 
            canSpin: false, 
            reason: `${remainingHours} saat sonra tekrar deneyebilirsiniz`,
            remainingCooldown: remainingHours,
            spinsRemaining: 0
          };
        }
      }
    }

    if (userPhone) {
      const phoneSpinCount = await this.getUserSpinCount(configId, 'phone', userPhone);
      if (phoneSpinCount >= config.max_spins_per_user) {
        return { canSpin: false, reason: 'Bu telefon numarası ile spin hakkınızı kullandınız', spinsRemaining: 0 };
      }
    }

    if (fingerprint) {
      const fpSpinCount = await this.getUserSpinCount(configId, 'fingerprint', this.hashFingerprint(fingerprint));
      if (fpSpinCount >= config.max_spins_per_user) {
        return { canSpin: false, reason: 'Bu cihaz ile spin hakkınızı kullandınız', spinsRemaining: 0 };
      }
    }

    const remainingSpins = config.max_spins_per_user - Math.max(
      userEmail ? await this.getUserSpinCount(configId, 'email', userEmail) : 0,
      userPhone ? await this.getUserSpinCount(configId, 'phone', userPhone) : 0,
      fingerprint ? await this.getUserSpinCount(configId, 'fingerprint', this.hashFingerprint(fingerprint)) : 0
    );

    return { canSpin: true, spinsRemaining: Math.max(0, remainingSpins) };
  }

  async getConfig(configId: string = DEFAULT_CONFIG_ID): Promise<LuckyWheelConfig | null> {
    const { data, error } = await this.supabase
      .from('lucky_wheel_configs')
      .select('*')
      .eq('id', configId)
      .single();

    if (error) {
      console.error('Get config error:', error);
      return null;
    }

    return data;
  }

  async getActiveConfig(): Promise<{ config: LuckyWheelConfig | null; prizes: LuckyWheelPrize[] }> {
    const { data: config, error: configError } = await this.supabase
      .from('lucky_wheel_configs')
      .select('*')
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      return { config: null, prizes: [] };
    }

    const { data: prizes, error: prizesError } = await this.supabase
      .from('lucky_wheel_prizes')
      .select('*')
      .eq('config_id', config.id)
      .eq('is_active', true)
      .order('display_order');

    return { 
      config, 
      prizes: prizesError ? [] : (prizes || []) 
    };
  }

  private async getActivePrizes(configId: string): Promise<LuckyWheelPrize[]> {
    const { data, error } = await this.supabase
      .from('lucky_wheel_prizes')
      .select('*')
      .eq('config_id', configId)
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.error('Get prizes error:', error);
      return [];
    }

    return (data || []).filter(p => p.is_unlimited_stock || p.stock_remaining > 0);
  }

  private async decrementStock(prizeId: string): Promise<void> {
    await this.supabase.rpc('decrement_prize_stock', { prize_id: prizeId });
  }

  private async getSpinCount(configId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('lucky_wheel_spins')
      .select('*', { count: 'exact', head: true })
      .eq('config_id', configId);

    return count || 0;
  }

  private async getUserSpinCount(
    configId: string, 
    field: 'email' | 'phone' | 'fingerprint', 
    value: string
  ): Promise<number> {
    const columnMap = {
      email: 'user_email',
      phone: 'user_phone',
      fingerprint: 'fingerprint_hash'
    };

    const { count, error } = await this.supabase
      .from('lucky_wheel_spins')
      .select('*', { count: 'exact', head: true })
      .eq('config_id', configId)
      .eq(columnMap[field], value);

    return count || 0;
  }

  private async getLastUserSpin(
    configId: string, 
    field: 'email' | 'phone', 
    value: string
  ): Promise<LuckyWheelSpin | null> {
    const columnMap = {
      email: 'user_email',
      phone: 'user_phone'
    };

    const { data, error } = await this.supabase
      .from('lucky_wheel_spins')
      .select('*')
      .eq('config_id', configId)
      .eq(columnMap[field], value)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return error ? null : data;
  }

  private hashFingerprint(fingerprint: string): string {
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private generateCouponCode(prize: LuckyWheelPrize | undefined): string {
    if (!prize) return '';
    
    const prefix = prize.prize_type === 'coupon' && prize.coupon_code 
      ? prize.coupon_code 
      : `LUCKY-${prize.name.substring(0, 3).toUpperCase()}`;
    
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${suffix}`;
  }
}

export async function createLuckyWheelSpin(
  request: LuckyWheelSpinRequest
): Promise<LuckyWheelSpinResponse> {
  const engine = new SpinEngine();
  return engine.executeSpin(request);
}

export async function validateLuckyWheelSpin(
  configId: string,
  userEmail?: string,
  userPhone?: string,
  fingerprint?: string
): Promise<LuckyWheelValidationResult> {
  const engine = new SpinEngine();
  return engine.validateSpin(configId, userEmail, userPhone, fingerprint);
}

export async function getLuckyWheelConfig(
  configId?: string
): Promise<{ config: LuckyWheelConfig | null; prizes: LuckyWheelPrize[] }> {
  const engine = new SpinEngine();
  return engine.getActiveConfig();
}
