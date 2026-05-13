import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

const points = [
  "By creating an account, you agree to be bound by these Terms of Service.",
  "You must be at least 18 years old to use this platform.",
  "You are responsible for maintaining the confidentiality of your account credentials.",
  "All deposits are subject to the minimum amount requirements stated on the platform.",
  "Returns are not guaranteed and depend on actual market trade conditions.",
  "The stated percentage ranges (20-50% monthly, 15-30% for 15 days, 5-10% weekly) are targets, not guarantees.",
  "Withdrawals are processed within 2-12 hours after the investment period completes.",
  "Withdrawals can only be made using the same payment method used for the corresponding deposit.",
  "Crypto deposit bonuses (10%) cannot be withdrawn directly and must complete the investment period.",
  "Earnings are calculated based on deposit history, transaction frequency, and investment plan.",
  "We reserve the right to modify, suspend, or discontinue any aspect of the platform at any time.",
  "Users must not engage in fraudulent activities, money laundering, or any illegal transactions.",
  "Multiple accounts by the same individual are strictly prohibited and may result in suspension.",
  "We reserve the right to freeze or close accounts that violate these terms.",
  "The platform is provided &apos;as is&apos; without any warranty of uninterrupted or error-free service.",
  "We are not liable for any trading losses incurred while using our platform.",
  "Users are responsible for any taxes applicable to their earnings in their jurisdiction.",
  "Disputes shall be resolved through binding arbitration in accordance with applicable laws.",
  "These terms may be updated at any time. Users will be notified of material changes.",
  "Continued use of the platform after changes constitutes acceptance of the updated terms.",
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted">Last updated: May 13, 2026</p>

      <div className="mt-8 space-y-4">
        <p className="text-sm text-muted leading-relaxed">
          Please read these Terms of Service (&quot;Terms&quot;) carefully before using the ROI AI Trading platform.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Terms and Conditions</h2>
        <ol className="mt-4 space-y-3">
          {points.map((point, i) => (
            <li key={i} className="flex gap-3 text-sm text-muted leading-relaxed">
              <span className="shrink-0 font-medium text-primary mt-0.5">{i + 1}.</span>
              <span>{point}</span>
            </li>
          ))}
        </ol>

        <h2 className="mt-10 text-xl font-semibold">Contact</h2>
        <p className="mt-2 text-sm text-muted">support@roiaitrading.com</p>
      </div>
    </div>
  );
}
