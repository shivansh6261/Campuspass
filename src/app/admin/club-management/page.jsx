
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { requireAdmin } from "@/lib/authorization";
import AdminClubPanel from "./AdminClubPanel";

async function ProtectedAdminPanel() {
  await requireAdmin();

  return <AdminClubPanel />;
}

export default function ClubManagementPage() {
  return (
    <>
      <Navbar />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080D1D] p-10 text-slate-400">
            Loading club management...
          </div>
        }
      >
        <ProtectedAdminPanel />
      </Suspense>
    </>
  );
}
