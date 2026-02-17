"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import SpinForm from "./SpinForm";

const LuckyWheel = dynamic(() => import("./LuckyWheel"), { ssr: false });

interface Prize {
  id: string;
  name: string;
  description?: string;
  prize_type: string;
  color_hex: string;
  icon_emoji?: string;
  image_url?: string;
  display_order: number;
}

interface WheelConfig {
  id: string;
  name: string;
  is_active: boolean;
  wheel_segments: number;
  primary_color: string;
  secondary_color: string;
  require_membership: boolean;
  require_email_verified: boolean;
  start_date?: string;
  end_date?: string;
}

export default function LuckyWheelPage() {
  const [config, setConfig] = useState<WheelConfig | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinLoading, setSpinLoading] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [remainingSpins, setRemainingSpins] = useState(0);
  const [spun, setSpun] = useState(false);
  const [fingerprint, setFingerprint] = useState("");

  useEffect(() => {
    const fp = localStorage.getItem("wheel_fingerprint") || 
      `fp-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("wheel_fingerprint", fp);
    setFingerprint(fp);

    fetchWheelData();
  }, []);

  const fetchWheelData = async () => {
    try {
      const res = await fetch("/api/lucky-wheel");
      const data = await res.json();
      
      if (data.success) {
        setConfig(data.config);
        setPrizes(data.prizes || []);
        
        if (!data.config?.is_active) {
          setCanSpin(false);
        }
      } else {
        toast.error(data.error || "Şans çarkı yüklenirken hata oluştu");
      }
    } catch (error) {
      console.error("Fetch wheel data error:", error);
      toast.error("Şans çarkı yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const validateSpin = async (userEmail?: string, userPhone?: string) => {
    try {
      const res = await fetch("/api/lucky-wheel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate",
          userEmail,
          userPhone,
          fingerprint
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setCanSpin(data.canSpin);
        setRemainingSpins(data.spinsRemaining);
        
        if (!data.canSpin) {
          toast.error(data.reason || "Şans çarkını çeviremezsiniz");
          return false;
        }
      }
      
      return data.canSpin;
    } catch (error) {
      console.error("Validate spin error:", error);
      return true;
    }
  };

  const handleSpin = async (userData: { userName: string; userEmail?: string; userPhone?: string }) => {
    const isValid = await validateSpin(userData.userEmail, userData.userPhone);
    if (!isValid) return;

    setSpinLoading(true);
    
    try {
      const res = await fetch("/api/lucky-wheel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "spin",
          configId: config?.id,
          userName: userData.userName,
          userEmail: userData.userEmail,
          userPhone: userData.userPhone,
          fingerprint
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSpun(true);
        setRemainingSpins(data.remainingSpins);
        
        if (data.prize) {
          toast.success(data.message);
        } else {
          toast.info(data.message);
        }
      } else {
        toast.error(data.error || "Spin sırasında hata oluştu");
      }
    } catch (error) {
      console.error("Spin error:", error);
      toast.error("Spin sırasında hata oluştu");
    } finally {
      setSpinLoading(false);
    }
  };

  const handleSpinComplete = (prize: Prize, couponCode?: string) => {
    if (prize.prize_type !== 'none' && couponCode) {
      toast.success(`Kupon kodunuz: ${couponCode}`, {
        duration: 10000
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Şans çarkı yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center max-w-md shadow-xl">
          <div className="text-6xl mb-4">🎡</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Şans Çarkı</h1>
          <p className="text-gray-600">
            Şu anda aktif bir şans çarkı bulunmuyor. Lütfen daha sonra tekrar deneyin!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {config.name}
          </h1>
          <p className="text-gray-600">
            Şansınızı deneyin, harika ödüller kazanın!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="flex justify-center">
            <LuckyWheel
              config={config}
              prizes={prizes}
              onSpinComplete={handleSpinComplete}
            />
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl">
            {!spun ? (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Katılmak için formu doldurun
                </h2>
                <SpinForm
                  onSubmit={handleSpin}
                  requireEmail={config.require_membership}
                  requirePhone={config.require_membership}
                  isLoading={spinLoading}
                />
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎊</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Katıldınız!
                </h2>
                <p className="text-gray-600 mb-4">
                  Sonuçları bekleyin...
                </p>
                <button
                  onClick={() => {
                    setSpun(false);
                    setCanSpin(true);
                  }}
                  className="text-orange-500 hover:underline"
                >
                  Yeniden dene (test için)
                </button>
              </div>
            )}
          </div>
        </div>

        {config.start_date && config.end_date && (
          <p className="text-center text-sm text-gray-500 mt-8">
            Kampanya {new Date(config.start_date).toLocaleDateString("tr-TR")} - {" "}
            {new Date(config.end_date).toLocaleDateString("tr-TR")} tarihleri arasında geçerlidir.
          </p>
        )}
      </div>
    </div>
  );
}
