const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {createMollieClient} = require("@mollie/api-client");

const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
const prisma = require("../utils/db");

/**
 * Create a Stripe one-time payment
 */
const createStripePayment = async (packageId, userId) => {
  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.isActive) throw new Error("Package not found or inactive");

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(pkg.price * 100), // in cents
    currency: "usd", // or dynamic
    metadata: { packageId, userId },
  });

  return { clientSecret: paymentIntent.client_secret, package: pkg };
};

/**
 * Create a Mollie one-time payment
 */
const createMolliePayment = async (packageId, userId) => {
  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.isActive) throw new Error("Package not found or inactive");

  const payment = await mollieClient.payments.create({
    amount: { currency: "EUR", value: pkg.price.toFixed(2) }, // Mollie requires string with 2 decimals
    description: `Purchase of ${pkg.name}`,
    redirectUrl: `${process.env.FRONTEND_URL}auth/profile/payment/success?pkg=${packageId}`,
    // webhookUrl: `${process.env.BACKEND_URL}/payments/mollie-webhook`,
    metadata: { packageId, userId },
  });

  return { checkoutUrl: payment.getCheckoutUrl(), package: pkg };
};

module.exports = { createStripePayment, createMolliePayment };
