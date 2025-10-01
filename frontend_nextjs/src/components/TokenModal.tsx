"use client";

import React from "react";
import { apiPost } from "../lib/api";

type ConnectorKind = "jira" | "confluence";

interface TokenModalProps {
  // PUBLIC_INTERFACE
  /** Whether the modal is visible. */
  open: boolean;
  /** Which connector this modal is for. */
  connector: ConnectorKind;
  /** Close callback. */
  onClose: () => void;
  /** Called on successful submission to let parent refresh status. */
  onSuccess?: () => void;
}

/** PUBLIC_INTERFACE
 * TokenModal lets the user input an API Token/Personal Access Token for Jira or Confluence.
 * It handles posting to the backend, shows loading, error, and success, and triggers onSuccess.
 */
export default function TokenModal({ open, connector, onClose, onSuccess }: TokenModalProps) {
  const [token, setToken] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setToken("");
      setSubmitting(false);
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  if (!open) return null;

  const title = connector === "jira" ? "Connect Jira via API Token" : "Connect Confluence via API Token";
  const placeholder =
    connector === "jira" ? "Enter Jira API token / PAT" : "Enter Confluence API token / PAT";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const path = connector === "jira" ? "/auth/jira/api-token" : "/auth/confluence/api-token";
      // backend may expect { token } or { api_token }, send both keys for compatibility
      await apiPost(path, { token, api_token: token });
      setSuccess("Connected successfully.");
      if (onSuccess) onSuccess();
      // close after brief delay for UX
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message: string }).message
          : "Failed to save token";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="token-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[92%] max-w-md rounded-lg bg-white shadow-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 id="token-modal-title" className="text-base font-semibold">
            {title}
          </h3>
          <button
            type="button"
            aria-label="Close"
            className="h-8 w-8 grid place-items-center rounded-md hover:bg-slate-100"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="api-token-input" className="text-sm text-slate-600">
              API Token / Personal Access Token
            </label>
            <input
              id="api-token-input"
              type="password"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={placeholder}
              className="w-full h-10 rounded-md border border-[var(--border-subtle)] px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent"
            />
            <p className="text-xs text-slate-500">
              Your token is sent only to the backend service you configured and is not stored in any database.
            </p>
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          {success ? <div className="text-sm text-emerald-600">{success}</div> : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md border border-[var(--border-subtle)] hover:bg-slate-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-md bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-primary-hover)] focus:ring-2 focus:ring-[var(--focus-ring)] disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Token"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
