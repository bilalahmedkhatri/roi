import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

const points = [
  "We collect personal information you provide during registration including name, email, phone number, and payment details.",
  "Your data is used solely to operate and improve our trading platform services.",
  "We implement industry-standard encryption (SSL/TLS) to protect data transmission and storage.",
  "We do not sell, trade, or rent your personal information to third parties.",
  "Transaction data is securely processed and stored for record-keeping and compliance purposes.",
  "You have the right to request access, correction, or deletion of your personal data at any time.",
  "We use cookies and similar tracking technologies to enhance user experience and analyze platform usage.",
  "Account activity, including login times and IP addresses, is logged for security monitoring.",
  "Third-party payment processors handle deposit and withdrawal transactions under strict confidentiality agreements.",
  "We may disclose information if required by law or to protect our legal rights and platform integrity.",
  "Users are responsible for maintaining the confidentiality of their account credentials.",
  "We retain personal data for as long as your account is active or as needed to provide services.",
  "You may opt out of marketing communications at any time by contacting support.",
  "We do not knowingly collect data from individuals under 18 years of age.",
  "International data transfers may occur and are governed by standard contractual clauses.",
  "We conduct regular security audits to ensure your data remains protected.",
  "In the event of a data breach, affected users will be notified within 72 hours.",
  "Users can export their personal data in a structured, machine-readable format upon request.",
  "Our platform uses firewalls, intrusion detection, and access controls to safeguard data.",
  "This policy may be updated periodically. Continued use constitutes acceptance of changes.",
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: May 13, 2026</p>

      <div className="mt-8 space-y-4">
        <p className="text-sm text-muted leading-relaxed">
          ROI AI Trading (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Information We Collect</h2>
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
