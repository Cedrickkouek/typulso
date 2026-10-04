"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUpRight, CornerDownLeft, Gamepad2, Keyboard } from "lucide-react";
import { useTranslation } from "./providers";

export function SiteFooter() {
  const { t } = useTranslation();
  const path = usePathname();
  const compact =
    path === "/entrainement" ||
    (path.startsWith("/salles/") && path !== "/salles/nouvelle" && path.split("/").length === 3);
  const helpfulLinks = [
    { href: "/aide", label: t("Comment jouer", "How to play") },
    { href: "/touches", label: t("Clavier & accessibilité", "Keyboard & accessibility") },
    { href: "/preferences", label: t("Préférences", "Preferences") },
  ];

  if (compact) {
    return (
      <footer className="site-footer footer-refresh footer-refresh--compact">
        <div className="footer-refresh__compact-bar">
          <Link
            className="footer-refresh__compact-brand"
            href="/"
            aria-label={t("Typulso — accueil", "Typulso — home")}
          >
            <Image src="/logo.svg" width={28} height={28} alt="" unoptimized />
            typulso
          </Link>
          <nav aria-label={t("Aide pour jouer", "Playing help")}>
            <ul className="footer-refresh__compact-links">
              {helpfulLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    );
  }

  const groups = [
    {
      title: t("Jouer", "Play"),
      Icon: Gamepad2,
      tone: "pink",
      links: [
        { href: "/courses", label: t("Trouver une course", "Find a race") },
        { href: "/entrainement", label: t("S’entraîner", "Practice") },
        { href: "/profil", label: t("Mon progrès", "My progress") },
      ],
    },
    { title: t("Bien jouer", "Play your way"), Icon: Keyboard, tone: "sky", links: helpfulLinks },
  ];

  return (
    <footer className="site-footer footer-refresh">
      <div className="footer-refresh__panel">
        <div className="footer-refresh__ribbon">
          <p>{t("La prochaine manche commence ici.", "Your next round starts here.")}</p>
          <div className="footer-refresh__key-trail" aria-hidden="true">
            <span className="footer-refresh__trail-line" />
            <span className="footer-refresh__keycap" data-tone="pink">
              a
            </span>
            <span className="footer-refresh__keycap" data-tone="lavender">
              z
            </span>
            <span className="footer-refresh__keycap footer-refresh__keycap--enter" data-tone="sky">
              <CornerDownLeft size={28} />
            </span>
          </div>
        </div>
        <div className="footer-refresh__main">
          <div className="footer-refresh__identity">
            <Link
              className="footer-refresh__brand"
              href="/"
              aria-label={t("Typulso — accueil", "Typulso — home")}
            >
              <Image src="/logo.svg" width={56} height={56} alt="" unoptimized />
              <span>typulso</span>
            </Link>
            <p className="footer-refresh__tagline">
              {t("Les mots font la course.", "Words on the move.")}
            </p>
            <p className="footer-refresh__description">
              {t(
                "Le plaisir de jouer. Le rythme de progresser.",
                "The joy of playing. The rhythm of improving.",
              )}
            </p>
          </div>
          <nav
            className="footer-refresh__navigation"
            aria-label={t("Navigation de bas de page", "Footer navigation")}
          >
            {groups.map(({ title, Icon, tone, links }) => (
              <div className="footer-refresh__group" key={tone}>
                <h2>
                  <span className="footer-refresh__group-icon" data-tone={tone} aria-hidden="true">
                    <Icon size={20} />
                  </span>
                  {title}
                </h2>
                <ul>
                  {links.map(({ href, label }) => (
                    <li key={href}>
                      <Link className="footer-refresh__link" href={href}>
                        <span>{label}</span>
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="footer-refresh__bottom">
          <p className="footer-refresh__note">
            <span aria-hidden="true">
              <Keyboard size={17} />
            </span>
            {t("Ensemble, une touche à la fois.", "Together, one key at a time.")}
          </p>
          <Link className="footer-refresh__play" href="/courses">
            {t("Retour sur la piste", "Back to the track")}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
