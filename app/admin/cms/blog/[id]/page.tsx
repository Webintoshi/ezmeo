"use client";

import { use } from "react";
import { BlogForm } from "@/components/admin/BlogForm";
import { getBlogPosts } from "@/lib/blog";
import { notFound } from "next/navigation";

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const posts = getBlogPosts();
    const post = posts.find(p => p.id === id);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <BlogForm initialData={post} />
            </div>
        </div>
    );
}
