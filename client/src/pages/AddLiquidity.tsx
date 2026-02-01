import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { V3ContractStatus } from "@/components/V3ContractStatus";
import { AddLiquidityV2 } from "@/components/AddLiquidityV2";
import { AddLiquidityV3Basic } from "@/components/AddLiquidityV3Basic";
import { AddLiquidityV3Advanced } from "@/components/AddLiquidityV3Advanced";
import { MigrateV2ToV3 } from "@/components/MigrateV2ToV3";

export default function AddLiquidity() {
  const [v2SubTab, setV2SubTab] = useState<"add" | "migrate">("add");
  const [v3SubTab, setV3SubTab] = useState<"basic" | "advanced">("basic");

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold text-center">
            Add Liquidity
          </CardTitle>
          <p className="text-center text-slate-400 text-sm mt-2">
            Provide liquidity to earn trading fees
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="v2" className="w-full">
            {/* Main Protocol Tabs */}
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="v2">V2</TabsTrigger>
              <TabsTrigger value="v3">V3</TabsTrigger>
            </TabsList>

            {/* V2 Content */}
            <TabsContent value="v2" className="space-y-4">
              {/* V2 Sub-tabs */}
              <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
                <button
                  onClick={() => setV2SubTab("add")}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    v2SubTab === "add"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Add LP
                </button>
                <button
                  onClick={() => setV2SubTab("migrate")}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    v2SubTab === "migrate"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Migrate to V3
                </button>
              </div>

              {/* V2 Sub-content */}
              {v2SubTab === "add" && <AddLiquidityV2 />}
              {v2SubTab === "migrate" && <MigrateV2ToV3 />}
            </TabsContent>

            {/* V3 Content */}
            <TabsContent value="v3" className="space-y-4">
              {/* V3 Sub-tabs */}
              <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
                <button
                  onClick={() => setV3SubTab("basic")}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    v3SubTab === "basic"
                      ? "bg-purple-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Basic (Safe)
                </button>
                <button
                  onClick={() => setV3SubTab("advanced")}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    v3SubTab === "advanced"
                      ? "bg-purple-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Advanced (Pro)
                </button>
              </div>

              {/* V3 Sub-content */}
              {v3SubTab === "basic" && <AddLiquidityV3Basic />}
              {v3SubTab === "advanced" && <AddLiquidityV3Advanced />}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
