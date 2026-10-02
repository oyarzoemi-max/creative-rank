import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const usdToArs = Number(process.env.CREATIVE_RANK_USD_TO_ARS || 0);
    if (!accessToken || !supabaseUrl || !serviceRoleKey || !usdToArs) {
      return NextResponse.json({ error: "Mercado Pago no está configurado." }, { status: 503 });
    }
    const body = await request.json();
    const packageId = String(body.packageId || "");
    const companyId = String(body.companyId || "");
    const editionId = String(body.editionId || "");
    const userId = String(body.userId || "");
    if (!packageId || !companyId || !editionId || !userId) return NextResponse.json({ error: "Faltan datos." }, { status: 400 });

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const [{ data: pkg }, { data: company }, { data: edition }] = await Promise.all([
      supabase.from("credit_packages").select("id,price_usd,credits,active").eq("id", packageId).eq("active", true).single(),
      supabase.from("companies").select("id,name,owner_id,active,approved").eq("id", companyId).single(),
      supabase.from("monthly_editions").select("id,name,status").eq("id", editionId).eq("status", "active").single(),
    ]);
    if (!pkg) return NextResponse.json({ error: "Paquete no encontrado." }, { status: 404 });
    if (!company || company.owner_id !== userId) return NextResponse.json({ error: "Empresa no autorizada." }, { status: 403 });
    if (!edition) return NextResponse.json({ error: "Edición activa no encontrada." }, { status: 409 });

    const { data: entry } = await supabase.from("entries").select("id,credits").eq("edition_id", editionId).eq("company_id", companyId).single();
    const currentCredits = Number(entry?.credits || 0);
    if (currentCredits + Number(pkg.credits) > 20000) return NextResponse.json({ error: "El paquete supera el límite de 20.000 créditos." }, { status: 409 });

    const amountArs = Math.round(Number(pkg.price_usd) * usdToArs * 100) / 100;
    const { data: purchase, error } = await supabase.from("credit_purchases").insert({
      user_id: userId, company_id: companyId, edition_id: editionId, package_id: packageId,
      provider: "mercadopago", amount_usd: Number(pkg.price_usd), credits: Number(pkg.credits), status: "pending",
    }).select("id").single();
    if (error || !purchase) return NextResponse.json({ error: "No se pudo crear la orden." }, { status: 500 });

    const origin = new URL(request.url).origin;
    const preference = {
      items: [{ id: packageId, title: `Creative Rank · ${pkg.credits} créditos`, description: `Promoción mensual para ${company.name} · ${edition.name}`, quantity: 1, currency_id: "ARS", unit_price: amountArs }],
      external_reference: purchase.id,
      notification_url: `${origin}/api/mercadopago/webhook`,
      back_urls: { success: `${origin}/?payment=success`, failure: `${origin}/?payment=failure`, pending: `${origin}/?payment=pending` },
      auto_return: "approved",
      metadata: { purchase_id: purchase.id, company_id: companyId, edition_id: editionId },
    };
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(preference),
    });
    const mp = await response.json();
    if (!response.ok) {
      await supabase.from("credit_purchases").update({ status: "cancelled" }).eq("id", purchase.id);
      return NextResponse.json({ error: mp.message || "Mercado Pago rechazó el checkout." }, { status: 502 });
    }
    return NextResponse.json({ purchaseId: purchase.id, checkoutUrl: mp.init_point, sandboxUrl: mp.sandbox_init_point, amountArs, credits: Number(pkg.credits) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno." }, { status: 500 });
  }
}
