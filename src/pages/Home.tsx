import AppShell from "../components/layout/AppShell";
import HomeHeader from "../components/home/HomeHeader";
import FinancialSummaryCard from "../components/home/FinancialSummaryCard";
import PersonalReminder from "../components/home/PersonalReminder";
import TodayBudget from "../components/home/TodayBudget";
import GrowingTogether from "../components/home/GrowingTogether";
import ForTheLittleOne from "../components/home/ForTheLittleOne";
import RecentTransactions from "../components/home/RecentTransactions";
import QuickActions from "../components/home/QuickActions";

export default function Home() {
  return (
    <AppShell>
      <HomeHeader />

      <FinancialSummaryCard />
      <GrowingTogether />
      <ForTheLittleOne />
      <TodayBudget />
      <RecentTransactions />
      <QuickActions />

      <PersonalReminder />
    </AppShell>
  );
}
