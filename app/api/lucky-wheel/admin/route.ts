import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { PrizeAllocator } from "@/lib/lucky-wheel";
import type { LuckyWheelConfig, LuckyWheelPrize, LuckyWheelSpin, LuckyWheelStats, LuckyWheelSimulationResult } from "@/types/lucky-wheel";

const DEFAULT_CONFIG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const configId = searchParams.get('id') || DEFAULT_CONFIG_ID;
    
    const supabase = createClient();
    
    if (action === 'stats') {
      const { data: spins, error } = await supabase
        .from('lucky_wheel_spins')
        .select('*')
        .eq('config_id', configId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const totalSpins = spins?.length || 0;
      const winners = spins?.filter(s => s.is_winner).length || 0;
      const uniqueUsers = new Set([
        ...spins?.map(s => s.user_email).filter(Boolean) || [],
        ...spins?.map(s => s.user_phone).filter(Boolean) || []
      ]).size;
      
      const prizeCounts = spins?.reduce((acc, spin) => {
        if (spin.prize_name) {
          acc[spin.prize_name] = (acc[spin.prize_name] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};
      
      const prizeDistribution = Object.entries(prizeCounts).map(([prizeName, count]) => ({
        prizeName,
        count,
        percentage: totalSpins > 0 ? (count / totalSpins) * 100 : 0
      }));
      
      const dailySpins = spins?.reduce((acc, spin) => {
        const date = new Date(spin.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const stats: LuckyWheelStats = {
        totalSpins,
        uniqueUsers,
        winners,
        winRate: totalSpins > 0 ? (winners / totalSpins) * 100 : 0,
        prizeDistribution,
        recentSpins: (spins || []).slice(0, 20),
        dailySpins: Object.entries(dailySpins)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-30)
      };
      
      return NextResponse.json({ success: true, stats });
    }
    
    const { data: configs, error: configsError } = await supabase
      .from('lucky_wheel_configs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (configsError) throw configsError;
    
    return NextResponse.json({ 
      success: true, 
      configs: configs || [] 
    });
    
  } catch (error) {
    console.error('Lucky wheel admin GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Admin verileri yüklenirken hata oluştu'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config, prizes, configId } = body;
    
    const supabase = createClient();
    
    if (action === 'save') {
      const configIdToUse = configId || DEFAULT_CONFIG_ID;
      
      const { data: savedConfig, error: configError } = await supabase
        .from('lucky_wheel_configs')
        .upsert({
          id: configIdToUse,
          name: config.name,
          is_active: config.is_active || false,
          start_date: config.start_date,
          end_date: config.end_date,
          max_total_spins: config.max_total_spins,
          max_spins_per_user: config.max_spins_per_user,
          cooldown_hours: config.cooldown_hours,
          probability_mode: config.probability_mode,
          require_membership: config.require_membership,
          require_email_verified: config.require_email_verified,
          wheel_segments: config.wheel_segments,
          primary_color: config.primary_color,
          secondary_color: config.secondary_color,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (configError) {
        console.error('Config save error:', configError);
        throw configError;
      }
      
      if (prizes && Array.isArray(prizes)) {
        await supabase
          .from('lucky_wheel_prizes')
          .delete()
          .eq('config_id', configIdToUse);
        
        const prizesToInsert = prizes.map((p: any, index: number) => ({
          config_id: configIdToUse,
          name: p.name,
          description: p.description || null,
          prize_type: p.prize_type,
          coupon_code: p.coupon_code || null,
          coupon_discount_percent: p.coupon_discount_percent || null,
          coupon_discount_amount: p.coupon_discount_amount || null,
          product_id: p.product_id || null,
          discount_value: p.discount_value || null,
          probability_value: p.probability_value || 0,
          stock_total: p.stock_total || 0,
          stock_remaining: p.stock_remaining ?? p.stock_total ?? 0,
          is_unlimited_stock: p.is_unlimited_stock || false,
          color_hex: p.color_hex,
          icon_emoji: p.icon_emoji || null,
          image_url: p.image_url || null,
          display_order: p.display_order || index,
          is_active: p.is_active !== false
        }));
        
        const { error: prizesError } = await supabase
          .from('lucky_wheel_prizes')
          .insert(prizesToInsert);
        
        if (prizesError) {
          console.error('Prizes save error:', prizesError);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Şans çarkı yapılandırması kaydedildi',
        configId: configIdToUse
      });
    }
    
    if (action === 'toggle') {
      const { data: updated, error } = await supabase
        .from('lucky_wheel_configs')
        .update({ is_active: config.is_active })
        .eq('id', config.id)
        .select()
        .single();
      
      if (error) throw error;
      
      return NextResponse.json({
        success: true,
        message: config.is_active ? 'Şans çarkı aktif edildi' : 'Şans çarkı pasif edildi',
        config: updated
      });
    }
    
    if (action === 'simulate') {
      const { data: prizes } = await supabase
        .from('lucky_wheel_prizes')
        .select('*')
        .eq('config_id', configId || DEFAULT_CONFIG_ID)
        .eq('is_active', true);
      
      if (!prizes || prizes.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Aktif ödül bulunamadı'
        }, { status: 400 });
      }
      
      const config = await supabase
        .from('lucky_wheel_configs')
        .select('probability_mode')
        .eq('id', configId || DEFAULT_CONFIG_ID)
        .single();
      
      const allocator = new PrizeAllocator(prizes, config.data?.probability_mode || 'percentage');
      const simulationResults = allocator.simulate(1000);
      
      const totalWins = Array.from(simulationResults.values()).reduce((a, b) => a + b, 0);
      
      const result: LuckyWheelSimulationResult = {
        totalSpins: 1000,
        prizeResults: prizes.map(p => {
          const won = simulationResults.get(p.name) || 0;
          return {
            prizeName: p.name,
            won,
            expected: p.probability_value || 0,
            difference: won - (p.probability_value || 0)
          };
        }),
        actualWinRate: totalWins > 0 ? (totalWins / 1000) * 100 : 0,
        expectedWinRate: prizes
          .filter(p => p.prize_type !== 'none')
          .reduce((sum, p) => sum + (p.probability_value || 0), 0)
      };
      
      return NextResponse.json({
        success: true,
        simulation: result
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Geçersiz action'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Lucky wheel admin POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'İşlem sırasında hata oluştu'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('id');
    
    if (!configId) {
      return NextResponse.json({
        success: false,
        error: 'Config ID gereklidir'
      }, { status: 400 });
    }
    
    const supabase = createClient();
    
    const { error } = await supabase
      .from('lucky_wheel_configs')
      .delete()
      .eq('id', configId);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: 'Şans çarkı yapılandırması silindi'
    });
    
  } catch (error) {
    console.error('Lucky wheel admin DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: 'Silme işlemi sırasında hata oluştu'
    }, { status: 500 });
  }
}
