import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits, isAddress } from "ethers";
import type { Token } from "@shared/schema";

interface TokenSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  tokens: Token[];
  onImport?: (address: string) => Promise<Token | null>;
}

export function TokenSelector({ open, onClose, onSelect, tokens, onImport }: TokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const { address: userAddress } = useAccount();

  const filteredTokens = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return tokens;
    
    return tokens.filter(token =>
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query)
    );
  }, [tokens, searchQuery]);

  const isValidAddress = searchQuery.trim() && isAddress(searchQuery.trim());
  const showImportButton = isValidAddress && !filteredTokens.find(t => t.address.toLowerCase() === searchQuery.trim().toLowerCase());

  const handleImport = async () => {
    if (!onImport || !searchQuery.trim()) return;
    
    setIsImporting(true);
    setImportError("");
    
    try {
      const token = await onImport(searchQuery.trim());
      if (token) {
        onSelect(token);
        setSearchQuery("");
      }
    } catch (error: any) {
      setImportError(error.message || "Failed to import token");
    } finally {
      setIsImporting(false);
    }
  };

  const handleSelect = (token: Token) => {
    onSelect(token);
    setSearchQuery("");
    setImportError("");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Select a token</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="input-token-search"
            placeholder="Search name or paste address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {importError && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            {importError}
          </div>
        )}

        {showImportButton && (
          <div className="border border-warning/20 bg-warning/5 rounded-md p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium text-sm">Import token</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This token doesn't appear in the active token list. Make sure this is the token you want to trade.
                </p>
              </div>
            </div>
            <Button 
              data-testid="button-import-token"
              onClick={handleImport} 
              disabled={isImporting}
              className="w-full"
            >
              {isImporting ? "Importing..." : "Import Token"}
            </Button>
          </div>
        )}

        <ScrollArea className="h-[400px] -mx-6 px-6">
          <div className="space-y-1">
            {filteredTokens.length === 0 && !showImportButton ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No tokens found</p>
              </div>
            ) : (
              filteredTokens.map((token) => (
                <TokenRow
                  key={token.address}
                  token={token}
                  userAddress={userAddress}
                  onClick={() => handleSelect(token)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function TokenRow({ token, userAddress, onClick }: { token: Token; userAddress?: string; onClick: () => void }) {
  const { data: balance } = useBalance({
    address: userAddress as `0x${string}` | undefined,
    token: token.address as `0x${string}`,
  });

  const formattedBalance = balance ? formatUnits(balance.value, balance.decimals) : "0.00";
  const displayBalance = parseFloat(formattedBalance).toFixed(6);

  return (
    <button
      data-testid={`button-select-token-${token.symbol}`}
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-md hover-elevate active-elevate-2 text-left"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
          {token.logoURI ? (
            <img src={token.logoURI} alt={token.symbol} className="w-full h-full object-cover" />
          ) : (
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-base">{token.symbol}</span>
            {token.verified && (
              <CheckCircle2 className="h-4 w-4 text-verified" data-testid={`icon-verified-${token.symbol}`} />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{token.name}</p>
        </div>
      </div>
      {userAddress && (
        <div className="text-right">
          <p className="font-mono text-sm font-medium tabular-nums" data-testid={`text-balance-${token.symbol}`}>
            {displayBalance}
          </p>
        </div>
      )}
    </button>
  );
}
