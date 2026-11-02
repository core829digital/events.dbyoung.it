import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";
import { AuthForm } from "@/components/AuthForm";
import { SectionHeading } from "@/components/SectionHeading";
import { getSessionUser } from "@/lib/server/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Crea account — Eventi DBYoung" };

export default async function RegisterPage({
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
      <SectionHeading kicker={d.registerKicker} title={d.registerTitle} sub={d.registerSub} />
      <div className="mt-8">
        <AuthForm mode="register" lang={lang} next={next} />
      </div>
    </div>
  );
}
