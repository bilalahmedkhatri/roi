"use client";

import { ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import { SecurityQuestion } from "@/lib/types";

interface Props {
  securityQ1: string;
  setSecurityQ1: (v: string) => void;
  securityA1: string;
  setSecurityA1: (v: string) => void;
  securityQ2: string;
  setSecurityQ2: (v: string) => void;
  securityA2: string;
  setSecurityA2: (v: string) => void;
  questions: SecurityQuestion[];
  inputClass: string;
  labelClass: string;
}

export default function SecurityQuestionsSection({
  securityQ1, setSecurityQ1, securityA1, setSecurityA1,
  securityQ2, setSecurityQ2, securityA2, setSecurityA2,
  questions, inputClass, labelClass,
}: Props) {
  return (
    <Card className="rounded-3xl border border-border/60 bg-surface/30 p-6 shadow-sm backdrop-blur lg:p-8">
      <div className="mb-8 flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <ShieldCheck size={20} />
        </div>

        <div>
          <h2 className="text-xl font-semibold">Security Questions</h2>
          <p className="mt-1 text-sm text-muted">Used for account recovery and verification</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Security Question 1</label>
          <select value={securityQ1} onChange={(e) => setSecurityQ1(e.target.value)} className={inputClass}>
            <option value="">Select a question...</option>
            {questions.map((q) => (
              <option key={q.id} value={q.question}>{q.question}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Answer 1</label>
          <input type="text" value={securityA1} onChange={(e) => setSecurityA1(e.target.value)} className={inputClass} placeholder="Enter your answer" />
        </div>

        <div>
          <label className={labelClass}>Security Question 2</label>
          <select value={securityQ2} onChange={(e) => setSecurityQ2(e.target.value)} className={inputClass}>
            <option value="">Select a question...</option>
            {questions.filter((q) => q.question !== securityQ1).map((q) => (
              <option key={q.id} value={q.question}>{q.question}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Answer 2</label>
          <input type="text" value={securityA2} onChange={(e) => setSecurityA2(e.target.value)} className={inputClass} placeholder="Enter your answer" />
        </div>
      </div>
    </Card>
  );
}
