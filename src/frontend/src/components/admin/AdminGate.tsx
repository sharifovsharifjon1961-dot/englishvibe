import { GlowCard } from "@/components/effects/GlowCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCheckAdminPasscode } from "@/hooks/useQueries";
import { useAdminStore } from "@/store/adminStore";
import { AlertCircle, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";

/** Passcode gate that unlocks the whole content-management area. */
export function AdminGate() {
  const setAdmin = useAdminStore((state) => state.setAdmin);
  const checkPasscode = useCheckAdminPasscode();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const value = passcode.trim();
    if (value.length === 0) {
      setError("Enter the admin passcode to continue.");
      return;
    }
    try {
      const ok = await checkPasscode.mutateAsync(value);
      if (ok) {
        setPasscode("");
        setAdmin(true);
      } else {
        setError("That passcode is not correct. Check it and try again.");
      }
    } catch {
      setError("Could not reach the server. Check your connection and retry.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <GlowCard lift={false} className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground">
            <ShieldCheck className="size-7" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1.5">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Admin access
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter the passcode to manage tests, passages, listening, speaking,
              writing, links and announcements.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          data-ocid="admin.login_form"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-passcode">Passcode</Label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="admin-passcode"
                data-ocid="admin.passcode_input"
                type="password"
                autoComplete="current-password"
                value={passcode}
                placeholder="Enter passcode"
                className="pl-9"
                aria-invalid={error !== null}
                aria-describedby={error ? "admin-passcode-error" : undefined}
                onChange={(event) => setPasscode(event.target.value)}
              />
            </div>
          </div>

          {error && (
            <p
              id="admin-passcode-error"
              data-ocid="admin.login.error_state"
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              {error}
            </p>
          )}

          <Button
            type="submit"
            data-ocid="admin.login.submit_button"
            disabled={checkPasscode.isPending}
            className="btn-neon w-full"
          >
            {checkPasscode.isPending ? "Checking…" : "Unlock dashboard"}
          </Button>
        </form>
      </GlowCard>
    </div>
  );
}
