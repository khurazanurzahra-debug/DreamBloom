import { Routes, Route, Navigate } from "react-router-dom";
import Launch from "./pages/Launch";
import VideoOnboarding from "./pages/VideoOnboarding";
import Profile from "./pages/Profile";
import OurBeginning from "./pages/OurBeginning";
import Home from "./pages/Home";
import Activity from "./pages/Activity";
import Goals from "./pages/Goals";
import More from "./pages/More";
import Categories from "./pages/Categories";
import ImportFiles from "./pages/ImportFiles";
import MonthlyAnalysis from "./pages/MonthlyAnalysis";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Launch />} />
      <Route path="/onboarding" element={<VideoOnboarding />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/our-beginning" element={<OurBeginning />} />
      <Route path="/app/home" element={<Home />} />
      <Route path="/app/activity" element={<Activity />} />
      <Route path="/app/goals" element={<Goals />} />
      <Route path="/app/more" element={<More />} />
      <Route path="/app/more/categories" element={<Categories />} />
      <Route path="/app/more/import" element={<ImportFiles />} />
      <Route path="/app/more/analysis" element={<MonthlyAnalysis />} />
      <Route path="/app/more/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
