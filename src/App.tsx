import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/auth";
import { Landing } from "@/pages/Landing";
import { Today } from "@/pages/Today";
import { History } from "@/pages/History";
import { Leaderboard } from "@/pages/Leaderboard";
import { Lessons } from "@/pages/Lessons";
import { TipJar } from "@/pages/TipJar";
import { About } from "@/pages/About";
import { Subscribe } from "@/pages/Subscribe";
import { Dashboard } from "@/pages/admin/Dashboard";
import { Postmortems } from "@/pages/admin/Postmortems";
import { Broker } from "@/pages/admin/Broker";
import { Control } from "@/pages/admin/Control";
import { Stock } from "@/pages/Stock";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-zinc-500">Loading…</p>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  if (loading) return <p className="text-zinc-500">Loading…</p>;
  if (!user) return <Navigate to="/" replace />;
  if (role !== "admin") return <Navigate to="/today" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/today" element={<RequireAuth><Today /></RequireAuth>} />
        <Route path="/history" element={<RequireAuth><History /></RequireAuth>} />
        <Route path="/leaderboard" element={<RequireAuth><Leaderboard /></RequireAuth>} />
        <Route path="/lessons" element={<RequireAdmin><Lessons /></RequireAdmin>} />
        <Route path="/tip-jar" element={<TipJar />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/stock/:symbol" element={<RequireAuth><Stock /></RequireAuth>} />
        <Route path="/about" element={<RequireAuth><About /></RequireAuth>} />
        <Route path="/admin" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
        <Route path="/admin/postmortems" element={<RequireAdmin><Postmortems /></RequireAdmin>} />
        <Route path="/admin/broker" element={<RequireAdmin><Broker /></RequireAdmin>} />
        <Route path="/admin/control" element={<RequireAdmin><Control /></RequireAdmin>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
