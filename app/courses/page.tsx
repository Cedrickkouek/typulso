import { Suspense } from "react";
import { CoursesContent } from "@/components/server-data";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <CoursesContent />
    </Suspense>
  );
}
