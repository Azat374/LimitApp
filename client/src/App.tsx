//import React from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/Theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Plot from "./pages/Plot";
import Settings from "./pages/Settings";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Tasks from "./pages/Tasks";
import SolutionChecker from "./pages/SolutionChecker";
import IntegralSolutionChecker from "./pages/IntegralSolutionChecker";
import Reports from "./pages/Reports";
import Docs from "./pages/Docs";
import TermsAndConditions from "./pages/TermsAndConditions";
import WorldChat from "./pages/WorldChat";
import Profile from "@/components/Profile/Profile";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/plot" element={<Plot />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/solution/:taskId" element={<SolutionChecker />} />
        <Route path="//solution_integral/:taskId" element={<IntegralSolutionChecker />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/worldchat" element={<WorldChat />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/admin" element={<div>Admin Panel (to be implemented)</div>} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
};

export default App;
