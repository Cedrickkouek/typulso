import { Suspense } from "react";
import { PreferencesPage } from "@/components/settings-pages";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PreferencesPage />
    </Suspense>
  );
}
