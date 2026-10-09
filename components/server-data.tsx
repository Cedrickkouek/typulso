import { connection } from "next/server";
import { Providers } from "./providers";
import { CoursesPage } from "./course-pages";
import { ProfilePage, ResultPage } from "./profile-pages";
import { initialSession, pageData, pageSession } from "@/lib/server/page-data";
import { listRooms, profile, storedResult } from "@/lib/server/rooms";

export async function SessionProvider({ children }: { children: React.ReactNode }) {
  return <Providers initialState={await initialSession()}>{children}</Providers>;
}
export async function CoursesContent() {
  // The public catalog must reflect this request, rather than a build-time database read.
  await connection();
  const initial = await pageData("/api/rooms", "", async () => ({ rooms: await listRooms() }));
  return <CoursesPage initial={initial} />;
}
export async function ProfileContent({ history = false }: { history?: boolean }) {
  const session = await pageSession();
  const initial = session
    ? await pageData("/api/profile", session.actorId, () => profile(session))
    : undefined;
  return <ProfilePage key={session?.actorId ?? "anonymous"} history={history} initial={initial} />;
}
export async function ResultContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await pageSession();
  const initial = session
    ? await pageData(`/api/results/${encodeURIComponent(id)}`, session.actorId, () =>
        storedResult(id, session),
      )
    : undefined;
  return <ResultPage key={`${id}:${session?.actorId ?? "anonymous"}`} id={id} initial={initial} />;
}
