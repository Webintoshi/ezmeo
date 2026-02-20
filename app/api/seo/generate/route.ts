import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "OK", message: "SEO API is working" });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category } = body;

    return NextResponse.json({
      success: true,
      metaTitle: `${name} | Ezmeo`,
      metaDescription: `${name} ürünü Ezmeo'da!`,
      source: "test",
      debug: [`Test: ${name}`, `Kategori: ${category}`]
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
