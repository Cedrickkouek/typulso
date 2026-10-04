import { Suspense } from "react";
import { JoinPage } from "@/components/entry-pages";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <JoinPage />
    </Suspense>
  );
}
