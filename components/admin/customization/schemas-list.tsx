"use client";

// =====================================================
// CUSTOMIZATION SCHEMAS LIST COMPONENT
// =====================================================

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CustomizationSchema,
  CustomizationStep 
} from "@/types/product-customization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Layers,
  Package,
  GripVertical,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface SchemaWithCounts extends CustomizationSchema {
  step_count: number;
  product_count: number;
}

interface CustomizationSchemasListProps {
  schemas: SchemaWithCounts[];
}

export function CustomizationSchemasList({ schemas }: CustomizationSchemasListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteSchema, setDeleteSchema] = useState<SchemaWithCounts | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localSchemas, setLocalSchemas] = useState<SchemaWithCounts[]>(schemas);

  // Filter schemas
  const filteredSchemas = localSchemas.filter((schema) =>
    schema.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schema.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schema.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle schema active status
  const handleToggleActive = async (schema: SchemaWithCounts) => {
    try {
      const { error } = await supabase
        .from("product_customization_schemas")
        .update({ is_active: !schema.is_active })
        .eq("id", schema.id);

      if (error) throw error;

      setLocalSchemas((prev) =>
        prev.map((s) =>
          s.id === schema.id ? { ...s, is_active: !s.is_active } : s
        )
      );

      toast.success(
        schema.is_active ? "Şema devre dışı bırakıldı" : "Şema aktifleştirildi"
      );
    } catch (error) {
      console.error("Error toggling schema:", error);
      toast.error("İşlem sırasında bir hata oluştu");
    }
  };

  // Duplicate schema
  const handleDuplicate = async (schema: SchemaWithCounts) => {
    try {
      // 1. Get full schema with steps and options
      const { data: fullSchema, error: schemaError } = await supabase
        .from("product_customization_schemas")
        .select(`
          *,
          steps:product_customization_steps(
            *,
            options:product_customization_options(*)
          )
        `)
        .eq("id", schema.id)
        .single();

      if (schemaError) throw schemaError;

      // 2. Create new schema
      const { data: newSchema, error: createError } = await supabase
        .from("product_customization_schemas")
        .insert({
          name: `${schema.name} (Kopya)`,
          slug: `${schema.slug}-kopya-${Date.now()}`,
          description: schema.description,
          settings: schema.settings,
          is_active: false,
        })
        .select()
        .single();

      if (createError) throw createError;

      // 3. Create steps and options
      for (const step of fullSchema.steps || []) {
        const { data: newStep, error: stepError } = await supabase
          .from("product_customization_steps")
          .insert({
            schema_id: newSchema.id,
            type: step.type,
            key: step.key,
            label: step.label,
            placeholder: step.placeholder,
            help_text: step.help_text,
            is_required: step.is_required,
            validation_rules: step.validation_rules,
            grid_width: step.grid_width,
            style_config: step.style_config,
            show_conditions: step.show_conditions,
            price_config: step.price_config,
            default_value: step.default_value,
            sort_order: step.sort_order,
          })
          .select()
          .single();

        if (stepError) throw stepError;

        // Create options for this step
        if (step.options && step.options.length > 0) {
          const { error: optionsError } = await supabase
            .from("product_customization_options")
            .insert(
              step.options.map((option: any) => ({
                step_id: newStep.id,
                label: option.label,
                value: option.value,
                description: option.description,
                image_url: option.image_url,
                icon: option.icon,
                color: option.color,
                price_adjustment: option.price_adjustment,
                price_adjustment_type: option.price_adjustment_type,
                stock_quantity: option.stock_quantity,
                track_stock: option.track_stock,
                show_conditions: option.show_conditions,
                sort_order: option.sort_order,
                is_default: option.is_default,
                is_disabled: option.is_disabled,
              }))
            );

          if (optionsError) throw optionsError;
        }
      }

      toast.success("Şema başarıyla kopyalandı");
      router.refresh();
    } catch (error) {
      console.error("Error duplicating schema:", error);
      toast.error("Kopyalama sırasında bir hata oluştu");
    }
  };

  // Delete schema
  const handleDelete = async () => {
    if (!deleteSchema) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("product_customization_schemas")
        .delete()
        .eq("id", deleteSchema.id);

      if (error) throw error;

      setLocalSchemas((prev) => prev.filter((s) => s.id !== deleteSchema.id));
      toast.success("Şema başarıyla silindi");
    } catch (error) {
      console.error("Error deleting schema:", error);
      toast.error("Silme sırasında bir hata oluştu");
    } finally {
      setIsDeleting(false);
      setDeleteSchema(null);
    }
  };

  if (localSchemas.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Layers className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Henüz şema oluşturulmadı
          </h3>
          <p className="text-gray-600 text-center max-w-md mb-6">
            Ürünlere kişiselleştirme seçenekleri eklemek için ilk şemanızı oluşturun.
            Örneğin: Telefon modeli seçimi, lazer kazıma, paket seçimi gibi.
          </p>
          <Link href="/admin/urunler/ekstra/yeni">
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              İlk Şemayı Oluştur
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Şema ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Schemas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchemas.map((schema) => (
          <Card
            key={schema.id}
            className={`group hover:shadow-md transition-shadow ${
              !schema.is_active ? "opacity-75" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold truncate">
                    {schema.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    /{schema.slug}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link href={`/admin/urunler/ekstra/${schema.id}`}>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Düzenle
                      </DropdownMenuItem>
                    </Link>
                    <Link href={`/admin/urunler/ekstra/${schema.id}/onizleme`}>
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Önizleme
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => handleDuplicate(schema)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Kopyala
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteSchema(schema)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {schema.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {schema.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Layers className="w-4 h-4" />
                  <span>{schema.step_count} Adım</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>{schema.product_count} Ürün</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={schema.is_active}
                    onCheckedChange={() => handleToggleActive(schema)}
                  />
                  <span className="text-sm text-gray-600">
                    {schema.is_active ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <Link href={`/admin/urunler/ekstra/${schema.id}`}>
                  <Button variant="outline" size="sm">
                    Düzenle
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteSchema} onOpenChange={() => setDeleteSchema(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Şemayı silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteSchema?.name}</strong> şeması kalıcı olarak silinecektir.
              Bu işlem geri alınamaz. Bu şemaya bağlı ürünler varsa, onların
              kişiselleştirme seçenekleri kaldırılacaktır.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Siliniyor..." : "Evet, Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Import Plus icon
import { Plus } from "lucide-react";
