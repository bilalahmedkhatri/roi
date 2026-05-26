"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { SecurityQuestion } from "@/lib/types";
import PersonalInfoSection from "@/components/profile/PersonalInfoSection";
import SecurityQuestionsSection from "@/components/profile/SecurityQuestionsSection";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import NetworkErrorBanner from "@/components/ui/NetworkErrorBanner";

export default function ProfilePage() {
  const isOnline = useOnlineStatus();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const [securityQ1, setSecurityQ1] = useState("");
  const [securityA1, setSecurityA1] = useState("");
  const [securityQ2, setSecurityQ2] = useState("");
  const [securityA2, setSecurityA2] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isVerified, setIsVerified] = useState(true);

  const inputClass =
    "w-full h-11 rounded-2xl border border-border/70 bg-surface/40 px-4 text-sm text-foreground placeholder:text-muted outline-none transition-all duration-200 focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10";

  const textareaClass =
    "w-full rounded-2xl border border-border/70 bg-surface/40 px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none transition-all duration-200 focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10 resize-none";

  const labelClass = "mb-2 block text-sm font-medium text-foreground/80";

  useEffect(() => {
    Promise.all([
      supabase.auth.getUser(),
      supabase.from("security_questions").select("id, question").order("sort_order"),
    ]).then(async ([{ data: { user } }, qRes]) => {
      if (!user) return;

      setEmail(user.email || "");
      if (qRes.data) setQuestions(qRes.data);
      if (!user.email_confirmed_at) setIsVerified(false);

      const { data: profile } = await supabase
        .from("users")
        .select("name, phone, address, city, country, security_question_1, security_answer_1, security_question_2, security_answer_2")
        .eq("auth_id", user.id)
        .single();

      if (profile) {
        setName(profile.name || "");
        setPhone(profile.phone || "");
        setAddress(profile.address || "");
        setCity(profile.city || "");
        setCountry(profile.country || "");
        setSecurityQ1(profile.security_question_1 || "");
        setSecurityA1(profile.security_answer_1 || "");
        setSecurityQ2(profile.security_question_2 || "");
        setSecurityA2(profile.security_answer_2 || "");
      }

      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) return;
    setSaving(true);
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("users")
      .update({
        name,
        phone,
        address,
        city,
        security_question_1: securityQ1 || null,
        security_answer_1: securityA1 || null,
        security_question_2: securityQ2 || null,
        security_answer_2: securityA2 || null,
        updated_at: new Date().toISOString(),
      })
      .eq("auth_id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <NetworkErrorBanner />

      <div className="flex flex-col gap-2 border-b border-border/50 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-sm text-muted">Manage your personal information, security settings, and view payment methods.</p>
      </div>

      {!isVerified && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm flex items-center gap-3">
          <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <p className="text-amber-800">Please verify your email before updating your profile.</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <PersonalInfoSection
          name={name} setName={setName} email={email}
          phone={phone} setPhone={setPhone}
          address={address} setAddress={setAddress}
          city={city} setCity={setCity}
          country={country}
          inputClass={inputClass} textareaClass={textareaClass} labelClass={labelClass}
        />

        <SecurityQuestionsSection
          securityQ1={securityQ1} setSecurityQ1={setSecurityQ1}
          securityA1={securityA1} setSecurityA1={setSecurityA1}
          securityQ2={securityQ2} setSecurityQ2={setSecurityQ2}
          securityA2={securityA2} setSecurityA2={setSecurityA2}
          questions={questions}
          inputClass={inputClass} labelClass={labelClass}
        />

        <div className="sticky bottom-4 z-20 flex items-center justify-between py-4">
          <div>
            {saved && (
              <p className="text-sm font-medium text-primary">Profile updated successfully.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !isVerified || !isOnline}
            className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-primary/30 disabled:opacity-40"
          >
            {saving ? "Saving..." : !isOnline ? "No internet connection" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
