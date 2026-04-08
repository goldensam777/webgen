import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!email || !message) {
      return NextResponse.json({ error: "Email et message requis" }, { status: 400 });
    }

    // Stocker dans une table "leads" ou "messages"
    const { error } = await supabase
      .from("site_leads")
      .insert([
        { 
          site_slug: slug, 
          customer_name: name || "Anonyme", 
          customer_email: email, 
          message: message 
        }
      ]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}
