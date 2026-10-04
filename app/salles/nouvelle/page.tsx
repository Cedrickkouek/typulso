import { Suspense } from "react";
import { CreatePage } from "@/components/course-pages";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <CreatePage />
    </Suspense>
  );
}
