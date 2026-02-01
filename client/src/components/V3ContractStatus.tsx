import { useState, useEffect } from "react";
import { useChainId } from "wagmi";
import { BrowserProvider } from "ethers";
import { getContractsForChain } from "@/lib/contracts";
import { verifyV3Contracts } from "@/lib/contract-verification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";

export function V3ContractStatus() {
  const chainId = useChainId();
  const [status, setStatus] = useState<{
    checking: boolean;
    exists: boolean;
    missing: string[];
  }>({ checking: true, exists: false, missing: [] });

  useEffect(() => {
    const checkContracts = async () => {
      if (!chainId || !window.ethereum) return;

      try {
        const provider = new BrowserProvider(window.ethereum);
        const contracts = getContractsForChain(chainId);

        const result = await verifyV3Contracts(provider, contracts.v3);
        setStatus({
          checking: false,
          exists: result.exists,
          missing: result.missing,
        });
      } catch (error) {
        console.error("Error checking V3 contracts:", error);
        setStatus({
          checking: false,
          exists: false,
          missing: ["all"],
        });
      }
    };

    checkContracts();
  }, [chainId]);

  if (status.checking) {
    return (
      <Card className="bg-slate-900 border-slate-700 mb-4">
        <CardContent className="p-4">
          <p className="text-sm text-slate-400">Checking V3 contracts...</p>
        </CardContent>
      </Card>
    );
  }

  if (!status.exists) {
    return (
      <Card className="bg-red-500/10 border-red-500/20 mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-400">
            <AlertCircle className="h-4 w-4" />
            V3 Contracts Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-red-300 space-y-2">
          <p>The following V3 contracts could not be found on this network:</p>
          <ul className="list-disc list-inside space-y-1">
            {status.missing.map((contract) => (
              <li key={contract}>{contract}</li>
            ))}
          </ul>
          <p className="mt-2 text-yellow-400">
            ⚠️ V3 features will not work until contracts are deployed.
            Please verify the contract addresses in /app/client/src/lib/contracts.ts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-green-500/10 border-green-500/20 mb-4">
      <CardContent className="p-4">
        <p className="text-sm text-green-400 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          All V3 contracts verified on network
        </p>
      </CardContent>
    </Card>
  );
}
