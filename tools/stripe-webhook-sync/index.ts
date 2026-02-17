
import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json({ type: 'application/json' }));

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'] as string,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed.', err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }

    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status;
      const subscriptionId = subscription.id;
      const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;

      // Actualiza la clínica correspondiente en Supabase
      const { error } = await supabase
        .from('clinics')
        .update({
          stripe_subscription_id: subscriptionId,
          subscription_status: status,
          stripe_trial_end: trialEnd,
        })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error('Error updating clinic in Supabase:', error);
        return res.status(500).send('Supabase update error');
      }
    }

    res.status(200).json({ received: true });
  }
);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Stripe webhook listener running on port ${PORT}`);
});
