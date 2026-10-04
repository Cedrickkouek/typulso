import { Suspense } from "react";
import { HelpPage } from "@/components/settings-pages";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <HelpPage keyboard />
    </Suspense>
  );
}
