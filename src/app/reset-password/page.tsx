'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        setError("We could not validate this reset link. Please request a new one.");
        return;
      }

      if (session) {
        setReady(true);
      } else {
        setError("This reset link is invalid or has expired. Please request a new one.");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePasswordUpdate = async () => {
    if (!password || !confirmation) {
      setError("Enter and confirm your new password.");
      return;
    }

    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setInfo("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      setInfo("Your password was updated successfully. You can now sign in with your new password.");
      setPassword("");
      setConfirmation("");
      setReady(false);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "We could not update your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="demo-modal-backdrop">
      <section className="demo-modal auth-modal" role="main" aria-labelledby="reset-password-title">
        <div className="demo-modal-header">
          <div>
            <div className="section-kicker">ACCESS</div>
            <h3 id="reset-password-title">Reset password</h3>
          </div>
        </div>

        {ready ? (
          <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
            <label className="field field-wide">
              <span>New password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>
            <label className="field field-wide">
              <span>Confirm new password</span>
              <input
                type="password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>
          </div>
        ) : null}

        {error ? <small className="field-error">{error}</small> : null}
        {info ? <small className="field-hint">{info}</small> : null}

        <div className="modal-actions">
          {info ? (
            <button className="secondary-button" type="button" onClick={() => router.push("/?auth=login")}>
              BACK TO LOGIN
            </button>
          ) : (
            <button className="secondary-button" type="button" onClick={() => router.push("/")}>
              CANCEL
            </button>
          )}
          {ready ? (
            <button className="primary-button" type="button" onClick={handlePasswordUpdate} disabled={loading}>
              {loading ? "PLEASE WAIT..." : "UPDATE PASSWORD"}
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}