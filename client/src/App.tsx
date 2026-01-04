import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { RAGProvider } from "./contexts/RAGContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import SearchPage from "./pages/Search";
import StructuralBoltsPage from "./pages/structural-bolts";
import StainlessFastenersPage from "./pages/stainless-fasteners";
import QuotePage from "./pages/Quote";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/search"} component={SearchPage} />
      <Route path={"/structural-bolts"} component={StructuralBoltsPage} />
      <Route path={"/stainless-fasteners"} component={StainlessFastenersPage} />
      <Route path={"/quote"} component={QuotePage} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <RAGProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </RAGProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
