import { createClient } from "@/lib/supabase/server"
import GenerateClient from "@/components/generate/GenerateClient"

export const metadata = { title: "Generate – ShelfReady" }

export default async function GeneratePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <GenerateClient userId={user?.id ?? ""} />
}
