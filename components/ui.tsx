"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import {
  ArrowRight,
  ChartNoAxesCombined,
  Gauge,
  History,
  Keyboard,
  LogIn,
  RefreshCw,
  UserRound,
  UserRoundPlus,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
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
  label: React.ReactNode;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label id={`${id}-label`} htmlFor={id}>
        {label}
      </label>
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
  const { t } = useTranslation();
  return (
    <div className="key-scene" aria-hidden="true">
      <div className="scene-key key-a">a</div>
      <div className="scene-key key-z">z</div>
      <span className="scene-sticker">{t("À TOI DE JOUER", "PRESS PLAY")}</span>
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
export function AuthChoiceLink({
  href,
  title,
  description,
  icon: Icon,
  tone = "sky",
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone?: "sky" | "lavender";
}) {
  return (
    <Link className="auth-choice" href={href}>
      <span className={`auth-choice-icon ${tone}`} aria-hidden="true">
        <Icon size={21} />
      </span>
      <span className="auth-choice-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <ArrowRight className="auth-choice-arrow" size={18} aria-hidden="true" />
    </Link>
  );
}
export function AuthGate({
  account = false,
  destination = "/",
  progress = false,
  children,
}: {
  account?: boolean;
  destination?: string;
  progress?: boolean;
  children?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const next = encodeURIComponent(destination);
  if (account)
    return (
      <section className="box account-access" aria-labelledby={titleId}>
        <div className="account-access-heading">
          <span className="account-access-mark" aria-hidden="true">
            <UsersRound size={29} />
          </span>
          <div>
            <p className="eyebrow">{t("Créer une salle", "Create a room")}</p>
            <h1 id={titleId}>
              {t("Un compte pour préparer ta course", "An account to prepare your race")}
            </h1>
          </div>
        </div>
        <p className="account-access-description">
          {t(
            "Connecte-toi ou crée un compte pour configurer ta salle et lancer la course.",
            "Sign in or create an account to set up your room and start the race.",
          )}
        </p>
        <div className="actions account-access-actions">
          <Link className="primary" href={`/connexion?next=${next}`}>
            <LogIn size={18} aria-hidden="true" />
            {t("Se connecter", "Sign in")}
          </Link>
          <Link className="subtle" href={`/inscription?next=${next}`}>
            <UserRoundPlus size={18} aria-hidden="true" />
            {t("Créer un compte", "Create an account")}
          </Link>
          {children}
        </div>
        <div className="account-access-footer">
          <p>{t("Tu veux simplement participer ?", "Just looking to join a race?")}</p>
          <Link className="ghost" href="/courses">
            {t("Voir les courses", "Find a race")}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  if (progress)
    return (
      <section className="box profile-access" aria-labelledby={titleId}>
        <div className="profile-access-intro">
          <span className="profile-access-mark" aria-hidden="true">
            <ChartNoAxesCombined size={29} />
          </span>
          <p className="eyebrow">{t("Mon progrès", "Your progress")}</p>
          <h1 id={titleId}>
            {t(
              "Retrouve tes courses et suis tes progrès.",
              "Your races. Your progress. Your space.",
            )}
          </h1>
          <p className="profile-access-description">
            {t(
              "Chaque course te donne de nouveaux repères pour trouver ton rythme.",
              "Every race gives you new insights to find your rhythm.",
            )}
          </p>
          <ul className="profile-access-benefits">
            <li>
              <History size={17} aria-hidden="true" />
              {t("Tes courses enregistrées", "Your saved races")}
            </li>
            <li>
              <Gauge size={17} aria-hidden="true" />
              {t("Ta vitesse et ta précision", "Your speed and accuracy")}
            </li>
            <li>
              <Keyboard size={17} aria-hidden="true" />
              {t("Tes touches à travailler", "Your keys to practise")}
            </li>
          </ul>
        </div>
        <div className="profile-access-options">
          <div className="profile-access-account">
            <div className="profile-access-option-heading">
              <span className="auth-choice-icon sky" aria-hidden="true">
                <UserRound size={22} />
              </span>
              <div>
                <h2>{t("Un compte pour progresser", "An account for your progress")}</h2>
                <p>
                  {t(
                    "Garde tes prochains résultats et retrouve-les à chaque connexion.",
                    "Keep your future results and find them whenever you sign in.",
                  )}
                </p>
              </div>
            </div>
            <div className="profile-access-actions">
              <Link className="primary" href={`/connexion?next=${next}`}>
                <LogIn size={18} aria-hidden="true" />
                {t("Se connecter", "Sign in")}
              </Link>
              <Link className="subtle" href={`/inscription?next=${next}`}>
                <UserRoundPlus size={18} aria-hidden="true" />
                {t("Créer un compte", "Create an account")}
              </Link>
            </div>
          </div>
          <AuthChoiceLink
            href={`/invite?next=${next}`}
            icon={UsersRound}
            tone="lavender"
            title={t("Jouer comme invité", "Play as a guest")}
            description={t(
              "Un pseudo suffit. Tes résultats restent liés à cette session.",
              "A nickname is enough. Your results stay with this session.",
            )}
          />
        </div>
      </section>
    );
  return (
    <Empty
      title={t("Choisis ton identité", "Choose your identity")}
      description={t(
        "Un pseudo suffit pour participer. Ton compte conserve tes résultats.",
        "A nickname is enough to join. Your account saves your results.",
      )}
    >
      <Link className="primary" href={`/connexion?next=${next}`}>
        {t("Se connecter", "Sign in")}
        <ArrowRight size={16} />
      </Link>
      <Link className="subtle" href={`/invite?next=${next}`}>
        {t("Continuer comme invité", "Continue as guest")}
      </Link>
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
