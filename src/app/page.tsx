import { verifySession } from "~/lib/session";
import LandingPage from "./_components/landing-page";

export default async function Page() {
  const session = await verifySession();

  return <LandingPage user={session} />;
}
