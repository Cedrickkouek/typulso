import type { Metadata } from "next";
import { Suspense } from "react";
import { SessionProvider } from "@/components/server-data";
import { Loading } from "@/components/ui";
import { AppShell } from "@/components/app-shell";
import "./globals.css";
import "./footer.css";
import "./race.css";
import "./results.css";

export const metadata: Metadata = {
  title: { default: "Typulso — les mots font la course", template: "%s · Typulso" },
  description: "Cours de frappe multijoueur, entraînement et progression. Les mots font la course.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <Suspense
          fallback={
            <main className="page-shell">
              <Loading />
            </main>
          }
        >
          <SessionProvider>
            <AppShell>{children}</AppShell>
          </SessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
