import { NextRequest, NextResponse } from "next/server";
import { createLuckyWheelSpin, validateLuckyWheelSpin, getLuckyWheelConfig } from "@/lib/lucky-wheel";

const DEFAULT_CONFIG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('id') || DEFAULT_CONFIG_ID;
    
    const { config, prizes } = await getLuckyWheelConfig(configId);
    
    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'Aktif şans çarkı bulunamadı'
      }, { status: 404 });
    }
    
    const publicPrizes = prizes.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      prize_type: p.prize_type,
      color_hex: p.color_hex,
      icon_emoji: p.icon_emoji,
      image_url: p.image_url,
      display_order: p.display_order
    }));
    
    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        name: config.name,
        is_active: config.is_active,
        wheel_segments: config.wheel_segments,
        primary_color: config.primary_color,
        secondary_color: config.secondary_color,
        require_membership: config.require_membership,
        require_email_verified: config.require_email_verified,
        start_date: config.start_date,
        end_date: config.end_date
      },
      prizes: publicPrizes
    });
  } catch (error) {
    console.error('Lucky wheel config error:', error);
    return NextResponse.json({
      success: false,
      error: 'Şans çarkı yapılandırması yüklenirken hata oluştu'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'spin') {
      const { configId, userEmail, userPhone, userName, fingerprint } = body;
      
      if (!userName || userName.trim().length < 2) {
        return NextResponse.json({
          success: false,
          error: 'Lütfen geçerli bir isim giriniz'
        }, { status: 400 });
      }
      
      if (!userEmail && !userPhone) {
        return NextResponse.json({
          success: false,
          error: 'Email veya telefon numarası gereklidir'
        }, { status: 400 });
      }
      
      const result = await createLuckyWheelSpin({
        configId: configId || DEFAULT_CONFIG_ID,
        userEmail,
        userPhone,
        userName,
        fingerprint: fingerprint || `${userEmail || userPhone}-${Date.now()}`
      });
      
      return NextResponse.json(result);
    }
    
    if (action === 'validate') {
      const { configId, userEmail, userPhone, fingerprint } = body;
      
      const result = await validateLuckyWheelSpin(
        configId || DEFAULT_CONFIG_ID,
        userEmail,
        userPhone,
        fingerprint
      );
      
      return NextResponse.json({
        success: true,
        ...result
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Geçersiz action'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Lucky wheel action error:', error);
    return NextResponse.json({
      success: false,
      error: 'İşlem sırasında hata oluştu'
    }, { status: 500 });
  }
}
