import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

// 기본 로케일(ko)로 redirect
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
