
import { Suspense } from "react";

import Navbar from "@/components/Navbar";
import { requireOrganizer } from "@/lib/authorization";
import NewEventForm from "./NewEventForm";

async function ProtectedEventForm() {
  const { memberships } = await requireOrganizer();

  const clubs = memberships.map((membership) => ({
    id: membership.club.id,
    name: membership.club.name,
  }));

  return <NewEventForm clubs={clubs} />;
}

export default function NewEventPage() {
  return (
    <>
      <Navbar />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080D1D] p-10 text-slate-400">
            Loading event form...
          </div>
        }
      >
        <ProtectedEventForm />
      </Suspense>
    </>
  );
}
