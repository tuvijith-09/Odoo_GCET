import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("auth");

  if (isLoggedIn) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
