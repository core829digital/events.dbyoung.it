import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";
import { AuthForm } from "@/components/AuthForm";
import { SectionHeading } from "@/components/SectionHeading";
import { getSessionUser } from "@/lib/server/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Accedi — Eventi DBYoung" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, lang] = await Promise.all([searchParams, getLang()]);
  const user = await getSessionUser();
  if (user) redirect(typeof next === "string" && /^\/[a-z]/.test(next) ? next : "/account");
  const d = t(lang).authPage;
  return (
    <div className="w-full px-4 py-12 sm:px-6 sm:py-14 lg:px-10">
      <SectionHeading kicker={d.loginKicker} title={d.loginTitle} sub={d.loginSub} />
      <div className="mt-8">
        <AuthForm mode="login" lang={lang} next={next} />
      </div>
    </div>
  );
}
