import { Product, ProductVariant } from "@/types/product";

export async function importProductsFromCSV(): Promise<Product[]> {
  try {
    const response = await fetch('/products_export_1.csv');
    const text = await response.text();
    
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = parseCSVLine(lines[0]);
    
    // Find column indices
    const handleIdx = headers.findIndex(h => h.toLowerCase() === 'handle');
    const titleIdx = headers.findIndex(h => h.toLowerCase() === 'title');
    const bodyIdx = headers.findIndex(h => h.toLowerCase().includes('body'));
    const typeIdx = headers.findIndex(h => h.toLowerCase() === 'type');
    const tagsIdx = headers.findIndex(h => h.toLowerCase() === 'tags');
    const imageSrcIdx = headers.findIndex(h => h.toLowerCase().includes('image src'));
    const imagePositionIdx = headers.findIndex(h => h.toLowerCase().includes('image position'));
    const option1ValueIdx = headers.findIndex(h => h.toLowerCase().includes('option1 value'));
    const variantPriceIdx = headers.findIndex(h => h.toLowerCase().includes('variant price'));
    const variantCompareIdx = headers.findIndex(h => h.toLowerCase().includes('variant compare'));
    const variantSKUIdx = headers.findIndex(h => h.toLowerCase().includes('variant sku'));
    const variantGramsIdx = headers.findIndex(h => h.toLowerCase().includes('variant grams'));
    
    const productMap = new Map<string, any>();
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const cols = parseCSVLine(lines[i]);
      const handle = cols[handleIdx] || '';
      
      if (!handle) continue;
      
      if (!productMap.has(handle)) {
        const title = cols[titleIdx] || '';
        const body = cols[bodyIdx] || '';
        const type = cols[typeIdx] || '';
        const tags = cols[tagsIdx] || '';
        const imageSrc = cols[imageSrcIdx] || '';
        
        // Map category
        let category: any = 'fistik-ezmesi';
        const typeLower = type.toLowerCase();
        if (typeLower.includes('fındık') || typeLower.includes('findik') || typeLower.includes('hazelnut')) {
          category = 'findik-ezmesi';
        } else if (typeLower.includes('kuruyemiş') || typeLower.includes('kuruyemis') || typeLower.includes('nut')) {
          category = 'kuruyemis';
        }
        
        // Map subcategory
        let subcategory: any = 'klasik';
        const tagsLower = tags.toLowerCase();
        if (tagsLower.includes('şekersiz') || tagsLower.includes('sekersiz')) {
          subcategory = 'sekersiz';
        } else if (tagsLower.includes('hurmalı') || tagsLower.includes('hurmali')) {
          subcategory = 'hurmali';
        } else if (tagsLower.includes('ballı') || tagsLower.includes('balli')) {
          subcategory = 'balli';
        } else if (tagsLower.includes('sütlü') || tagsLower.includes('sutlu')) {
          subcategory = 'sutlu-findik-kremasi';
        } else if (tagsLower.includes('kakaolu')) {
          subcategory = 'kakaolu';
        } else if (tagsLower.includes('çiğ') || tagsLower.includes('cig')) {
          subcategory = 'cig';
        } else if (tagsLower.includes('kavrulmuş') || tagsLower.includes('kavrulmus')) {
          subcategory = 'kavrulmus';
        }
        
        productMap.set(handle, {
          id: handle,
          name: title,
          slug: handle,
          description: body.replace(/<[^>]*>/g, ''),
          shortDescription: body.replace(/<[^>]*>/g, '').substring(0, 150),
          category,
          subcategory,
          images: imageSrc ? [imageSrc] : [],
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          vegan: tagsLower.includes('vegan'),
          glutenFree: tagsLower.includes('gluten'),
          sugarFree: tagsLower.includes('şekersiz') || tagsLower.includes('sekersiz'),
          highProtein: tagsLower.includes('protein'),
          rating: 5,
          reviewCount: 0,
          featured: false,
          new: false,
          variants: []
        });
      } else {
        // Add additional images
        const imageSrc = cols[imageSrcIdx] || '';
        const imagePosition = cols[imagePositionIdx] || '';
        
        if (imageSrc && imagePosition) {
          const product = productMap.get(handle)!;
          if (!product.images.includes(imageSrc)) {
            product.images.push(imageSrc);
          }
        }
      }
      
      // Add variant
      const product = productMap.get(handle);
      const option1Value = cols[option1ValueIdx] || '';
      const price = parseFloat(cols[variantPriceIdx]) || 0;
      const comparePrice = cols[variantCompareIdx] ? parseFloat(cols[variantCompareIdx]) : undefined;
      const sku = cols[variantSKUIdx] || '';
      const grams = parseInt(cols[variantGramsIdx]) || 0;
      
      if (option1Value && price > 0) {
        const variant: ProductVariant = {
          id: `${handle}-${sku}`,
          name: option1Value,
          weight: grams,
          price,
          originalPrice: comparePrice,
          stock: 50, // Default stock
          sku
        };
        
        product.variants.push(variant);
      }
    }
    
    return Array.from(productMap.values());
  } catch (error) {
    console.error('Error importing products:', error);
    return [];
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
