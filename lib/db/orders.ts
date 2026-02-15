import { createServerClient } from "@/lib/supabase";
import { getOrCreateCustomer } from "./customers";

// =====================================================
// ORDER MUTATIONS (Server-side only - all order operations require admin)
// =====================================================

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `EZM-${timestamp}-${random}`;
}

/**
 * Create a new order
 */
export async function createOrder(orderData: {
    customerId?: string;
    items: {
        productId: string;
        variantId: string;
        productName: string;
        variantName: string;
        price: number;
        quantity: number;
        category?: string;
    }[];
    shippingAddress: Record<string, unknown>;
    billingAddress?: Record<string, unknown>;
    paymentMethod: string;
    shippingCost?: number;
    discount?: number;
    notes?: string;
    contactEmail?: string;
    saveAddress?: boolean;
}) {
    const serverClient = createServerClient();

    // Calculate totals
    const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = orderData.shippingCost || 0;
    const discount = orderData.discount || 0;
    const total = subtotal + shippingCost - discount;

    // Get or create customer if email provided
    let customerId = orderData.customerId;
    if (!customerId && orderData.contactEmail) {
        const shipping = orderData.shippingAddress as any;
        const customer = await getOrCreateCustomer({
            email: orderData.contactEmail,
            phone: shipping?.phone,
            firstName: shipping?.firstName,
            lastName: shipping?.lastName,
        });
        customerId = customer.id;
    }

    // Create order
    const { data: order, error: orderError } = await serverClient
        .from("orders")
        .insert({
            order_number: generateOrderNumber(),
            customer_id: customerId || null,
            status: "pending",
            subtotal,
            shipping_cost: shippingCost,
            discount,
            total,
            shipping_address: orderData.shippingAddress,
            billing_address: orderData.billingAddress || orderData.shippingAddress,
            payment_method: orderData.paymentMethod,
            payment_status: "pending",
            notes: orderData.notes || null,
        })
        .select()
        .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.productName,
        variant_name: item.variantName,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
    }));

    const { error: itemsError } = await serverClient
        .from("order_items")
        .insert(orderItems);

    if (itemsError) throw itemsError;

    // Save address to customer_addresses
    if (customerId && orderData.saveAddress !== false) {
        const shipping = orderData.shippingAddress as any;
        
        // Check if address already exists
        const { data: existingAddresses } = await serverClient
            .from("customer_addresses")
            .select("*")
            .eq("customer_id", customerId)
            .limit(1);

        const isFirstAddress = !existingAddresses || existingAddresses.length === 0;

        // Insert new address
        await serverClient
            .from("customer_addresses")
            .insert({
                customer_id: customerId,
                title: "Varsayılan Adres",
                first_name: shipping.firstName || "",
                last_name: shipping.lastName || "",
                phone: shipping.phone || "",
                address: shipping.address || "",
                city: shipping.city || "",
                district: shipping.district || "",
                postal_code: shipping.postalCode || "",
                is_default: isFirstAddress,
            });
    }

    // Track customer preferred products
    if (customerId) {
        for (const item of orderData.items) {
            // Check if product already in preferences
            const { data: existingPref } = await serverClient
                .from("customer_preferred_products")
                .select("*")
                .eq("customer_id", customerId)
                .eq("product_id", item.productId)
                .eq("variant_id", item.variantId)
                .single();

            if (existingPref) {
                // Update existing preference
                await serverClient
                    .from("customer_preferred_products")
                    .update({
                        purchase_count: existingPref.purchase_count + 1,
                        total_quantity: existingPref.total_quantity + item.quantity,
                        total_spent: existingPref.total_spent + (item.price * item.quantity),
                        last_purchased_at: new Date().toISOString(),
                    })
                    .eq("id", existingPref.id);
            } else {
                // Insert new preference
                await serverClient
                    .from("customer_preferred_products")
                    .insert({
                        customer_id: customerId,
                        product_id: item.productId,
                        variant_id: item.variantId,
                        product_name: item.productName,
                        variant_name: item.variantName || "",
                        category: item.category || "",
                        purchase_count: 1,
                        total_quantity: item.quantity,
                        total_spent: item.price * item.quantity,
                        last_purchased_at: new Date().toISOString(),
                    });
            }
        }
    }

    // Reduce stock for each item
    for (const item of orderData.items) {
        // Get current stock
        const { data: variant } = await serverClient
            .from("product_variants")
            .select("stock")
            .eq("id", item.variantId)
            .single();

        if (variant) {
            const newStock = Math.max(0, variant.stock - item.quantity);
            await serverClient
                .from("product_variants")
                .update({ stock: newStock })
                .eq("id", item.variantId);
        }

        // Update product sales count
        const { data: product } = await serverClient
            .from("products")
            .select("sales_count")
            .eq("id", item.productId)
            .single();

        if (product) {
            await serverClient
                .from("products")
                .update({ sales_count: (product.sales_count || 0) + item.quantity })
                .eq("id", item.productId);
        }
    }

    return { ...order, items: orderItems };
}

