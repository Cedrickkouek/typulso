import { Suspense } from "react";
import { ProfileContent } from "@/components/server-data";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileContent history />
    </Suspense>
  );
}
