import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || "11244612690";

let analyticsClient: BetaAnalyticsDataClient | null = null;

function getAnalyticsClient() {
  if (analyticsClient) return analyticsClient;

  const credentialsStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  
  if (!credentialsStr) {
    console.error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON environment variable is missing");
  }

  try {
    let credentials;
    
    if (credentialsStr.startsWith("{")) {
      credentials = JSON.parse(credentialsStr);
    } else {
      credentials = {
        type: "service_account",
        project_id: process.env.GA4_PROJECT_ID || "igneous-stone-487614-e1",
        private_key: credentialsStr,
        client_email: process.env.GA4_CLIENT_EMAIL || "ga4-api@igneous-stone-487614-e1.iam.gserviceaccount.com",
      };
    }
    
    console.log("Creating GA4 client with credentials...");
    analyticsClient = new BetaAnalyticsDataClient({
      credentials,
    });
  } catch (parseError) {
    console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", parseError);
    throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON format");
  }

  return analyticsClient;
}

export async function GET() {
  try {
    console.log("Starting GA4 API request, Property ID:", GA4_PROPERTY_ID);
    
    const client = getAnalyticsClient();
    console.log("GA4 client created successfully");

    const [realtimeReport] = await client.runRealtimeReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dimensions: [
        {
          name: "unifiedScreenName",
        },
      ],
      metrics: [
        {
          name: "activeUsers",
        },
      ],
    });

    const [deviceReport] = await client.runRealtimeReport({
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

    const totalUsers = deviceReport.rows?.reduce(
      (sum: number, row: any) => sum + Number(row.metricValues[0]?.value || 0),
      0
    ) || 0;

    const devices = {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    };

    deviceReport.rows?.forEach((row: any) => {
      const deviceType = row.dimensionValues[0]?.value?.toLowerCase() || "desktop";
      const count = Number(row.metricValues[0]?.value || 0);
      
      if (deviceType.includes("mobile")) {
        devices.mobile += count;
      } else if (deviceType.includes("tablet")) {
        devices.tablet += count;
      } else {
        devices.desktop += count;
      }
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

    console.log("GA4 API success, visitors:", totalUsers);

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
        error: error instanceof Error ? error.message : "Failed to fetch GA4 data",
      },
      { status: 500 }
    );
  }
}
