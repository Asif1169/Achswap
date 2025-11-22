
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
}: SwapSettingsProps) {
  const [customSlippage, setCustomSlippage] = useState(slippage.toString());
  const [customDeadline, setCustomDeadline] = useState(deadline.toString());

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

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Swap Settings</DialogTitle>
          <DialogDescription>Customize your swap preferences</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Slippage Tolerance */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Slippage Tolerance (%)</Label>
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
                className="pr-8"
                min="0"
                max="50"
                step="0.1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>
            {slippage > 5 && (
              <p className="text-xs text-orange-500">
                High slippage tolerance. Your transaction may be frontrun.
              </p>
            )}
          </div>

          {/* Transaction Deadline */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Transaction Deadline (minutes)</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="20"
                value={customDeadline}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                className="pr-16"
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

          {/* Send to Different Wallet */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Recipient Address (Optional)</Label>
            <Input
              type="text"
              placeholder="0x... (leave empty to send to your wallet)"
              value={recipientAddress}
              onChange={(e) => onRecipientAddressChange(e.target.value)}
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
