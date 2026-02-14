import ProductWizard from "@/components/admin/product-wizard/ProductWizard";

export const metadata = {
  title: "Yeni Ürün Ekle | Ezmeo Admin",
  description: "Yeni ürün ekleme sayfası",
};

export default function NewProductPage() {
  return <ProductWizard />;
}
