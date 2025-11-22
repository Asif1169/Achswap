
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SwapSettingsProps {
  open: boolean;
  onClose: () => void;
  slippage: number;
  onSlippageChange: (value: number) => void;
  deadline: number;
  onDeadlineChange: (value: number) => void;
  recipientAddress: string;
  onRecipientAddressChange: (value: string) => void;
  quoteRefreshInterval?: number;
  onQuoteRefreshIntervalChange?: (value: number) => void;
}

export function SwapSettings({
  open,
  onClose,
  slippage,
  onSlippageChange,
  deadline,
  onDeadlineChange,
  recipientAddress,
  onRecipientAddressChange,
  quoteRefreshInterval = 30,
  onQuoteRefreshIntervalChange,
}: SwapSettingsProps) {
  const [customSlippage, setCustomSlippage] = useState(slippage.toString());
  const [customDeadline, setCustomDeadline] = useState(deadline.toString());
  const [customRefreshInterval, setCustomRefreshInterval] = useState(quoteRefreshInterval.toString());

  const presetSlippages = [0.1, 0.5, 1.0];

  const handleSlippageChange = (value: string) => {
    setCustomSlippage(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      onSlippageChange(numValue);
    }
  };

  const handleDeadlineChange = (value: string) => {
    setCustomDeadline(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      onDeadlineChange(numValue);
    }
  };

  const handleRefreshIntervalChange = (value: string) => {
    setCustomRefreshInterval(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 5 && onQuoteRefreshIntervalChange) {
      onQuoteRefreshIntervalChange(numValue);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card/98 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-foreground">Swap Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">Customize your swap preferences</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Slippage Tolerance */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Slippage Tolerance (%)</Label>
            <div className="flex gap-2">
              {presetSlippages.map((preset) => (
                <Button
                  key={preset}
                  size="sm"
                  variant={slippage === preset ? "default" : "secondary"}
                  onClick={() => {
                    onSlippageChange(preset);
                    setCustomSlippage(preset.toString());
                  }}
                  className="flex-1"
                >
                  {preset}%
                </Button>
              ))}
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="Custom"
                value={customSlippage}
                onChange={(e) => handleSlippageChange(e.target.value)}
                className="pr-8 bg-muted/50 border-border/60 text-foreground placeholder:text-muted-foreground"
                min="0"
                max="50"
                step="0.1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>
            {slippage > 5 && (
              <p className="text-xs text-orange-400 bg-orange-500/10 p-2 rounded border border-orange-500/20">
                High slippage tolerance. Your transaction may be frontrun.
              </p>
            )}
          </div>

          {/* Transaction Deadline */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Transaction Deadline (minutes)</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="20"
                value={customDeadline}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                className="pr-16 bg-muted/50 border-border/60 text-foreground placeholder:text-muted-foreground"
                min="1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                minutes
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your transaction will revert if pending for more than this time.
            </p>
          </div>

          {/* Quote Refresh Interval */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Quote Refresh Interval (seconds)</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="30"
                value={customRefreshInterval}
                onChange={(e) => handleRefreshIntervalChange(e.target.value)}
                className="pr-16 bg-muted/50 border-border/60 text-foreground placeholder:text-muted-foreground"
                min="5"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                seconds
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              How often to refresh swap quotes automatically.
            </p>
          </div>

          {/* Send to Different Wallet */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Recipient Address (Optional)</Label>
            <Input
              type="text"
              placeholder="0x... (leave empty to send to your wallet)"
              value={recipientAddress}
              onChange={(e) => onRecipientAddressChange(e.target.value)}
              className="bg-muted/50 border-border/60 text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Send tokens to a different address after swap.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
