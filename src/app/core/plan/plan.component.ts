import { Component, Input, NgZone } from '@angular/core';
import { PlanService } from '../../features/admin/services/admin-plan.service';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '../services/subscription.service';
import { State, Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { selectCurrentUserId } from '../../features/auth/store/selectors/auth.selectors';
import { environment } from '../../../enviorments/environment';
import { NotyService } from '../services/noty.service';

@Component({
  selector: 'app-plan',
  imports: [CommonModule],
  templateUrl: './plan.component.html',
  styleUrl: './plan.component.scss',
})
export class PlanComponent {
  @Input() role: 'user' | 'trainer' = 'user';
  userId: string | undefined;
  plans: any[] = [];
    currentPlan: any = null;
    

  constructor(
    private planService: PlanService,
    private subscriptionService: SubscriptionService,
    private store: Store<AppState>,
    private notyf: NotyService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.planService
      .getUserSpecificPlans()
      .subscribe((res) => (this.plans = res));
      console.log('thsi.plan', this.plans)
    this.store
      .select(selectCurrentUserId)
      .subscribe((userId) => (this.userId = userId));
  }


confirmSubscription(planId: string) {
    // Prevent multiple clicks
    // if (this.isProcessing) {
    //   this.notyf.showWarning('Payment is already in progress...');
    //   return;
    // }

    console.log('planId', planId);
    if (this.userId) {
      // this.isProcessing = true;
      
      this.subscriptionService.createOrder(planId, this.userId).subscribe({
        next: (res) => {
          console.log('Order creation response:', res);
          
          // Store the plan details for later use
           this.currentPlan = res.plan;
          
          // Open Razorpay checkout with the created order
          this.openRazorpayCheckout(res.order, planId);
        },
        error: (err) => {
          console.error('Error creating order', err);
          // this.isProcessing = false;
          
          // Show appropriate error message
          if (err.status === 409) {
            this.notyf.showError('You already have an active subscription for this plan');
          } else if (err.status === 404) {
            this.notyf.showError('Plan not found');
          } else {
            this.notyf.showError('Failed to create order. Please try again.');
          }
        },
      });
    } else {
      this.notyf.showError('Please login to continue');
    }
  }

  private openRazorpayCheckout(
    order: {
      id: string;
      amount: number;
      currency: string;
    },
    planId: string
  ) {
    const options: Razorpay.Options = {
      key: environment.razorpayKey,
      amount: order.amount,
      currency: order.currency,
      name: 'VortexFit Subscription',
      description: `${this.currentPlan?.name || 'Subscription'} Plan Payment`,
      order_id: order.id,
      handler: (response: Razorpay.PaymentSuccessResponse) => {
        if (response) {
          console.log('Payment successful:', response);
          this.verifySubscriptionPayment(response, planId);
        }
      },
      prefill: {
        name: 'VortexFit User',
        email: 'user@vortexfit.com',
        contact: '9999999999',
      },
      theme: {
        color: '#3B82F6',
      },

    };

    const rzp = new Razorpay(options);

    // Handle payment failure
    rzp.on('payment.failed', (response: any) => {
      console.error('Payment failed:', response);
      this.ngZone.run(() => {
        // this.isProcessing = false;
        this.notyf.showError(`Payment failed: ${response.error.description || 'Unknown error'}`);
      });
    });

    rzp.open();
  }

  private verifySubscriptionPayment(response: Razorpay.PaymentSuccessResponse, planId: string) {
    // Prepare verification data according to your backend expectations
    const verificationData = {
      planId: planId,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    };

    console.log('Verifying payment with data:', verificationData);

    this.subscriptionService.verifyOrder(verificationData).subscribe({
      next: (verifyRes) => {
        this.ngZone.run(() => {
          // this.isProcessing = false;
          
          if (verifyRes.status === 'success') {
            this.notyf.showSuccess('Subscription activated successfully!');
            
            // Store subscription data for success page
            const subscriptionData = {
              subscriptionId: this.currentPlan._id,
              planName: this.currentPlan?.name,
              planPrice: this.currentPlan?.price,
              message: this.currentPlan.message,
              paymentId: response.razorpay_payment_id,
            };

            console.log('subscriptiionData', subscriptionData)

            // Navigate to success page or dashboard
            // this.router.navigate(['/user/subscription-success'], {
            //   state: { subscriptionData },
            // });
          } else {
            // this.notyf.showError(verifyRes.message || 'Subscription activation failed');
          }
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          // this.isProcessing = false;
          console.error('Payment verification error:', err);
          
          // Show specific error messages
          if (err.status === 409) {
            this.notyf.showError('Failed to create subscription. Please try again.');
          } else if (err.status === 404) {
            this.notyf.showError('Plan not found. Please contact support.');
          } else {
            this.notyf.showError('Failed to verify payment. Please contact support if amount was deducted.');
          }
        });
      },
    });
  }
}
