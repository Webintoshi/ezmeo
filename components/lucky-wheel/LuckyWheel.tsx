"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

interface LuckyWheelProps {
  config?: {
    id: string;
    name: string;
    is_active: boolean;
    wheel_segments: number;
    primary_color: string;
    secondary_color: string;
  };
  prizes: Prize[];
  onSpinComplete?: (prize: Prize, couponCode?: string) => void;
  className?: string;
}

export default function LuckyWheel({ 
  config, 
  prizes, 
  onSpinComplete,
  className 
}: LuckyWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showResult, setShowResult] = useState(false);

  const primaryColor = config?.primary_color || '#FF6B35';
  const secondaryColor = config?.secondary_color || '#FFE66D';
  const segments = config?.wheel_segments || prizes.length || 8;

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    ctx.clearRect(0, 0, width, height);

    const segmentAngle = (2 * Math.PI) / segments;
    const sortedPrizes = [...prizes].sort((a, b) => a.display_order - b.display_order);

    sortedPrizes.forEach((prize, index) => {
      const startAngle = index * segmentAngle - Math.PI / 2;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = index % 2 === 0 ? primaryColor : secondaryColor;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px system-ui';
      
      const text = prize.icon_emoji 
        ? `${prize.icon_emoji} ${prize.name}`
        : prize.name;
      
      const maxTextLength = 15;
      const displayText = text.length > maxTextLength 
        ? text.substring(0, maxTextLength) + '...' 
        : text;
      
      ctx.fillText(displayText, radius - 20, 5);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 3;
    ctx.stroke();

  }, [prizes, segments, primaryColor, secondaryColor]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  const spin = async (targetPrize?: Prize) => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);
    setSelectedPrize(null);

    const randomIndex = Math.floor(Math.random() * prizes.length);
    const prize = targetPrize || prizes[randomIndex];
    const prizeIndex = prizes.findIndex(p => p.id === prize.id);
    
    const segmentAngle = 360 / segments;
    const targetAngle = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2);
    
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const totalRotation = (extraSpins * 360) + targetAngle + rotation;
    
    setRotation(totalRotation);

    setTimeout(() => {
      setSelectedPrize(prize);
      setShowResult(true);
      setIsSpinning(false);
      onSpinComplete?.(prize);
    }, 4000);
  };

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="max-w-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
          }}
        />
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
          <div 
            className="w-8 h-12"
            style={{ 
              backgroundColor: primaryColor,
              clipPath: 'polygon(50% 100%, 0 0, 100% 0)'
            }} 
          />
        </div>
      </div>

      <button
        onClick={() => spin()}
        disabled={isSpinning || !config?.is_active}
        className={cn(
          "mt-8 px-12 py-4 text-xl font-bold text-white rounded-full",
          "transition-all transform hover:scale-105 active:scale-95",
          isSpinning || !config?.is_active
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/30"
        )}
        style={{ 
          background: isSpinning || !config?.is_active 
            ? '#ccc' 
            : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`
        }}
      >
        {isSpinning ? "Dönüyor..." : "ÇEVİR"}
      </button>

      <AnimatePresence>
        {showResult && selectedPrize && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowResult(false)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">
                {selectedPrize.icon_emoji || '🎉'}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedPrize.prize_type !== 'none' ? 'Tebrikler!' : 'Şansını Dene!'}
              </h2>
              
              <p className="text-lg text-gray-600 mb-4">
                {selectedPrize.prize_type !== 'none' 
                  ? `${selectedPrize.name} kazandınız!`
                  : 'Bir sonraki sefere şans dileriz!'}
              </p>
              
              {selectedPrize.description && (
                <p className="text-sm text-gray-500 mb-6">
                  {selectedPrize.description}
                </p>
              )}
              
              <button
                onClick={() => setShowResult(false)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
              >
                Kapat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
