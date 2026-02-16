import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || "11244612690";

let analyticsClient: BetaAnalyticsDataClient | null = null;

function getAnalyticsClient() {
  if (analyticsClient) return analyticsClient;

  const projectId = process.env.GA4_PROJECT_ID || process.env.GOOGLE_PROJECT_ID;
  const clientEmail = process.env.GA4_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GA4_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;
  const jsonCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  let credentials: any;

  if (jsonCredentials) {
    try {
      credentials = JSON.parse(jsonCredentials);
      console.log("Using JSON credentials, project:", credentials.project_id);
    } catch (e) {
      console.error("Failed to parse JSON credentials");
    }
  } else if (projectId && clientEmail && privateKey) {
    credentials = {
      type: "service_account",
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    };
    console.log("Using separate env vars, project:", projectId);
  } else {
    console.error("No GA4 credentials provided");
    throw new Error("GA4 credentials not configured");
  }

  analyticsClient = new BetaAnalyticsDataClient({ credentials });
  return analyticsClient;
}

export async function GET() {
  try {
    const client = getAnalyticsClient();

    const [realtimeReport] = await client.runRealtimeReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dimensions: [{ name: "unifiedScreenName" }],
      metrics: [{ name: "activeUsers" }],
    });

    const [deviceReport] = await client.runRealtimeReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      metrics: [{ name: "activeUsers" }],
      dimensions: [{ name: "deviceCategory" }],
    });

    const totalUsers = deviceReport.rows?.reduce(
      (sum: number, row: any) => sum + Number(row.metricValues[0]?.value || 0),
      0
    ) || 0;

    const devices = { mobile: 0, desktop: 0, tablet: 0 };
    deviceReport.rows?.forEach((row: any) => {
      const deviceType = row.dimensionValues[0]?.value?.toLowerCase() || "desktop";
      const count = Number(row.metricValues[0]?.value || 0);
      if (deviceType.includes("mobile")) devices.mobile += count;
      else if (deviceType.includes("tablet")) devices.tablet += count;
      else devices.desktop += count;
    });

    const pageGroups: Record<string, number> = {};
    realtimeReport.rows?.forEach((row: any) => {
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
      data: { liveVisitors: totalUsers, devices, topPages },
    });
  } catch (error) {
    console.error("GA4 API Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch GA4 data" },
      { status: 500 }
    );
  }
}
