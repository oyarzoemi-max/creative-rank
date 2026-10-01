import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!accessToken || !supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ ok: true });
    }

    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const paymentId = String(
      url.searchParams.get("data.id") ||
      body?.data?.id ||
      body?.id ||
      ""
    );

    if (!paymentId) return NextResponse.json({ ok: true });

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) return NextResponse.json({ ok: true });

    const payment = await response.json();
    if (payment.status !== "approved") return NextResponse.json({ ok: true });

    const purchaseId = String(
      payment.external_reference ||
      payment.metadata?.purchase_id ||
      ""
    );

    if (!purchaseId) return NextResponse.json({ ok: true });

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: purchase } = await supabase
      .from("credit_purchases")
      .select("id,status")
      .eq("id", purchaseId)
      .single();

    if (!purchase || purchase.status === "approved") {
      return NextResponse.json({ ok: true });
    }

    const { error: approvalError } = await supabase.rpc(
      "approve_credit_purchase",
      {
        p_purchase_id: purchaseId,
        p_provider_payment_id: String(payment.id),
      }
    );

    if (approvalError) {
      return NextResponse.json(
        { error: "No se pudo acreditar." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
