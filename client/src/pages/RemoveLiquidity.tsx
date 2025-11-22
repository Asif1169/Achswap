import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowDown } from "lucide-react";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";

export default function RemoveLiquidity() {
  const [percentage, setPercentage] = useState([25]);
  const [isRemoving, setIsRemoving] = useState(false);
  
  const { isConnected } = useAccount();
  const { toast } = useToast();

  const handleRemoveLiquidity = async () => {
    setIsRemoving(true);
    try {
      // TODO: Implement actual liquidity removal with smart contract
      toast({
        title: "Removing liquidity",
        description: `Removing ${percentage[0]}% of your liquidity`,
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Liquidity removed",
        description: `Successfully removed ${percentage[0]}% of your liquidity`,
      });
      
      setPercentage([25]);
    } catch (error: any) {
      toast({
        title: "Failed to remove liquidity",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card className="border-card-border">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold">Remove Liquidity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Remove liquidity to receive tokens back
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Amount to remove</label>
              <span className="text-2xl font-bold text-primary">{percentage[0]}%</span>
            </div>
            
            <Slider
              data-testid="slider-remove-percentage"
              value={percentage}
              onValueChange={setPercentage}
              max={100}
              step={1}
              className="py-4"
            />
            
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((value) => (
                <Button
                  key={value}
                  data-testid={`button-percentage-${value}`}
                  size="sm"
                  variant={percentage[0] === value ? "default" : "secondary"}
                  onClick={() => setPercentage([value])}
                  className="flex-1"
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Your position</p>
            <div className="flex items-center justify-between">
              <span className="text-sm">LP Tokens</span>
              <span className="font-medium">0.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pool share</span>
              <span className="font-medium">0%</span>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">You will receive</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-background" />
                  <span className="text-sm font-medium">Token A</span>
                </div>
                <span className="font-medium tabular-nums">0.00</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-background" />
                  <span className="text-sm font-medium">Token B</span>
                </div>
                <span className="font-medium tabular-nums">0.00</span>
              </div>
            </div>
          </div>

          {isConnected ? (
            <Button
              data-testid="button-remove-liquidity"
              onClick={handleRemoveLiquidity}
              disabled={isRemoving}
              className="w-full h-14 text-base font-semibold"
            >
              {isRemoving ? "Removing Liquidity..." : "Remove Liquidity"}
            </Button>
          ) : (
            <Button
              data-testid="button-connect-wallet"
              disabled
              className="w-full h-14 text-base font-semibold"
            >
              Connect Wallet
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Removing liquidity will return your tokens and any earned fees
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
