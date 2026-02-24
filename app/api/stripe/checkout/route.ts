import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body; // "pro" or "premium"

    if (!plan || !["pro", "premium"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId =
      plan === "pro"
        ? process.env.STRIPE_PRO_PRICE_ID
        : process.env.STRIPE_PREMIUM_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe not configured. Add STRIPE_PRO_PRICE_ID and STRIPE_PREMIUM_PRICE_ID to .env" },
        { status: 500 }
      );
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const stripe = getStripe();
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from("profiles")
        .upsert(
          { id: user.id, stripe_customer_id: customerId },
          { onConflict: "id" }
        );
    }

    const origin = request.nextUrl.origin;
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?upgraded=1`,
      cancel_url: `${origin}/dashboard`,
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
