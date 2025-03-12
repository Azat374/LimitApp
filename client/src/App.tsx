import Home from "./pages/Home";
import { ThemeProvider } from '@/components/Theme/theme-provider'
import { Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner"
import Landing from "./pages/Landing";
import SolutionChecker from "./pages/SolutionChecker";


const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/check" element={<SolutionChecker />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
};

export default App;
