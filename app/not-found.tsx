"use client";
import Link from "next/link";
import { Empty } from "@/components/ui";
import { useTranslation } from "@/components/providers";
export default function NotFound() {
  const { t } = useTranslation();
  return (
    <Empty
      symbol="404"
      title={t("Cette piste n’existe pas.", "This track does not exist.")}
      description={t(
        "Le lien est peut-être incomplet. Retrouve une course depuis l’accueil.",
        "This link may be incomplete. Find a race from the home page.",
      )}
    >
      <Link className="primary" href="/">
        {t("Retour à l’accueil", "Back home")}
      </Link>
      <Link className="subtle" href="/courses">
        {t("Voir les courses", "View races")}
      </Link>
    </Empty>
  );
}
