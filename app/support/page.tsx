"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="mt-3 text-muted">We&apos;re here 24/7. Send us a message and we&apos;ll respond quickly.</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Contact Form</h2>
          <p className="mt-1 text-sm text-muted">Fill in your details and we&apos;ll get back to you.</p>

          {sent ? (
            <div className="mt-6 rounded-xl bg-primary/5 border border-primary/20 p-5 text-center">
              <svg className="mx-auto h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 font-medium text-primary">Sent!</p>
              <p className="mt-1 text-sm text-muted">We&apos;ll respond within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
                  placeholder="Your name" required />
              </div>
              <div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
                  placeholder="you@example.com" required />
              </div>
              <div>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                  className="block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted resize-none"
                  placeholder="How can we help?" required />
              </div>
              <button type="submit"
                className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
                Send Message
              </button>
            </form>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold">Email</h2>
            <p className="mt-1 text-sm text-muted">support@roiaitrading.com</p>
            <p className="text-xs text-muted/60 mt-0.5">Response within 24 hours</p>
          </Card>
          <Card>
            <h2 className="font-semibold">Live Chat</h2>
            <p className="mt-1 text-sm text-muted">Click the chat icon in the bottom-right corner</p>
            <p className="text-xs text-muted/60 mt-0.5">Available 24/7</p>
          </Card>
          <Card>
            <h2 className="font-semibold">FAQ</h2>
            <p className="mt-1 text-sm text-muted">Visit our homepage for common questions</p>
            <Link href="/" className="mt-2 inline-flex text-sm font-medium text-primary hover:text-primary-dark transition-colors">
              View FAQ &rarr;
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
