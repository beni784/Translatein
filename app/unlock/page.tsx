import type { Metadata } from "next";
import { UnlockForm } from "@/components/auth/UnlockForm";

export const metadata: Metadata = {
  title: "Buka Kunci",
  description: "Masukkan password untuk membuka BeniYujii AI.",
};

interface UnlockPageProps {
  searchParams: { next?: string };
}

export default function UnlockPage({ searchParams }: UnlockPageProps) {
  // Sanitize the "next" redirect target — only accept internal paths
  // (starts with "/" but NOT "//") to prevent open-redirect abuse.
  const raw = searchParams?.next ?? "/";
  const next =
    typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")
      ? raw
      : "/";

  return <UnlockForm nextPath={next} />;
}
