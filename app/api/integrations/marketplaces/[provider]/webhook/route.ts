import { NextRequest, NextResponse } from "next/server";
import { recordMarketplaceWebhook } from "@/lib/db/marketplaces";
import { enforceMarketplaceRateLimit, getMarketplaceProviderOrResponse } from "@/app/api/admin/marketplace-integrations/_shared";

interface Params {
  params: Promise<{ provider: string }>;
}

function extractHeaders(request: NextRequest) {
  const headers: Record<string, string> = {};
  for (const [key, value] of request.headers.entries()) {
    headers[key] = value;
  }
  return headers;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const rateLimitResponse = enforceMarketplaceRateLimit(request, "webhook", 120, 60_000);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { provider } = await params;
    const parsedProvider = getMarketplaceProviderOrResponse(provider);
    if (parsedProvider instanceof NextResponse) {
      return parsedProvider;
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const result = await recordMarketplaceWebhook(parsedProvider, payload, extractHeaders(request));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Marketplace webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Webhook islenemedi.",
      },
      { status: 500 },
    );
  }
}
