import { Switch, Route, Router, useLocation } from "wouter";
import { useEffect } from "react";
import KnotProofPage from "@/pages/KnotProofPage";
import Privacy from "@/pages/Privacy";
import Support from "@/pages/Support";
import { useHashLocation } from "wouter/use-hash-location";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { WaterModeProvider } from "@/lib/waterModeContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Finder from "@/pages/Finder";
import HatchChart from "@/pages/HatchChart";
import SubscribeSuccess from "@/pages/SubscribeSuccess";
import Pricing from "@/pages/Pricing";
import Landing from "@/pages/Landing";
import MyTrips from "@/pages/MyTrips";
import TripKitDetail from "@/pages/TripKitDetail";
import Rigging from "@/pages/Rigging";
import Guides from "@/pages/Guides";
import FlyShops from "@/pages/FlyShops";
import Conservation from "@/pages/Conservation";
import Merch from "@/pages/Merch";
import ConditionsIntelligence from "@/pages/ConditionsIntelligence";
import CatchReport from "@/pages/CatchReport";
import OfflineBanner from "@/components/OfflineBanner";
import { TrialExpiredGate } from "@/components/TrialExpiredGate";
import { TrialCountdownBanner } from "@/components/TrialCountdownBanner";
import { PaywallModal } from "@/components/PaywallModal";

// Pages accessible even when trial has expired
const OPEN_PATHS = ["/", "/pricing", "/subscribe/success", "/privacy", "/support"];

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function AppRouter() {
  const { isExpired, loading } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);

  // Get current hash path to determine if we're on an open page
  const hashPath = window.location.hash.replace("#", "") || "/";
  const isOpenPage = OPEN_PATHS.some(p => hashPath === p || hashPath.startsWith(p + "/"));

  // Don't gate while auth is loading
  if (!loading && isExpired && !isOpenPage) {
    return <TrialExpiredGate />;
  }

  return (
    <>
      <ScrollToTop />
      <OfflineBanner />
      {/* Trial countdown banner — shows only when 4 or fewer days remain */}
      <TrialCountdownBanner onSubscribeClick={() => setShowPaywall(true)} />
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/support" component={Support} />
        <Route path="/home" component={Home} />
        <Route path="/finder" component={Finder} />
        <Route path="/finder/fly/:flyId" component={Finder} />
        <Route path="/hatch-chart" component={HatchChart} />
        <Route path="/hatch" component={HatchChart} />
        <Route path="/subscribe/success" component={SubscribeSuccess} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/trips" component={MyTrips} />
        <Route path="/trip-kit/:id" component={TripKitDetail} />
        <Route path="/rigging" component={Rigging} />
        <Route path="/guides" component={Guides} />
        <Route path="/fly-shops" component={FlyShops} />
        <Route path="/conservation" component={Conservation} />
        <Route path="/merch" component={Merch} />
        <Route path="/conditions" component={ConditionsIntelligence} />
        <Route path="/reports" component={CatchReport} />
        <Route path="/knot-proof" component={KnotProofPage} />
        <Route path="/knot-proof/:knotId" component={KnotProofPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WaterModeProvider>
          <TooltipProvider>
            <Toaster />
            <Router hook={useHashLocation}>
              <AppRouter />
            </Router>
          </TooltipProvider>
        </WaterModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
// TEMP proof route — delete after screenshot
