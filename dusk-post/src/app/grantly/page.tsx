import { GrantlyProvider } from "@/lib/grantly-store";
import { GrantlyView } from "@/components/grantly/grantly-view";

export const metadata = {
  title: "GRANTLY — Unified Scholarship Discovery & Management Platform",
  description:
    "Rethinking the scholarship journey: Transparent eligibility, smart document tracking, and real-time financial aid gap resolution.",
};

export default function GrantlyPage() {
  return (
    <GrantlyProvider>
      <GrantlyView />
    </GrantlyProvider>
  );
}
