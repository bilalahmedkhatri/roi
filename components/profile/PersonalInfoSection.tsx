"use client";

import Card from "@/components/ui/Card";

interface Props {
  name: string;
  setName: (v: string) => void;
  email: string;
  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  country: string;
  inputClass: string;
  textareaClass: string;
  labelClass: string;
}

export default function PersonalInfoSection({
  name, setName, email, phone, setPhone,
  address, setAddress, city, setCity, country,
  inputClass, textareaClass, labelClass,
}: Props) {
  return (
    <Card className="rounded-3xl border border-border/60 bg-surface/30 p-6 shadow-sm backdrop-blur lg:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-semibold">Personal Information</h2>
        <p className="mt-1 text-sm text-muted">Update your account details and contact information</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
        <div>
          <label className={labelClass}>Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Enter your full name" />
        </div>

        <div>
          <label className={labelClass}>Email Address</label>
          <input type="email" value={email} disabled className={`${inputClass} cursor-not-allowed bg-surface/20 text-muted`} placeholder="example@email.com" />
        </div>

        <div>
          <label className={labelClass}>Phone Number</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+1 234 567 8900" />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Address</label>
          <textarea rows={4} value={address} onChange={(e) => setAddress(e.target.value)} className={textareaClass} placeholder="Enter your full address" />
        </div>

        <div>
          <label className={labelClass}>City</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="Enter your city" />
        </div>

        <div>
          <label className={labelClass}>Country</label>
          <input type="text" value={country} disabled className={`${inputClass} cursor-not-allowed bg-surface/20 text-muted`} placeholder="Country" />
        </div>
      </div>
    </Card>
  );
}
