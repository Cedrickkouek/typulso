import { Suspense } from "react";
import { HomePage } from "@/components/entry-pages";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <HomePage />
    </Suspense>
  );
}
