"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  CodeXml,
  LogIn,
  UserRoundPlus,
  Users,
  UsersRound,
  Zap,
  Keyboard,
} from "lucide-react";
import { useSession, useTranslation } from "./providers";
import { errorMessage } from "@/lib/i18n/errors";
import { api, safeDestination } from "@/lib/client/api";
import { command, disconnectRealtime } from "@/lib/client/realtime";
import { AuthChoiceLink, AuthGate, ErrorNotice, Field, Heading, KeyScene, Loading } from "./ui";

function JoinForm({ colorful = false }: { colorful?: boolean }) {
  const { t, locale } = useTranslation();
  const { session } = useSession();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function join(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const normalized = code.replace(/\s/g, "").toUpperCase();
    if (!normalized) return setError(t("Entre le code de ta salle.", "Enter your room code."));
    if (!session?.user)
      return router.push(`/invite?next=${encodeURIComponent(`/rejoindre?code=${normalized}`)}`);
    setBusy(true);
    try {
      const response = await command("join", { code: normalized });
      router.push(`/salles/${response.data.room.id}`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className={colorful ? "join-card" : "box form-box"} onSubmit={join}>
      <p className="eyebrow">{t("Ta place t’attend", "Your place is waiting")}</p>
      <h2>{t("Un code. Et c’est parti.", "One code. Let’s go.")}</h2>
      <p className="small">
        {t("Retrouve ton groupe et entre dans la course.", "Meet your group and join the race.")}
      </p>
      <Field
        id="room-code"
        label={t("Code de la salle", "Room code")}
        note={t(
          "Le code est fourni par l’hôte. Pour une salle privée, utilise ton invitation.",
          "Your host provides the code. Use your invitation for a private room.",
        )}
      >
        <input
          id="room-code"
          className="join-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={16}
          placeholder="K7M2PX"
          aria-describedby="room-code-note"
          aria-invalid={!!error}
        />
      </Field>
      {error && (
        <p className="form-error" role="alert">
          {errorMessage(error, locale)}
        </p>
      )}
      <button className="primary full" disabled={busy}>
        {busy ? t("Connexion…", "Connecting…") : t("Rejoindre la course", "Join the race")}
        <ArrowRight size={18} />
      </button>
      <div className="join-divider" />
      <Link className="subtle full" href="/salles/nouvelle">
        {t("Créer ma salle", "Create my room")}
      </Link>
    </form>
  );
}
export function HomePage() {
  const { t } = useTranslation();
  return (
    <>
      <section className="home-hero">
        <div className="home-intro">
          <p className="eyebrow">{t("Chaque touche compte", "Every key counts")}</p>
          <h1>
            {t("Les mots font", "Words on")}
            <br />
            <span>{t("la course.", "the move.")}</span>
          </h1>
          <p className="page-lead">
            {t(
              "Retrouve ton groupe, défie tes amis et trouve ton rythme. Une course de frappe qui donne envie de recommencer.",
              "Meet your group, challenge your friends and find your rhythm. A typing race that makes you want another round.",
            )}
          </p>
          <div className="hero-bottom">
            <div className="hero-actions">
              <div className="actions">
                <Link className="primary" href="/courses">
                  {t("Trouver une course", "Find a race")}
                  <ArrowRight size={18} />
                </Link>
                <Link className="ghost" href="/entrainement">
                  {t("M’échauffer", "Warm up")}
                </Link>
              </div>
              <div className="hero-marks">
                <span>
                  <Users size={15} />
                  {t("Ensemble, en direct", "Together, live")}
                </span>
                <span>
                  <Keyboard size={15} />
                  {t("Ton talent, ton rythme", "Your skill, your rhythm")}
                </span>
              </div>
            </div>
            <div className="hero-playground">
              <KeyScene />
            </div>
          </div>
        </div>
        <JoinForm colorful />
      </section>
      <div className="cards-grid">
        {[
          {
            icon: <Users />,
            title: t("Rassemble ta bande", "Bring your people"),
            copy: t(
              "Une salle publique, un code ou une invitation privée. Chacun trouve sa place.",
              "A public room, a code or a private invitation. Everyone has a place.",
            ),
            color: "var(--pink)",
          },
          {
            icon: <Zap />,
            title: t("Classique ou arcade", "Classic or arcade"),
            copy: t(
              "Concentre-toi sur ta frappe ou choisis une capacité pour pimenter la course.",
              "Focus on your typing or choose an ability to spice up your race.",
            ),
            color: "var(--accent)",
          },
          {
            icon: <Keyboard />,
            title: t("Trouve ton rythme", "Find your rhythm"),
            copy: t(
              "Vitesse, précision et touches à travailler. Ta progression commence par une course.",
              "Speed, accuracy and keys to practice. Your progress starts with a race.",
            ),
            color: "var(--sky)",
          },
        ].map((item, index) => (
          <section className="box feature-card" key={item.title}>
            <div className="feature-number">
              <span>0{index + 1}</span>
              <span className="avatar" style={{ "--avatar": item.color } as React.CSSProperties}>
                {item.icon}
              </span>
            </div>
            <h2>{item.title}</h2>
            <p className="small">{item.copy}</p>
          </section>
        ))}
      </div>
    </>
  );
}
export function JoinPage() {
  const query = useSearchParams();
  return (
    <JoinPageContent key={query.get("code") || "empty"} initialCode={query.get("code") || ""} />
  );
}
function JoinPageContent({ initialCode }: { initialCode: string }) {
  const { t } = useTranslation();
  const { session, loading } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function join() {
    setBusy(true);
    setError(null);
    try {
      const response = await command("join", { code: initialCode });
      router.replace(`/salles/${response.data.room.id}`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title={t("Entre dans la course", "Join the race")}
        description={t(
          "Un code suffit pour retrouver ton groupe.",
          "One code is enough to meet your group.",
        )}
      />
      {initialCode ? (
        loading ? (
          <Loading />
        ) : !session?.user ? (
          <AuthGate destination={`/rejoindre?code=${encodeURIComponent(initialCode)}`} />
        ) : (
          <div className="box form-box">
            <h2>{initialCode}</h2>
            <p>{t("Prêt à rejoindre cette salle ?", "Ready to join this room?")}</p>
            {error && <ErrorNotice message={error} />}
            <button className="primary" disabled={busy} onClick={join}>
              {t("Rejoindre", "Join")}
            </button>
            <Link className="ghost" href="/rejoindre">
              {t("Autre code", "Another code")}
            </Link>
          </div>
        )
      ) : (
        <JoinForm />
      )}
    </>
  );
}
export function AuthPage({ mode }: { mode: "login" | "register" | "guest" }) {
  const { t } = useTranslation();
  const { session, refresh } = useSession();
  const query = useSearchParams();
  const router = useRouter();
  const destination = safeDestination(query.get("next"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guest = mode === "guest",
    register = mode === "register";
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api(
        `/api/auth/${guest ? "guest" : register ? "register" : "login"}`,
        guest ? { username: username.trim() } : { username: username.trim(), password },
      );
      disconnectRealtime();
      await refresh();
      router.push(destination);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const title = guest
    ? t("Ton pseudo, et on joue.", "Your nickname. Let’s play.")
    : register
      ? t("Ta prochaine course commence ici.", "Your next race starts here.")
      : t("On reprend la course ?", "Ready for another race?");
  return (
    <div className="auth-layout">
      <section className="auth-story">
        <p className="eyebrow">{t("Bienvenue dans le rythme", "Welcome to the rhythm")}</p>
        <h1>{title}</h1>
        <p className="page-lead">
          {guest
            ? t(
                "Participe sans créer de compte. Tes statistiques restent liées à cette session invitée.",
                "Join without creating an account. Your statistics stay with this guest session.",
              )
            : t(
                "Tes courses, tes progrès et ta bande. Retrouve tout avec ton compte.",
                "Your races, your progress and your people. Keep them together with your account.",
              )}
        </p>
        <KeyScene />
      </section>
      <form className="box auth-card" onSubmit={submit}>
        <h2>
          {guest
            ? t("Participer comme invité", "Join as a guest")
            : register
              ? t("Créer mon compte", "Create my account")
              : t("Connexion", "Sign in")}
        </h2>
        {!guest && !register && (
          <>
            <div className="auth-options">
              {session?.oauth.github && (
                <a
                  className="subtle provider-button"
                  href={`/api/auth/oauth/github?next=${encodeURIComponent(destination)}`}
                >
                  <CodeXml size={20} />
                  {t("Continuer avec GitHub", "Continue with GitHub")}
                </a>
              )}
              {session?.oauth.discord && (
                <a
                  className="subtle provider-button"
                  href={`/api/auth/oauth/discord?next=${encodeURIComponent(destination)}`}
                >
                  <Users size={20} />
                  {t("Continuer avec Discord", "Continue with Discord")}
                </a>
              )}
            </div>
            {(session?.oauth.github || session?.oauth.discord) && (
              <div className="divider-label">
                {t("ou avec ton compte local", "or with your local account")}
              </div>
            )}
          </>
        )}
        <Field
          id="username"
          label={t("Pseudo", "Nickname")}
          note={t(
            "De 3 à 24 caractères : lettres, chiffres, _ ou -.",
            "3 to 24 characters: letters, numbers, _ or -.",
          )}
        >
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            maxLength={24}
            pattern={String.raw`[\p{L}\p{N}_\-]{3,24}`}
            required
            autoComplete="username"
            aria-describedby="username-note"
          />
        </Field>
        {!guest && (
          <Field
            id="password"
            label={t("Mot de passe", "Password")}
            note={register ? t("Au moins 10 caractères.", "At least 10 characters.") : undefined}
          >
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              maxLength={128}
              minLength={register ? 10 : 1}
              autoComplete={register ? "new-password" : "current-password"}
            />
          </Field>
        )}
        {error && <ErrorNotice message={error} />}
        <button className="primary full" disabled={busy}>
          {busy
            ? t("Un instant…", "One moment…")
            : guest
              ? t("C’est parti", "Let’s go")
              : register
                ? t("Créer mon compte", "Create my account")
                : t("Se connecter", "Sign in")}
          <ArrowRight size={17} />
        </button>
        <nav
          className="auth-alternatives"
          aria-label={t("Autres façons de participer", "Other ways to join")}
        >
          <AuthChoiceLink
            href={`/${register || guest ? "connexion" : "inscription"}?next=${encodeURIComponent(destination)}`}
            icon={register || guest ? LogIn : UserRoundPlus}
            title={
              register || guest
                ? t("J’ai déjà un compte", "I have an account")
                : t("Créer un compte", "Create an account")
            }
            description={
              register || guest
                ? t(
                    "Retrouve tes courses et tes résultats enregistrés.",
                    "Find your saved races and results.",
                  )
                : t(
                    "Conserve tes courses et suis tes progrès.",
                    "Save your races and follow your progress.",
                  )
            }
          />
          {!guest && (
            <AuthChoiceLink
              href={`/invite?next=${encodeURIComponent(destination)}`}
              icon={UsersRound}
              tone="lavender"
              title={t("Participer comme invité", "Continue as guest")}
              description={t(
                "Entre dans la course avec un pseudo, sans compte.",
                "Join a race with a nickname, without an account.",
              )}
            />
          )}
        </nav>
      </form>
    </div>
  );
}
export function InvitationPage({ token }: { token: string }) {
  const { t } = useTranslation();
  const { session, loading } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const destination = `/invitation/${encodeURIComponent(token)}`;
  async function accept() {
    setBusy(true);
    setError(null);
    try {
      const response = await command("join", { invitation: token });
      router.push(`/salles/${response.data.room.id}`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title={t("Une invitation pour toi.", "An invitation for you.")}
        description={t(
          "Ce lien individuel ouvre une salle privée. Accepte-le pour rejoindre le groupe.",
          "This individual link opens a private room. Accept it to join the group.",
        )}
      />
      {loading ? (
        <Loading />
      ) : !session?.user ? (
        <AuthGate destination={destination} />
      ) : (
        <div className="box form-box">
          <p className="eyebrow">{t("Salle privée", "Private room")}</p>
          <h2>{t("Ta place est prête", "Your place is ready")}</h2>
          <p className="small">
            {t(
              "L’invitation est à usage unique. Une fois accepté, ton accès reste lié à ta participation pour la reconnexion.",
              "This invitation is single use. Once accepted, your access stays linked to your participation for reconnecting.",
            )}
          </p>
          {error && <ErrorNotice message={error} />}
          <div className="actions">
            <button className="primary" disabled={busy} onClick={accept}>
              {t("Accepter l’invitation", "Accept invitation")}
              <ArrowRight size={17} />
            </button>
            <Link className="ghost" href="/">
              {t("Plus tard", "Later")}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
