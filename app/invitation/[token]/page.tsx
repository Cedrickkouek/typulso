import { Suspense } from "react";
import { InvitationPage } from "@/components/entry-pages";
import { Loading } from "@/components/ui";
async function Content({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <InvitationPage token={token} />;
}
export default function Page({ params }: { params: Promise<{ token: string }> }) {
  return (
    <Suspense fallback={<Loading />}>
      <Content params={params} />
    </Suspense>
  );
}
