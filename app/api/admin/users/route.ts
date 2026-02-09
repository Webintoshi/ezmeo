import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Create a Supabase client with the SERVICE ROLE KEY for admin operations
// This client bypasses RLS and can manage users
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export async function GET() {
    try {
        // Fetch all profiles
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (profilesError) throw profilesError;

        // Fetch all users to map emails (since profiles table might not have email if we didn't duplicate it)
        // Ideally we should store email in profiles for easier access or join, but auth.users is separate.
        // For now, let's fetch users list. Note: listUsers is paginated.
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

        if (usersError) throw usersError;

        // Merge data
        const admins = profiles.map(profile => {
            const user = users.find(u => u.id === profile.id);
            return {
                ...profile,
                email: user?.email || "Unknown"
            };
        });

        return NextResponse.json({ success: true, admins });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, fullName, role, taskDefinition } = body;

        if (!email || !password || !fullName || !role) {
            return NextResponse.json(
                { success: false, error: "Tüm alanlar zorunludur." },
                { status: 400 }
            );
        }

        // 1. Create user in Supabase Auth
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (createError) throw createError;
        if (!userData.user) throw new Error("Kullanıcı oluşturulamadı.");

        // 2. Create profile entry
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert({
                id: userData.user.id,
                full_name: fullName,
                role,
                task_definition: taskDefinition
            });

        if (profileError) {
            // Rollback: delete user if profile creation fails
            await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
            throw profileError;
        }

        return NextResponse.json({ success: true, message: "Yönetici başarıyla oluşturuldu." });

    } catch (error: unknown) {
        console.log("Create Admin Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });
        }

        // Delete user from Auth (Cascade should handle profile, but we enabled cascade in SQL)
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Yönetici silindi." });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
