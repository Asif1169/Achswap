import { useState, useEffect } from "react";
import { useChainId } from "wagmi";
import { BrowserProvider } from "ethers";
import { getContractsForChain } from "@/lib/contracts";
import { verifyV3Contracts } from "@/lib/contract-verification";
import { useV3Status } from "@/lib/v3-status-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function V3ContractStatus() {
  const chainId = useChainId();
  const { setV3Available } = useV3Status();
  const [status, setStatus] = useState<{
    checking: boolean;
    exists: boolean;
    missing: string[];
    details: Record<string, boolean>;
  }>({ checking: true, exists: false, missing: [], details: {} });

  const checkContracts = async () => {
    if (!chainId || !window.ethereum) return;

    setStatus(prev => ({ ...prev, checking: true }));

    try {
      const provider = new BrowserProvider(window.ethereum);
      const contracts = getContractsForChain(chainId);

      const result = await verifyV3Contracts(provider, contracts.v3);
      setStatus({
        checking: false,
        exists: result.exists,
        missing: result.missing,
        details: result.details,
      });
      
      // Update global V3 availability status
      setV3Available(result.exists);
    } catch (error) {
      console.error("Error checking V3 contracts:", error);
      setStatus({
        checking: false,
        exists: false,
        missing: ["Unable to verify contracts"],
        details: {},
      });
      setV3Available(false);
    }
  };

  useEffect(() => {
    checkContracts();
  }, [chainId]);

  if (status.checking) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 mb-4">
        <CardContent className="p-4">
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            Checking V3 contracts...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!status.exists) {
    return (
      <Card className="bg-red-500/10 border-red-500/30 mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-400">
            <XCircle className="h-5 w-5" />
            V3 Contracts Not Found on ARC Testnet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-red-300 space-y-2">
            <p className="font-medium">Missing contracts:</p>
            <ul className="list-disc list-inside space-y-1 text-red-200/80">
              {status.missing.map((contract, index) => (
                <li key={index} className="break-all">{contract}</li>
              ))}
            </ul>
          </div>
          
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-300">
            <p className="font-semibold mb-1">⚠️ V3 Features Disabled</p>
            <p>V3 swap, liquidity, and migration will not work until contracts are deployed.</p>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300">
            <p className="font-semibold mb-1">💡 Solutions:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Deploy Uniswap V3 contracts to ARC Testnet</li>
              <li>Provide correct V3 contract addresses</li>
              <li>Use V2 features (working correctly)</li>
            </ul>
          </div>

          <Button
            onClick={checkContracts}
            variant="outline"
            size="sm"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            Re-check Contracts
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-green-500/10 border-green-500/30 mb-4">
      <CardContent className="p-4">
        <p className="text-sm text-green-400 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          All V3 contracts verified on ARC Testnet
        </p>
      </CardContent>
    </Card>
  );
}
