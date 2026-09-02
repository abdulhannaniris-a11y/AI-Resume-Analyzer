"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

function SettingsContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-8">Settings</h1>

      <div className="bg-white border border-line rounded-lg p-6 space-y-5 mb-8">
        <div>
          <p className="text-sm text-ink-soft mb-1">Name</p>
          <p className="text-ink">{user?.name}</p>
        </div>
        <div>
          <p className="text-sm text-ink-soft mb-1">Email</p>
          <p className="text-ink">{user?.email}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="text-clay border border-clay/30 px-5 py-2.5 rounded-sm hover:bg-clay-50 transition-colors"
      >
        Log out
      </button>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
