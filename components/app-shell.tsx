"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Moon, Sun, Languages } from "lucide-react";
import { useSession, useTranslation } from "./providers";
import { updatePreferences } from "@/lib/client/preferences";
import { SiteFooter } from "./site-footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { t, theme, locale } = useTranslation();
  const { session } = useSession();
  const nav = [
    ["/", t("Jouer", "Play")],
    ["/entrainement", t("Entraînement", "Practice")],
    ["/profil", t("Mon progrès", "My progress")],
    ["/preferences", t("Préférences", "Preferences")],
  ];
  return (
    <>
      <a className="skip-link" href="#main">
        {t("Aller au contenu", "Skip to content")}
      </a>
      <header className="site-header">
        <Link className="brand" href="/" aria-label={t("Typulso — accueil", "Typulso — home")}>
          <Image src="/logo.svg" width={36} height={36} alt="" unoptimized />
          typulso<span className="visually-hidden">{t("Accueil", "Home")}</span>
        </Link>
        <nav className="site-nav" aria-label={t("Navigation principale", "Main navigation")}>
          {nav.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                path === href || (href === "/profil" && path === "/historique") ? "page" : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-tools">
          <button
            className="icon-button locale-button"
            onClick={() => updatePreferences({ locale: locale === "fr" ? "en" : "fr" })}
            aria-label={t("Switch interface to English", "Passer l’interface en français")}
          >
            <Languages size={16} />
            <span>{locale.toUpperCase()}</span>
          </button>
          <button
            className="icon-button"
            onClick={() => updatePreferences({ theme: theme === "light" ? "dark" : "light" })}
            aria-label={t(
              theme === "light" ? "Passer au thème sombre" : "Passer au thème clair",
              theme === "light" ? "Switch to dark theme" : "Switch to light theme",
            )}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Link className="subtle header-user" href={session?.user ? "/profil" : "/connexion"}>
            {session?.user?.username || t("Connexion", "Sign in")}
          </Link>
        </div>
      </header>
      <main className="page-shell" id="main">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
