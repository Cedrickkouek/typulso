import { Suspense } from "react";
import { ResultPage } from "@/components/profile-pages";
import { Loading } from "@/components/ui";
async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResultPage id={id} />;
}
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Loading />}>
      <Content params={params} />
    </Suspense>
  );
}
