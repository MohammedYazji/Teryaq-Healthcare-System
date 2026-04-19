import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { PaymentService } from "../../application/services/PaymentService";
import Stripe from "stripe";
import { config } from "../../../../config/env";

const paymentService = new PaymentService();
const stripe = new Stripe(config.STRIPE_SECRET_KEY as string, {});

export class PaymentController {
  // Create Payment session for the patient
  createCheckoutSession = catchAsync(
    async (req: any, res: Response, next: NextFunction) => {
      const { appointmentId } = req.params;

      // From the protect middleware pass the appointment and the patient info
      const session = await paymentService.createCheckoutSession(
        appointmentId,
        req.user,
      );

      res.status(200).json({
        status: "success",
        session_url: session.url, // URL to redirect the patient there
      });
    },
  );

  // Static to let the server call it easily
  static handleWebhook = catchAsync(async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    let event: any;

    try {
      // Check the Signature
      event = stripe.webhooks.constructEvent(
        req.body, //Raw Data which we prepared it in the server
        sig,
        config.STRIPE_WEBHOOK_SECRET as string,
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // If the payment done successfully
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      // Send data to the server to update the database
      await paymentService.confirmPayment(session);
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as any;
      await paymentService.handleExpiredSession(session);
    }

    res.status(200).json({ received: true });
  });
}
