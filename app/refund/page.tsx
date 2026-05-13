import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
};

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <h1 className="text-3xl font-bold tracking-tight">Refund Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: May 13, 2026</p>

      <div className="mt-8 space-y-8 text-sm text-muted leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Investment Deposits</h2>
          <p className="mt-2">Once a deposit is made and the investment period has started, it cannot be canceled or refunded before the completion of the selected plan term.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Processing Deposits</h2>
          <p className="mt-2">Deposits still in processing (within 2-5 minutes) may be canceled upon request. Contact support immediately.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Completed Deposits</h2>
          <p className="mt-2">Once confirmed and the investment is active, funds are committed to the trading algorithm until the plan duration ends.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Earnings and Returns</h2>
          <p className="mt-2">Since returns depend on market performance, no refunds will be issued for lower-than-expected returns or trading losses.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Withdrawal Returns</h2>
          <p className="mt-2">Withdrawals in processing (within 2-12 hours) may be canceled. Contact support immediately.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Technical Issues</h2>
          <p className="mt-2">If technical issues prevent normal platform usage, contact support for case-by-case resolution.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Fraudulent Transactions</h2>
          <p className="mt-2">Accounts may be frozen during investigation of suspected fraud or unauthorized transactions.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Contact for Refunds</h2>
          <p className="mt-2">Email support@roiaitrading.com for refund inquiries. We aim to respond within 24 hours.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">9. Policy Changes</h2>
          <p className="mt-2">We reserve the right to modify this refund policy at any time. Changes are effective immediately upon posting.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">10. Governing Law</h2>
          <p className="mt-2">This refund policy is governed by the laws of the State of New York, United States.</p>
        </section>
      </div>
    </div>
  );
}
