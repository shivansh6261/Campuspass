
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { requireStudent } from "@/lib/authorization";
import OrganizerApplicationForm from "./OrganizerApplicationForm";

async function ProtectedApplication() {
  await requireStudent();

  return <OrganizerApplicationForm />;
}

export default function ApplyOrganizerPage() {
  return (
    <>
      <Navbar />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080D1D] p-10 text-slate-400">
            Loading organizer application...
          </div>
        }
      >
        <ProtectedApplication />
      </Suspense>
    </>
  );
}
