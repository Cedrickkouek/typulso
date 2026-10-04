import { Suspense } from "react";
import { AuthPage } from "@/components/entry-pages";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthPage mode="login" />
    </Suspense>
  );
}
