import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RemoveLiquidityV2 } from "@/components/RemoveLiquidityV2";
import { RemoveLiquidityV3 } from "@/components/RemoveLiquidityV3";

export default function RemoveLiquidity() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold text-center">
            Remove Liquidity
          </CardTitle>
          <p className="text-center text-slate-400 text-sm mt-2">
            Withdraw your liquidity from pools
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="v2" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="v2">V2</TabsTrigger>
              <TabsTrigger value="v3">V3</TabsTrigger>
            </TabsList>

            <TabsContent value="v2">
              <RemoveLiquidityV2 />
            </TabsContent>

            <TabsContent value="v3">
              <RemoveLiquidityV3 />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
