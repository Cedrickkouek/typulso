import { Suspense } from "react";
import { ResultContent } from "@/components/server-data";
import { Loading } from "@/components/ui";
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Loading />}>
      <ResultContent params={params} />
    </Suspense>
  );
}
