import { use } from "react";
import { getProductById, getProductBySlug } from "@/lib/products";
import ProductForm from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const resolvedParams = use(params);

  // Try to find by ID first, then by slug
  let product = getProductById(resolvedParams.id);

  if (!product) {
    product = getProductBySlug(resolvedParams.id);
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ürün Bulunamadı</h1>
          <p className="text-gray-600 mb-8">Bu ID veya slug ile bir ürün bulunamadı.</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return <ProductForm productId={product.id} />;
}
