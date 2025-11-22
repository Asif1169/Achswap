import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { queryClient } from "./lib/queryClient";
import { config } from "./lib/wagmi";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import Swap from "@/pages/Swap";
import AddLiquidity from "@/pages/AddLiquidity";
import RemoveLiquidity from "@/pages/RemoveLiquidity";
import NotFound from "@/pages/not-found";

import "@rainbow-me/rainbowkit/styles.css";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Swap} />
      <Route path="/add-liquidity" component={AddLiquidity} />
      <Route path="/remove-liquidity" component={RemoveLiquidity} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#2563eb',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          <TooltipProvider>
            <div className="min-h-screen bg-background">
              <Header />
              <main className="pb-12">
                <Router />
              </main>
            </div>
            <Toaster />
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
