import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";
import sharp from "sharp";

export const dynamic = 'force-dynamic';

const MAX_DIMENSIONS = {
    products: { width: 2048, height: 2048 },
    categories: { width: 1200, height: 1200 },
    banners: { width: 1920, height: 1080 },
    default: { width: 1920, height: 1920 }
};

const THUMBNAIL_SIZES = {
    products: { width: 400, height: 400 },
    categories: { width: 300, height: 300 },
    banners: { width: 640, height: 360 },
    default: { width: 300, height: 300 }
};

interface ProcessedImage {
    buffer: Buffer;
    format: 'avif' | 'webp';
    width: number;
    height: number;
    originalSize: number;
    processedSize: number;
}

async function optimizeImage(
    inputBuffer: Buffer,
    folder: string,
    targetFormat?: 'avif' | 'webp'
): Promise<ProcessedImage> {
    const dimensions = MAX_DIMENSIONS[folder as keyof typeof MAX_DIMENSIONS] || MAX_DIMENSIONS.default;
    
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();
    
    const originalSize = inputBuffer.length;
    
    let processedImage = image
        .resize(dimensions.width, dimensions.height, {
            fit: "inside",
            withoutEnlargement: true
        })
        .rotate()
        .grayscale(false)
        .withMetadata({
            orientation: undefined
        });

    if (targetFormat === 'avif') {
        processedImage = processedImage.avif({
            quality: 80,
            chromaSubsampling: '4:4:4',
            effort: 6
        });
    } else {
        processedImage = processedImage.webp({
            quality: 85,
            effort: 6,
            chromaSubsampling: '4:4:4'
        });
    }

    const outputBuffer = await processedImage.toBuffer();
    const outputMetadata = await sharp(outputBuffer).metadata();
    
    return {
        buffer: outputBuffer,
        format: targetFormat || 'webp',
        width: outputMetadata.width || metadata.width || 0,
        height: outputMetadata.height || metadata.height || 0,
        originalSize,
        processedSize: outputBuffer.length
    };
}

async function generateThumbnail(
    inputBuffer: Buffer,
    folder: string,
    format: 'avif' | 'webp'
): Promise<Buffer> {
    const sizes = THUMBNAIL_SIZES[folder as keyof typeof THUMBNAIL_SIZES] || THUMBNAIL_SIZES.default;
    
    let thumbnail = sharp(inputBuffer)
        .resize(sizes.width, sizes.height, {
            fit: "cover",
            position: "center"
        })
        .rotate()
        .withMetadata({
            orientation: undefined
        });

    if (format === 'avif') {
        thumbnail = thumbnail.avif({ quality: 75 });
    } else {
        thumbnail = thumbnail.webp({ quality: 80 });
    }

    return await thumbnail.toBuffer();
}

function getFileName(name: string, format: string): string {
    const baseName = name.replace(/\.[^/.]+$/, "");
    return `${baseName}.${format}`;
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "products";
        const generateThumb = formData.get("thumbnail") !== "false";
        const preferredFormat = (formData.get("format") as 'avif' | 'webp' | 'auto') || 'auto';

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file provided" },
                { status: 400 }
            );
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: "Invalid file type. Allowed: JPEG, PNG, WebP, AVIF, GIF" },
                { status: 400 }
            );
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: "File too large. Maximum size: 10MB" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const inputBuffer = Buffer.from(bytes);

        const targetFormat: 'avif' | 'webp' = preferredFormat === 'auto' ? 'avif' : preferredFormat;

        const processed = await optimizeImage(inputBuffer, folder, targetFormat);

        const fileName = getFileName(file.name, processed.format);
        
        const result = await uploadToR2(
            processed.buffer,
            fileName,
            `image/${processed.format}`,
            folder
        );

        const response: Record<string, unknown> = {
            success: true,
            url: result.url,
            key: result.key,
            format: processed.format,
            width: processed.width,
            height: processed.height,
            originalSize: processed.originalSize,
            processedSize: processed.processedSize,
            savings: Math.round((1 - processed.processedSize / processed.originalSize) * 100)
        };

        if (generateThumb) {
            try {
                const thumbnailBuffer = await generateThumbnail(inputBuffer, folder, processed.format);
                const thumbFileName = fileName.replace(`.${processed.format}`, `_thumb.${processed.format}`);
                
                const thumbResult = await uploadToR2(
                    thumbnailBuffer,
                    thumbFileName,
                    `image/${processed.format}`,
                    folder
                );

                response.thumbnail = {
                    url: thumbResult.url,
                    key: thumbResult.key
                };
            } catch (thumbError) {
                console.error("Thumbnail generation failed:", thumbError);
            }
        }

        if (result.success) {
            return NextResponse.json(response);
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Upload API error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
