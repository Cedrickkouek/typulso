import { Suspense } from "react";
import { PracticePage } from "@/components/practice-page";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PracticePage />
    </Suspense>
  );
}
