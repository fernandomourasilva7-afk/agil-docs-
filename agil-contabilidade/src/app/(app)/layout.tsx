import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TrialExpiredModal from "@/components/TrialExpiredModal";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: contador } = await supabase
    .from('contadores')
    .select('plano, created_at')
    .eq('id', user.id)
    .single()

  const trialExpirado =
    contador?.plano === 'free' &&
    contador?.created_at != null &&
    (Date.now() - new Date(contador.created_at).getTime()) > 30 * 24 * 60 * 60 * 1000

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-56 pt-14 lg:pt-0 min-h-screen">
        {children}
      </div>
      {trialExpirado && <TrialExpiredModal />}
    </div>
  );
}
