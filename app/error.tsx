"use client";
import { useTranslation } from "@/components/providers";
import { Empty } from "@/components/ui";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Empty
      title={t("Une touche nous a échappé.", "We missed a key.")}
      description={t(
        "Cette page ne peut pas s’afficher pour le moment. Réessaie pour la recharger.",
        "This page cannot be displayed right now. Try again to reload it.",
      )}
    >
      <button className="primary" onClick={reset}>
        {t("Réessayer", "Try again")}
      </button>
      <Link className="subtle" href="/">
        {t("Accueil", "Home")}
      </Link>
    </Empty>
  );
}
