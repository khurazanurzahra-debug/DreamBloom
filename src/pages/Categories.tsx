import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Header from "../components/ui/Header";
import CategoryGrid from "../components/activity/CategoryGrid";

export default function Categories() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <Header
        title="Kategori"
        subtitle="Sesuaikan kategori agar mencerminkan cara kalian mengatur uang."
        onBack={() => navigate("/app/more")}
      />
      <CategoryGrid title="Semua Kategori" />
    </AppShell>
  );
}
