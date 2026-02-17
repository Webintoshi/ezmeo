import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

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
        const supabase = createServerClient();
        const searchParams = request.nextUrl.searchParams;
        const timeRange = searchParams.get('timeRange') || 'week';

        const { startDate, endDate } = getDateRange(timeRange);
        const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousDateRange(timeRange);

        // Get current period orders
        const { data: currentOrders, error: ordersError } = await supabase
            .from('orders')
            .select('id, total, created_at, status')
            .gte('created_at', startDate)
            .lt('created_at', endDate)
            .in('status', ['completed', 'shipped', 'delivered']);

        if (ordersError) {
            console.error('Orders fetch error:', ordersError);
        }

        // Get previous period orders for comparison
        const { data: previousOrders } = await supabase
            .from('orders')
            .select('id, total, created_at, status')
            .gte('created_at', prevStartDate)
            .lt('created_at', prevEndDate)
            .in('status', ['completed', 'shipped', 'delivered']);

        // Get total customers
        const { count: totalCustomers } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true });

        // Get new customers in period
        const { count: newCustomers } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDate)
            .lt('created_at', endDate);

        // Get page views for conversion calculation
        const { count: pageViews } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDate)
            .lt('created_at', endDate);

        const prevPageViews = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', prevStartDate)
            .lt('created_at', prevEndDate);

        // Calculate KPIs
        const currentRevenue = currentOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
        const currentOrdersCount = currentOrders?.length || 0;
        const previousRevenue = previousOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
        const previousOrdersCount = previousOrders?.length || 0;

        const avgOrderValue = currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0;
        const conversionRate = pageViews && pageViews > 0 ? (currentOrdersCount / pageViews) * 100 : 0;
        const prevConversionRate = prevPageViews.count && prevPageViews.count > 0 ? (previousOrdersCount / prevPageViews.count) * 100 : 0;

        // Calculate changes
        const calculateChange = (current: number, previous: number): number => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        // Get trend data - group orders by date
        const { data: allOrders } = await supabase
            .from('orders')
            .select('id, total, created_at, status')
            .gte('created_at', startDate)
            .lt('created_at', endDate)
            .in('status', ['completed', 'shipped', 'delivered'])
            .order('created_at', { ascending: true });

        const trendMap = new Map<string, { revenue: number; orders: number }>();
        
        allOrders?.forEach(order => {
            const date = new Date(order.created_at).toISOString().split('T')[0];
            const existing = trendMap.get(date) || { revenue: 0, orders: 0 };
            trendMap.set(date, {
                revenue: existing.revenue + (order.total || 0),
                orders: existing.orders + 1
            });
        });

        const trendData = Array.from(trendMap.entries()).map(([date, data]) => ({
            date: new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
            revenue: data.revenue,
            orders: data.orders
        }));

        // Get abandoned cart stats
        let abandonedCartStats = { totalValue: 0, recoveryRate: 0, recoveredCount: 0, totalCount: 0 };
        try {
            const { data: abandonedCarts } = await supabase
                .from('abandoned_carts')
                .select('*')
                .gte('created_at', startDate)
                .lt('created_at', endDate);

            if (abandonedCarts) {
                const totalAbandonedValue = abandonedCarts.reduce((sum, cart) => sum + (cart.total || 0), 0);
                const recoveredCarts = abandonedCarts.filter(cart => cart.recovered).length;
                const totalCarts = abandonedCarts.length;
                const recoveryRate = totalCarts > 0 ? (recoveredCarts / totalCarts) * 100 : 0;
                
                abandonedCartStats = {
                    totalValue: totalAbandonedValue,
                    recoveryRate: Math.round(recoveryRate * 10) / 10,
                    recoveredCount: recoveredCarts,
                    totalCount: totalCarts
                };
            }
        } catch (abandonedError) {
            console.log('Abandoned carts table not available');
        }

        return NextResponse.json({
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
            abandonedCartStats
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
}
