"use client";

import { useState } from "react";
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Product, ProductVariant } from "@/types/product";
import { addStoredProducts } from "@/lib/product-storage";

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  products: Product[];
}

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const parseBooleanField = (value: string): boolean => {
    const normalized = value.toLowerCase().trim();
    return normalized === "evet" || normalized === "yes" || normalized === "true" || normalized === "1";
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      
      if (lines.length === 0) {
        setResult({
          success: 0,
          failed: 0,
          errors: ["CSV dosyası boş!"],
          products: []
        });
        setImporting(false);
        return;
      }

      const headers = parseCSVLine(lines[0]);
      const errors: string[] = [];
      const productMap = new Map<string, Product>();
      let successCount = 0;
      let failedCount = 0;

      // Process each line
      for (let i = 1; i < lines.length; i++) {
        try {
          const cols = parseCSVLine(lines[i]);
          
          if (cols.length < headers.length) {
            errors.push(`Satır ${i + 1}: Eksik kolon`);
            failedCount++;
            continue;
          }

          // Parse fields
          const productName = cols[0]?.replace(/"/g, "") || "";
          const slug = cols[1] || "";
          const description = cols[2]?.replace(/"/g, "") || "";
          const shortDescription = cols[3]?.replace(/"/g, "") || "";
          const category = cols[4] || "";
          const subcategory = cols[5] || "";
          const variantName = cols[6]?.replace(/"/g, "") || "";
          const weight = parseInt(cols[7]) || 0;
          const price = parseFloat(cols[8]) || 0;
          const originalPrice = cols[9] ? parseFloat(cols[9]) : undefined;
          const stock = parseInt(cols[10]) || 0;
          const sku = cols[11] || "";
          const imageUrl1 = cols[12]?.replace(/"/g, "") || "";
          const imageUrl2 = cols[13]?.replace(/"/g, "") || "";
          const imageUrl3 = cols[14]?.replace(/"/g, "") || "";
          const calories = parseInt(cols[15]) || 0;
          const protein = parseFloat(cols[16]) || 0;
          const carbs = parseFloat(cols[17]) || 0;
          const fat = parseFloat(cols[18]) || 0;
          const fiber = parseFloat(cols[19]) || 0;
          const sugar = parseFloat(cols[20]) || 0;
          const vegan = parseBooleanField(cols[21]);
          const glutenFree = parseBooleanField(cols[22]);
          const sugarFree = parseBooleanField(cols[23]);
          const highProtein = parseBooleanField(cols[24]);
          const featured = parseBooleanField(cols[25]);
          const isNew = parseBooleanField(cols[26]);
          const tags = cols[27]?.replace(/"/g, "").split(",").map(t => t.trim()).filter(t => t) || [];

          // Validation
          if (!productName || !slug) {
            errors.push(`Satır ${i + 1}: Ürün adı ve slug zorunludur`);
            failedCount++;
            continue;
          }

          if (!category) {
            errors.push(`Satır ${i + 1}: Kategori zorunludur`);
            failedCount++;
            continue;
          }

          // Create variant
          const variant: ProductVariant = {
            id: `${slug}-${sku}`,
            name: variantName,
            weight,
            price,
            originalPrice,
            stock,
            sku
          };

          // Check if product already exists in map (for multiple variants)
          if (productMap.has(slug)) {
            const existingProduct = productMap.get(slug)!;
            existingProduct.variants.push(variant);
          } else {
            // Collect image URLs
            const images = [imageUrl1, imageUrl2, imageUrl3].filter(url => url && url.trim());
            
            // Create new product
            const product: Product = {
              id: slug,
              name: productName,
              slug,
              description,
              shortDescription,
              category: category as any,
              subcategory: subcategory as any,
              variants: [variant],
              images,
              tags,
              nutritionalInfo: calories > 0 ? {
                calories,
                protein,
                carbs,
                fat,
                fiber,
                sugar
              } : undefined,
              vegan,
              glutenFree,
              sugarFree,
              highProtein,
              rating: 5,
              reviewCount: 0,
              featured,
              new: isNew
            };

            productMap.set(slug, product);
          }

          successCount++;
        } catch (error) {
          errors.push(`Satır ${i + 1}: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`);
          failedCount++;
        }
      }

      // Add products to the system
      const products = Array.from(productMap.values());
      
      // Save to localStorage
      addStoredProducts(products);

      setResult({
        success: successCount,
        failed: failedCount,
        errors,
        products
      });
    } catch (error) {
      setResult({
        success: 0,
        failed: 0,
        errors: [`Dosya okunamadı: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`],
        products: []
      });
    }

    setImporting(false);
  };

  const downloadTemplate = () => {
    // Create CSV template with multiple variants example
    const template = `Ürün Adı,Slug,Açıklama,Kısa Açıklama,Kategori,Alt Kategori,Varyant Adı,Ağırlık (g),Fiyat (TL),İndirimli Fiyat (TL),Stok,SKU,Görsel URL 1,Görsel URL 2,Görsel URL 3,Kalori,Protein (g),Karbonhidrat (g),Yağ (g),Lif (g),Şeker (g),Vegan,Glutensiz,Şekersiz,Yüksek Protein,Öne Çıkan,Yeni,Etiketler
"Şekersiz Fıstık Ezmesi","sekersiz-fistik-ezmesi","Doğal ve katkısız fıstık ezmesi","Şekersiz fıstık ezmesi",fistik-ezmesi,sekersiz,"1 Adet - 450g",450,321,,50,EZM-FS-450-1,https://example.com/image1.jpg,https://example.com/image2.jpg,https://example.com/image3.jpg,580,25,16,46,8,0,Evet,Evet,Evet,Evet,Evet,Hayır,"doğal,sekersiz,vegan"
"Şekersiz Fıstık Ezmesi","sekersiz-fistik-ezmesi","Doğal ve katkısız fıstık ezmesi","Şekersiz fıstık ezmesi",fistik-ezmesi,sekersiz,"2 Adet - 900g",900,481.50,642,48,EZM-FS-450-2,https://example.com/image1.jpg,https://example.com/image2.jpg,https://example.com/image3.jpg,580,25,16,46,8,0,Evet,Evet,Evet,Evet,Evet,Hayır,"doğal,sekersiz,vegan"
"Şekersiz Fıstık Ezmesi","sekersiz-fistik-ezmesi","Doğal ve katkısız fıstık ezmesi","Şekersiz fıstık ezmesi",fistik-ezmesi,sekersiz,"3 Adet - 1350g",1350,597.04,963,45,EZM-FS-450-3,https://example.com/image1.jpg,https://example.com/image2.jpg,https://example.com/image3.jpg,580,25,16,46,8,0,Evet,Evet,Evet,Evet,Evet,Hayır,"doğal,sekersiz,vegan"
"Hurmalı Fıstık Ezmesi","hurmali-fistik-ezmesi","Hurma ile tatlandırılmış fıstık ezmesi","Hurmalı fıstık ezmesi",fistik-ezmesi,hurmalı,"1 Adet - 450g",450,341,,45,EZM-FH-450-1,https://example.com/image1.jpg,https://example.com/image2.jpg,,560,23,32,40,8,18,Evet,Evet,Hayır,Evet,Evet,Hayır,"doğal,hurmalı,vegan"`;

    const blob = new Blob(["\uFEFF" + template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "urun-sablonu.csv";
    link.click();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Toplu Ürün Yükleme
          </h1>
          <p className="text-gray-600">
            CSV dosyası ile toplu ürün yükleyin
          </p>
        </div>
        <Link
          href="/admin/urunler"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Geri Dön
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Toplu Yükleme Nasıl Yapılır?
                </h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Önce şablon dosyasını indirin</li>
                  <li>Excel veya Google Sheets ile açın</li>
                  <li>Ürün bilgilerini doldurun</li>
                  <li>CSV formatında kaydedin (UTF-8 encoding)</li>
                  <li>Dosyayı buradan yükleyin</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-primary" />
              </div>

              {!file ? (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    CSV Dosyası Yükle
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Dosyanızı sürükleyip bırakın veya seçin
                  </p>

                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer inline-block">
                      Dosya Seç
                    </span>
                  </label>

                  <p className="text-xs text-gray-500 mt-4">
                    Sadece CSV formatı desteklenir (Maks. 10MB)
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-lg mb-6">
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {importing ? "Yükleniyor..." : "İçe Aktar"}
                    </button>
                    <button
                      onClick={() => {
                        setFile(null);
                        setResult(null);
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                İçe Aktarma Sonuçları
              </h3>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-900">
                      {result.success}
                    </p>
                    <p className="text-sm text-green-700">Varyant Yüklendi</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900">
                      {result.products.length}
                    </p>
                    <p className="text-sm text-blue-700">Ürün Oluşturuldu</p>
                  </div>
                </div>
              </div>

              {result.failed > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold text-red-900">
                        {result.failed}
                      </p>
                      <p className="text-sm text-red-700">Başarısız</p>
                    </div>
                  </div>
                </div>
              )}

              {result.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Hatalar:</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-red-50 rounded-lg"
                      >
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.products.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Yüklenen Ürünler:</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {result.products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.variants.length} varyant</p>
                        </div>
                        <Link
                          href={`/urunler/${product.slug}`}
                          className="text-primary hover:underline text-sm"
                        >
                          Görüntüle
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Template Download */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Şablon Dosyası
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Örnek ürünlerle dolu şablon dosyasını indirin
            </p>
            <button
              onClick={downloadTemplate}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Şablonu İndir
            </button>
          </div>

          {/* Field Guide */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Alan Açıklamaları</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">Varyantlar</p>
                <p className="text-gray-600">
                  Aynı ürünün farklı boyutları için aynı slug kullanın
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Görsel URL'leri</p>
                <p className="text-gray-600">
                  3 adete kadar görsel URL'i ekleyebilirsiniz (Shopify'dan otomatik gelir)
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Kategori</p>
                <p className="text-gray-600">
                  fistik-ezmesi, findik-ezmesi, kuruyemis
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Alt Kategori</p>
                <p className="text-gray-600">
                  sekersiz, hurmalı, balli, klasik, sutlu-findik-kremasi,
                  kakaolu, cig, kavrulmus
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">İndirimli Fiyat</p>
                <p className="text-gray-600">
                  Paket indirimi için orijinal fiyatı yazın
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Evet/Hayır Alanları</p>
                <p className="text-gray-600">Evet veya Hayır yazın</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Etiketler</p>
                <p className="text-gray-600">
                  Virgülle ayırın: "doğal,vegan,glutensiz"
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-semibold text-yellow-900 mb-3">💡 İpuçları</h3>
            <ul className="text-sm text-yellow-800 space-y-2">
              <li>• Aynı ürünün varyantları için aynı slug kullanın</li>
              <li>• Türkçe karakterleri kullanabilirsiniz</li>
              <li>• Fiyatları nokta ile ayırın (321.50)</li>
              <li>• Slug'lar benzersiz olmalı</li>
              <li>• Paket indirimleri için "İndirimli Fiyat" doldurun</li>
              <li>• Shopify dönüştürücü görselleri otomatik ekler</li>
              <li>• Görsel URL'leri boş bırakabilirsiniz</li>
              <li>• Maksimum 1000 varyant yükleyebilirsiniz</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
