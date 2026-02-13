"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    setSubscribed(true);
    setEmail("");
    toast.success("Bültenimize başarıyla abone oldunuz!");
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl">
            <Mail className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Bültenimize Katılın
          </h2>

          <p className="text-lg text-gray-600 mb-8">
            Özel kampanyalar, yeni ürünler ve lezzetli tarifler için bültenimize abone olun. 
            İlk siparişinizde <span className="font-bold text-primary">%10 indirim</span> kazanın!
          </p>

          {subscribed ? (
            <div className="flex items-center justify-center gap-3 p-6 bg-green-50 rounded-2xl border border-green-100">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-green-700 font-medium">Teşekkürler! Bültenimize başarıyla abone oldunuz.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Abone Ol</span>
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-sm text-gray-500 mt-6">
            Abone olarak gizlilik politikamızı kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </section>
  );
}
