import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Header from "../components/ui/Header";
import BrandLogoCard from "../components/profile/BrandLogoCard";

export default function Settings() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <Header title="Preferences" onBack={() => navigate("/app/more")} />
      <div className="flex flex-col gap-4">
        <BrandLogoCard />
      </div>
    </AppShell>
  );
}
