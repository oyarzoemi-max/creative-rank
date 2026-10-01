import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!accessToken || !supabaseUrl || !serviceRoleKey) return NextResponse.json({ ok: true });

    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const paymentId = String(url.searchParams.get("data.id") || body?.data?.id || body?.id || "");
    if (!paymentId) return NextResponse.json({ ok: true });

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) return NextResponse.json({ ok: true });
    const payment = await response.json();
    if (payment.status !== "approved") return NextResponse.json({ ok: true });

    const purchaseId = String(payment.external_reference || payment.metadata?.purchase_id || "");
    if (!purchaseId) return NextResponse.json({ ok: true });

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: purchase } = await supabase.from("credit_purchases").select("id,company_id,edition_id,credits,status").eq("id", purchaseId).single();
    if (!purchase || purchase.status === "approved") return NextResponse.json({ ok: true });

    const { data: entry } = await supabase.from("entries").select("id,credits").eq("company_id", purchase.company_id).eq("edition_id", purchase.edition_id).single();
    if (!entry || Number(entry.credits) + Number(purchase.credits) > 20000) {
      await supabase.from("credit_purchases").update({ status: "cancelled", provider_payment_id: String(payment.id) }).eq("id", purchase.id);
      return NextResponse.json({ ok: true });
    }

    const newBalance = Number(entry.credits) + Number(purchase.credits);
    const { error: entryError } = await supabase.from("entries").update({ credits: newBalance }).eq("id", entry.id);
    if (entryError) return NextResponse.json({ error: "No se pudo acreditar." }, { status: 500 });

    await supabase.from("credit_movements").insert({ company_id: purchase.company_id, edition_id: purchase.edition_id, purchase_id: purchase.id, movement_type: "purchase", amount: Number(purchase.credits), balance_after: newBalance, note: `Mercado Pago ${payment.id}` });
    await supabase.from("credit_purchases").update({ status: "approved", provider_payment_id: String(payment.id), approved_at: new Date().toISOString() }).eq("id", purchase.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
