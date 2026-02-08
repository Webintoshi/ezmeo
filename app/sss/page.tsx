"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "1",
    question: "Ürünleriniz katkı maddesi içeriyor mu?",
    answer:
      "Hayır, ürünlerimiz %100 doğal ve katkısız. Hiçbir koruyucu, yapay tatlandırıcı veya katkı maddesi kullanmıyoruz.",
    category: "Ürünler",
  },
  {
    id: "2",
    question: "Kargo ücreti ne kadar?",
    answer:
      "Standart kargo 29.90 TL, hızlı kargo 49.90 TL'dir. 500 TL ve üzeri siparişlerde kargo ücretsizdir.",
    category: "Kargo",
  },
  {
    id: "3",
    question: "Siparişim ne zaman kargoya verilir?",
    answer:
      "Siparişiniz onaylandıktan sonra aynı gün veya en geç 1 iş günü içinde kargoya verilir.",
    category: "Kargo",
  },
  {
    id: "4",
    question: "İade koşulları nelerdir?",
    answer:
      "Ürün teslim tarihinden itibaren 14 gün içinde, ambalajı açılmamış ve kullanılmamış ürünleri iade edebilirsiniz. Gıda ürünleri olduğu için hijyen kuralları gereği açılmış ürünler iade edilemez.",
    category: "İade",
  },
  {
    id: "5",
    question: "Ürünlerinizin son kullanma tarihi ne kadar?",
    answer:
      "Ürünlerimizin son kullanma tarihi üretim tarihinden itibaren 12 aydır. Her ürünün üzerinde son kullanma tarihi belirtilmiştir.",
    category: "Ürünler",
  },
  {
    id: "6",
    question: "Ürünleriniz vegan mı?",
    answer:
      "Çoğu ürünümüz vegan'dır. Sütlü fındık kreması hariç tüm ürünlerimiz vegan ve bitkisel kaynaklıdır.",
    category: "Ürünler",
  },
  {
    id: "7",
    question: "Glutensiz ürünleriniz var mı?",
    answer:
      "Evet, tüm fıstık ezmeleri, fındık ezmeleri ve kuruyemişlerimiz glutensizdir.",
    category: "Ürünler",
  },
  {
    id: "8",
    question: "Ödeme yöntemleri nelerdir?",
    answer:
      "Kredi kartı, havale/EFT ve kapıda ödeme seçeneklerimiz bulunmaktadır. Tüm ödemeler güvenli altyapı ile yapılır.",
    category: "Ödeme",
  },
  {
    id: "9",
    question: "Toplu alımlarda indirim var mı?",
    answer:
      "Evet, toplu alımlarda özel indirimler sunuyoruz. Detaylı bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz.",
    category: "Ödeme",
  },
  {
    id: "10",
    question: "Ürünlerinizi nasıl saklamalıyım?",
    answer:
      "Ürünlerimizi serin ve kuru bir yerde, direkt güneş ışığından uzak tutmanızı öneririz. Açıldıktan sonra buzdolabında saklanabilir.",
    category: "Ürünler",
  },
  {
    id: "11",
    question: "Kargo takip numaramı nasıl öğrenebilirim?",
    answer:
      "Siparişiniz kargoya verildikten sonra, size e-posta ve SMS ile kargo takip numarası gönderilir.",
    category: "Kargo",
  },
  {
    id: "12",
    question: "Fatura kesiliyor mu?",
    answer:
      "Evet, tüm siparişlerimize e-fatura kesilir. Faturanız e-posta adresinize gönderilir.",
    category: "Ödeme",
  },
];

const CATEGORIES = ["Tümü", "Ürünler", "Kargo", "İade", "Ödeme"];

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = FAQ_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === "Tümü" || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sıkça Sorulan Sorular
            </h1>
            <p className="text-xl text-primary-foreground/90">
              Merak ettiğiniz her şey burada
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Soru ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  Aradığınız soruyu bulamadık. Lütfen farklı bir arama yapın veya
                  bizimle iletişime geçin.
                </p>
              </div>
            ) : (
              filteredFAQs.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenId(openId === item.id ? null : item.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 pr-4">
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-2">
                        {item.category}
                      </span>
                      <h3 className="font-semibold text-gray-900">
                        {item.question}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                        openId === item.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openId === item.id && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Sorunuza cevap bulamadınız mı?
            </h2>
            <p className="mb-6 text-white/90">
              Müşteri hizmetlerimiz size yardımcı olmaktan mutluluk duyar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/iletisim"
                className="inline-block px-6 py-3 bg-white text-primary rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                İletişime Geç
              </a>
              <a
                href="mailto:ezmeoshopify@proton.me"
                className="inline-block px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                E-posta Gönder
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
