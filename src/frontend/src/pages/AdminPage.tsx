import { AdminGate } from "@/components/admin/AdminGate";
import { ContentManager } from "@/components/admin/ContentManager";
import { ImportExportPanel } from "@/components/admin/ImportExportPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useAdminStore } from "@/store/adminStore";
import { LogOut } from "lucide-react";

export default function AdminPage() {
  const isAdmin = useAdminStore((state) => state.isAdmin);
  const signOut = useAdminStore((state) => state.signOut);

  return (
    <div className="page-enter mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" richColors closeButton />
      <PageHeader
        eyebrow="Control"
        title="Admin"
        description="Manage every module's content, import and export the full content bundle."
        actions={
          isAdmin ? (
            <Button
              type="button"
              variant="outline"
              data-ocid="admin.sign_out_button"
              onClick={signOut}
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </Button>
          ) : undefined
        }
      />

      <div className="mt-10">
        {isAdmin ? (
          <div className="flex flex-col gap-10">
            <ContentManager />
            <ImportExportPanel />
          </div>
        ) : (
          <AdminGate />
        )}
      </div>
    </div>
  );
}
