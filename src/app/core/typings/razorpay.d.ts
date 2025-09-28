declare namespace Razorpay {
  interface PaymentSuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface PaymentFailureResponse {
    error: {
      code: string;
      description: string;
      source: string;
      step: string;
      reason: string;
      metadata: {
        order_id: string;
        payment_id: string;
      };
    };
  }

  type EventMap = {
    'payment.success': PaymentSuccessResponse;
    'payment.failed': PaymentFailureResponse;
  };

  interface Prefill {
    name?: string;
    email?: string;
    contact?: string;
  }

  interface Theme {
    color?: string;
  }

  interface Options {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    image?: string;
    order_id: string;
    handler: (response: PaymentSuccessResponse) => void;
    prefill?: Prefill;
    notes?: Record<string, unknown>;
    theme?: Theme;
  }
}

declare class Razorpay {
  constructor(options: Razorpay.Options);
  open(): void;
  on<K extends keyof Razorpay.EventMap>(
    event: K,
    callback: (response: Razorpay.EventMap[K]) => void
  ): void;
}
