import ProductWizard from "@/components/admin/product-wizard/ProductWizard";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: EditProductPageProps) {
  const { id } = await params;
  return {
    title: "Ürün Düzenle | Ezmeo Admin",
    description: "Ürün düzenleme sayfası",
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  
  return <ProductWizard productId={id} />;
}
