// Stripe payment service stub
// Replace `your_stripe_secret_key` with your actual secret key in a .env file.
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function createCheckoutSession(amount: number, currency: string = "usd") {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency,
        product_data: { name: "Order" },
        unit_amount: amount,
      },
      quantity: 1,
    }],
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
  });
  return session.url;
}
