"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { ArrowRight, RefreshCw, X } from "lucide-react";
import { useTranslation } from "./providers";
import { errorMessage } from "@/lib/i18n/errors";

export function Heading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-lead">{description}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div className={`notice ${error ? "error" : ""}`} role={error ? "alert" : "status"}>
      {children}
    </div>
  );
}
export function ErrorNotice({ message, retry }: { message: string; retry?: () => void }) {
  const { t, locale } = useTranslation();
  return (
    <Notice error>
      <p>{errorMessage(message, locale)}</p>
      {retry && (
        <button className="subtle mt-3" onClick={retry}>
          <RefreshCw size={16} />
          {t("Réessayer", "Try again")}
        </button>
      )}
    </Notice>
  );
}
export function Loading({ label }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <div aria-busy="true" className="box">
      <p role="status">
        {label || t("Un instant, on prépare ton espace…", "One moment, preparing your space…")}
      </p>
      <div className="skeleton large" />
      <div className="skeleton short" />
    </div>
  );
}
export function Empty({
  title,
  description,
  children,
  symbol = "?",
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
  symbol?: string;
}) {
  return (
    <div className="box empty-state">
      <div className="empty-symbol" aria-hidden="true">
        {symbol}
      </div>
      <h2>{title}</h2>
      <p className="page-lead mx-auto">{description}</p>
      {children && <div className="actions">{children}</div>}
    </div>
  );
}
export function Field({
  id,
  label,
  note,
  children,
}: {
  id: string;
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {note && (
        <span id={`${id}-note`} className="field-note">
          {note}
        </span>
      )}
    </div>
  );
}
export function Metric({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
export function KeyScene() {
  return (
    <div className="key-scene" aria-hidden="true">
      <div className="scene-key key-a">a</div>
      <div className="scene-key key-z">z</div>
      <span className="scene-sticker">PRESS PLAY</span>
      <span className="scene-spark">✳</span>
    </div>
  );
}
export function Avatar({ name, index = 0 }: { name: string; index?: number }) {
  const colors = ["var(--accent)", "var(--pink)", "var(--lavender)", "var(--sky)", "var(--coral)"];
  return (
    <span
      className="avatar"
      aria-hidden="true"
      style={{ "--avatar": colors[index % colors.length] } as React.CSSProperties}
    >
      {Array.from(name)[0]?.toUpperCase() || "?"}
    </span>
  );
}
export function AuthGate({
  account = false,
  destination = "/",
  children,
}: {
  account?: boolean;
  destination?: string;
  children?: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <Empty
      title={
        account
          ? t("Un compte pour préparer ta course", "An account to prepare your race")
          : t("Choisis ton identité", "Choose your identity")
      }
      description={
        account
          ? t(
              "Connecte-toi pour créer des salles et retrouver ta progression.",
              "Sign in to create rooms and keep your progress.",
            )
          : t(
              "Un pseudo suffit pour participer. Ton compte conserve tes résultats.",
              "A nickname is enough to join. Your account saves your results.",
            )
      }
    >
      <Link className="primary" href={`/connexion?next=${encodeURIComponent(destination)}`}>
        {t("Se connecter", "Sign in")}
        <ArrowRight size={16} />
      </Link>
      {!account && (
        <Link className="subtle" href={`/invite?next=${encodeURIComponent(destination)}`}>
          {t("Continuer comme invité", "Continue as guest")}
        </Link>
      )}
      {children}
    </Empty>
  );
}
export function Dialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { t } = useTranslation();
  useEffect(() => {
    const dialog = ref.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="site-dialog"
      aria-labelledby={titleId}
      onCancel={onClose}
      onClose={onClose}
    >
      <div className="section-heading">
        <h2 id={titleId}>{title}</h2>
        <button className="icon-button" aria-label={t("Fermer", "Close")} onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
