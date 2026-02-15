import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";
import sharp from "sharp";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "products";

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file provided" },
                { status: 400 }
            );
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
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

        const maxDimensions = {
            products: { width: 2048, height: 2048 },
            categories: { width: 1200, height: 1200 },
            banners: { width: 1920, height: 1080 },
            default: { width: 1920, height: 1920 }
        };

        const dimensions = maxDimensions[folder as keyof typeof maxDimensions] || maxDimensions.default;

        let processedImage = sharp(inputBuffer)
            .resize(dimensions.width, dimensions.height, {
                fit: "inside",
                withoutEnlargement: true
            })
            .webp({ quality: 85 });

        const metadata = await processedImage.metadata();
        
        if (metadata.width && metadata.height) {
            const aspectRatio = metadata.width / metadata.height;
            
            if (aspectRatio > 1) {
                processedImage = processedImage.resize(dimensions.width, null, {
                    fit: "inside",
                    withoutEnlargement: true
                });
            } else {
                processedImage = processedImage.resize(null, dimensions.height, {
                    fit: "inside",
                    withoutEnlargement: true
                });
            }
        }

        const outputBuffer = await processedImage.toBuffer();

        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        const webpFileName = `${fileNameWithoutExt}.webp`;

        const result = await uploadToR2(outputBuffer, webpFileName, "image/webp", folder);

        if (result.success) {
            return NextResponse.json({
                success: true,
                url: result.url,
                key: result.key,
            });
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
