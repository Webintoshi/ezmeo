import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || "11244612690";

let analyticsClient: BetaAnalyticsDataClient | null = null;

function getAnalyticsClient() {
  if (analyticsClient) return analyticsClient;

  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    : undefined;

  if (!credentials) {
    console.warn("Google Service Account credentials not found. Using default authentication.");
  }

  analyticsClient = new BetaAnalyticsDataClient({
    credentials: credentials || undefined,
  });

  return analyticsClient;
}

export async function GET() {
  try {
    const client = getAnalyticsClient();

    const [realtimeReport] = await client.runRealtimeReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dimensions: [
        {
          name: "unifiedScreenName",
        },
        {
          name: "deviceCategory",
        },
      ],
      metrics: [
        {
          name: "activeUsers",
        },
      ],
    });

    const realtimeReport2 = await client.runRealtimeReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      metrics: [
        {
          name: "activeUsers",
        },
      ],
      dimensions: [
        {
          name: "deviceCategory",
        },
      ],
    });

    const totalUsers = realtimeReport2[0]?.rows?.reduce(
      (sum: number, row: any) => sum + Number(row.metricValues[0]?.value || 0),
      0
    ) || 0;

    const devices = {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    };

    realtimeReport2[0]?.rows?.forEach((row: any) => {
      const deviceType = row.dimensionValues[0]?.value?.toLowerCase() || "desktop";
      const count = Number(row.metricValues[0]?.value || 0);
      
      if (deviceType.includes("mobile") || deviceType === "mobile") {
        devices.mobile += count;
      } else if (deviceType.includes("tablet") || deviceType === "tablet") {
        devices.tablet += count;
      } else {
        devices.desktop += count;
      }
    });

    const pageGroups: Record<string, number> = {};
    realtimeReport[0]?.rows?.forEach((row: any) => {
      const pageUrl = row.dimensionValues[0]?.value || "/";
      const count = Number(row.metricValues[0]?.value || 0);
      pageGroups[pageUrl] = (pageGroups[pageUrl] || 0) + count;
    });

    const topPages = Object.entries(pageGroups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([url, count]) => ({ url, count }));

    return NextResponse.json({
      success: true,
      data: {
        liveVisitors: totalUsers,
        devices,
        topPages,
      },
    });
  } catch (error) {
    console.error("GA4 API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch GA4 data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
