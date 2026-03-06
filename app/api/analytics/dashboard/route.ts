import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getOrSetCachedValue } from "@/lib/cache/memory-cache";
import { fetchPlausibleAggregate } from "@/lib/analytics/plausible";

function getDateRange(timeRange: string): { startDate: string; endDate: string } {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    let startDate: string;

    switch (timeRange) {
        case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
            break;
        case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
        case "month":
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            break;
        case "year":
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
            break;
        default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    return { startDate, endDate };
}

function getPreviousDateRange(timeRange: string): { startDate: string; endDate: string } {
    const { startDate, endDate } = getDateRange(timeRange);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - daysDiff * 24 * 60 * 60 * 1000);
    
    return {
        startDate: previousStart.toISOString(),
        endDate: previousEnd.toISOString()
    };
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const timeRange = searchParams.get('timeRange') || 'week';
        const cacheKey = `analytics:dashboard:${timeRange}`;

        const payload = await getOrSetCachedValue(cacheKey, 60_000, async () => {
            const supabase = createServerClient();
            const { startDate, endDate } = getDateRange(timeRange);
            const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousDateRange(timeRange);

            const [{ data: currentOrders }, { data: previousOrders }] = await Promise.all([
                supabase
                    .from('orders')
                    .select('id, total, created_at')
                    .gte('created_at', startDate)
                    .lt('created_at', endDate)
                    .in('status', ['completed', 'shipped', 'delivered'])
                    .order('created_at', { ascending: true }),
                supabase
                    .from('orders')
                    .select('id, total')
                    .gte('created_at', prevStartDate)
                    .lt('created_at', prevEndDate)
                    .in('status', ['completed', 'shipped', 'delivered']),
            ]);

            const [{ count: totalCustomers }, { count: newCustomers }] = await Promise.all([
                supabase.from('customers').select('*', { count: 'exact', head: true }),
                supabase
                    .from('customers')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', startDate)
                    .lt('created_at', endDate),
            ]);

            const [currentTraffic, previousTraffic] = await Promise.all([
                fetchTrafficPageViews(supabase, startDate, endDate),
                fetchTrafficPageViews(supabase, prevStartDate, prevEndDate),
            ]);

            const currentRevenue = currentOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
            const currentOrdersCount = currentOrders?.length || 0;
            const previousRevenue = previousOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
            const previousOrdersCount = previousOrders?.length || 0;

            const avgOrderValue = currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0;
            const conversionRate = currentTraffic > 0 ? (currentOrdersCount / currentTraffic) * 100 : 0;
            const prevConversionRate = previousTraffic > 0 ? (previousOrdersCount / previousTraffic) * 100 : 0;

            const trendMap = new Map<string, { revenue: number; orders: number }>();
            currentOrders?.forEach(order => {
                const dateKey = new Date(order.created_at).toISOString().split('T')[0];
                const prev = trendMap.get(dateKey) || { revenue: 0, orders: 0 };
                trendMap.set(dateKey, {
                    revenue: prev.revenue + (order.total || 0),
                    orders: prev.orders + 1,
                });
            });

            const trendData = Array.from(trendMap.entries()).map(([date, data]) => ({
                date: new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
                revenue: data.revenue,
                orders: data.orders,
            }));

            const abandonedCartStats = await getAbandonedCartStats(supabase, startDate, endDate);

            return {
                stats: {
                    revenue: currentRevenue,
                    orders: currentOrdersCount,
                    customers: totalCustomers || 0,
                    conversionRate: Math.round(conversionRate * 100) / 100,
                    avgOrderValue: Math.round(avgOrderValue),
                    revenueChange: calculateChange(currentRevenue, previousRevenue),
                    ordersChange: calculateChange(currentOrdersCount, previousOrdersCount),
                    customersChange: newCustomers || 0,
                    conversionChange: calculateChange(conversionRate, prevConversionRate),
                },
                trendData,
                abandonedCartStats,
            };
        });

        return NextResponse.json(payload);
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
}

function calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

async function fetchTrafficPageViews(
    supabase: ReturnType<typeof createServerClient>,
    startDate: string,
    endDate: string
): Promise<number> {
    const plausible = await fetchPlausibleAggregate({ startDate, endDate });
    if (plausible) return plausible.pageviews;

    try {
        const { count } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDate)
            .lt('created_at', endDate);
        return Number(count || 0);
    } catch {
        return 0;
    }
}

async function getAbandonedCartStats(
    supabase: ReturnType<typeof createServerClient>,
    startDate: string,
    endDate: string
) {
    try {
        const { data: abandonedCarts } = await supabase
            .from('abandoned_carts')
            .select('total,recovered')
            .gte('created_at', startDate)
            .lt('created_at', endDate);

        const carts = abandonedCarts || [];
        const totalAbandonedValue = carts.reduce((sum, cart) => sum + Number(cart.total || 0), 0);
        const recoveredCarts = carts.filter(cart => cart.recovered).length;
        const totalCarts = carts.length;
        const recoveryRate = totalCarts > 0 ? (recoveredCarts / totalCarts) * 100 : 0;

        return {
            totalValue: totalAbandonedValue,
            recoveryRate: Math.round(recoveryRate * 10) / 10,
            recoveredCount: recoveredCarts,
            totalCount: totalCarts,
        };
    } catch {
        return { totalValue: 0, recoveryRate: 0, recoveredCount: 0, totalCount: 0 };
    }
}
