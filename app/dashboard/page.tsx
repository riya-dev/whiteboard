import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import WeeklyDashboardClient from "@/components/weekly-dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <WeeklyDashboardClient user={user} />
}
