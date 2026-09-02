"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  const links = user
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/analyze", label: "New Analysis" },
        { href: "/history", label: "History" },
        { href: "/settings", label: "Settings" },
      ]
    : [];

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="font-display text-lg text-ink">
          Resume Analyzer
        </Link>

        <nav className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm ${
                pathname === link.href
                  ? "text-ink font-medium"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <button
              onClick={handleLogout}
              className="text-sm text-ink-soft hover:text-clay"
            >
              Log out
            </button>
          ) : (
            <>
              <Link href="/login" className="text-sm text-ink-soft hover:text-ink">
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-ink text-paper px-4 py-2 rounded-sm hover:bg-signal-700 transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
