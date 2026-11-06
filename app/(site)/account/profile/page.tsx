"use client";

import { useState } from "react";
import Link from "next/link";
import { Field } from "@/components/Input";
import { Button } from "@/components/Button";
import { useToast } from "@/store/toast";

export default function ProfilePage() {
  const push = useToast((s) => s.push);
  const [form, setForm] = useState({ name: "Riya Sharma", email: "riya@example.com", phone: "9876543210" });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Profile settings</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          push("Profile saved");
        }}
        className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-sm"
      >
        <Field id="name" label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Field id="email" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Field id="phone" label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Button type="submit" className="self-start">Save changes</Button>
      </form>
      <Link href="/forgot-password" className="text-sm font-semibold text-accent-text">Change password</Link>
    </div>
  );
}
