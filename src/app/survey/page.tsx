import { verifySession } from "~/lib/session";
import SurveyForm from "./survey-form";

export default async function SurveyPage() {
  const user = await verifySession();

  return <SurveyForm user={user} />;
}
