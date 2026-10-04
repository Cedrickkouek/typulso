import { Suspense } from "react";
import { CoursesPage } from "@/components/course-pages";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <CoursesPage />
    </Suspense>
  );
}
