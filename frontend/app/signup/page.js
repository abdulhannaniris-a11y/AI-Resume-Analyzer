"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { loginWithToken } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    if (!form.name.trim()) return "Enter your name.";
    if (!form.email.trim()) return "Enter your email.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const result = await api.signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      loginWithToken(result);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display text-3xl text-ink mb-2">Create your account</h1>
      <p className="text-ink-soft text-sm mb-8">
        Already have one?{" "}
        <Link href="/login" className="text-signal-700 hover:underline">
          Log in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-ink mb-1.5" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={update("name")}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:border-signal outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-ink mb-1.5" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={update("email")}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:border-signal outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-ink mb-1.5" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={update("password")}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:border-signal outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-ink mb-1.5" htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            value={form.confirm}
            onChange={update("confirm")}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:border-signal outline-none"
          />
        </div>

        {error && <p className="text-sm text-clay">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ink text-paper py-2.5 rounded-sm hover:bg-signal-700 transition-colors disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
