import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { themes } from "@/db/schema";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { NewTemplateClient } from "./new-template-client";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

export default async function NewTemplatePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) redirect("/dashboard");

  const themeList = await db
    .select({
      id: themes.id,
      name: themes.name,
      productType: themes.productType,
      status: themes.status,
    })
    .from(themes)
    .orderBy(asc(themes.productType), asc(themes.name));

  return <NewTemplateClient themes={themeList} />;
}