/**
 * Get all orders (admin)
 */
export async function getOrders(options?: {
    status?: string;
    limit?: number;
    offset?: number;
}) {
    const serverClient = createServerClient();

    let query = serverClient
        .from("orders")
        .select(`
      *,
      items:order_items(*)
    `)
        .order("created_at", { ascending: false });

    if (options?.status) {
        query = query.eq("status", options.status);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

/**
 * Get order by ID (admin)
 */
export async function getOrderById(id: string) {
    const serverClient = createServerClient();

    const { data, error } = await serverClient
        .from("orders")
        .select(`
      *,
      items:order_items(*)
    `)
        .eq("id", id)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string) {
    const serverClient = createServerClient();

    const { data, error } = await serverClient
        .from("orders")
        .select(`
      *,
      items:order_items(*)
    `)
        .eq("order_number", orderNumber)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update order status (admin)
 */
export async function updateOrderStatus(id: string, status: string) {
    const serverClient = createServerClient();

    // Get current order status and items before updating
    const { data: order } = await serverClient
        .from("orders")
        .select("status")
        .eq("id", id)
        .single();

    const { data: orderItems } = await serverClient
        .from("order_items")
        .select("variant_id, quantity")
        .eq("order_id", id);

    const { data, error } = await serverClient
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    // If order is cancelled or failed, restore stock
    if ((status === "cancelled" || status === "failed") && orderItems) {
        for (const item of orderItems) {
            if (item.variant_id) {
                // Get current stock
                const { data: variant } = await serverClient
                    .from("product_variants")
                    .select("stock")
                    .eq("id", item.variant_id)
                    .single();

                if (variant) {
                    const newStock = variant.stock + item.quantity;
                    await serverClient
                        .from("product_variants")
                        .update({ stock: newStock })
                        .eq("id", item.variant_id);
                }
            }

            // Reduce sales count
            if (item.variant_id) {
                const { data: orderItem } = await serverClient
                    .from("order_items")
                    .select("product_id, quantity")
                    .eq("order_id", id)
                    .eq("variant_id", item.variant_id)
                    .single();

                if (orderItem?.product_id) {
                    const { data: product } = await serverClient
                        .from("products")
                        .select("sales_count")
                        .eq("id", orderItem.product_id)
                        .single();

                    if (product && product.sales_count > 0) {
                        await serverClient
                            .from("products")
                            .update({ sales_count: Math.max(0, product.sales_count - orderItem.quantity) })
                            .eq("id", orderItem.product_id);
                    }
                }
            }
        }
    }

    return data;
}

/**
 * Update payment status (admin)
 */
export async function updatePaymentStatus(id: string, paymentStatus: string) {
    const serverClient = createServerClient();

    const { data, error } = await serverClient
        .from("orders")
        .update({ payment_status: paymentStatus })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete order (admin)
 */
export async function deleteOrder(id: string) {
    const serverClient = createServerClient();

    const { error } = await serverClient
        .from("orders")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return true;
}

/**
 * Get order statistics (admin)
 */
export async function getOrderStats() {
    const serverClient = createServerClient();

    const { data: orders, error } = await serverClient
        .from("orders")
        .select("total, status, created_at");

    if (error) throw error;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayOrders = orders.filter(o => new Date(o.created_at) >= today);
    const monthOrders = orders.filter(o => new Date(o.created_at) >= thisMonth);
    const pendingOrders = orders.filter(o => o.status === "pending");

    return {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + Number(o.total), 0),
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, o) => sum + Number(o.total), 0),
        monthOrders: monthOrders.length,
        monthRevenue: monthOrders.reduce((sum, o) => sum + Number(o.total), 0),
        pendingOrders: pendingOrders.length,
    };
}
