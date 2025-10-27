import { useState, useEffect } from "react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useEscrow } from "@/hooks/useEscrow";
import { useCryptoEscrow } from "@/hooks/useCryptoEscrow";
import { useAddress } from "@thirdweb-dev/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, DollarSign, Bitcoin, Wallet, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TierLimitAlert } from "./TierLimitAlert";
import { VerificationPrompt } from "./VerificationPrompt";
import { supabase } from "@/integrations/supabase/client";

interface CreateEscrowFormProps {
  onSuccess?: () => void;
  listingId?: string;
  prefillData?: {
    sellerId?: string;
    amount?: number;
    description?: string;
  };
}

const CreateEscrowForm = ({ onSuccess, listingId, prefillData }: CreateEscrowFormProps) => {
  const { user, profile } = useUnifiedAuth();
  const { createTransaction, loading } = useEscrow();
  const { checkBalance, getConversion, loading: cryptoLoading } = useCryptoEscrow();
  const walletAddress = useAddress();
  const { toast } = useToast();

  // Currency limits (unverified / verified)
  const CURRENCY_LIMITS = {
    USD: { unverified: 500, verified: 10000 },
    EUR: { unverified: 460, verified: 9200 },     // ~0.92 EUR per USD
    GBP: { unverified: 400, verified: 8000 },     // ~0.80 GBP per USD
    CAD: { unverified: 680, verified: 13600 },    // ~1.36 CAD per USD
    AUD: { unverified: 770, verified: 15400 },    // ~1.54 AUD per USD
  };

  const [formData, setFormData] = useState({
    sellerId: prefillData?.sellerId || "",
    amount: prefillData?.amount || "",
    currency: "USD",
    description: prefillData?.description || "",
    paymentMethod: "traditional" as "traditional" | "crypto",
    cryptoCurrency: "ETH",
  });

  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [conversion, setConversion] = useState<string | null>(null);
  const [releaseConditions, setReleaseConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState("");
  const [tierError, setTierError] = useState<{
    currentTier: string;
    tierLimit: number;
    requestedAmount: number;
  } | null>(null);
  const [userReputation, setUserReputation] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [sellerError, setSellerError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const userId = user?.id || profile?.id;
      if (!userId) return;

      const { data: reputation } = await supabase
        .from('user_reputation')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('verification_status')
        .eq('id', userId)
        .single();

      setUserReputation(reputation);
      setUserProfile(profileData);
    };

    loadUserData();
  }, [user, profile]);
  const predefinedConditions = [
    "Item delivered as described",
    "Service completed satisfactorily",
    "Digital goods received and verified",
    "Inspection period completed",
  ];

  const handleCheckBalance = async () => {
    if (!walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    const result = await checkBalance(walletAddress, formData.cryptoCurrency);
    if (result) {
      setWalletBalance(result.balance);
      toast({
        title: "Balance Checked",
        description: `${result.balance} ${result.currency} available`,
      });
    }
  };

  const handleAmountChange = async (value: string) => {
    // Validate two decimal places for traditional currencies
    if (formData.paymentMethod === 'traditional' && value) {
      const decimalParts = value.split('.');
      if (decimalParts.length > 1 && decimalParts[1].length > 2) {
        return; // Don't update if more than 2 decimal places
      }
    }

    setFormData({ ...formData, amount: value });
    setAmountError(null);

    // Validate amount limits based on currency
    const numericAmount = Number(value);
    if (value && numericAmount > 0 && formData.paymentMethod === 'traditional') {
      const isVerified = userProfile?.verification_status === 'verified';
      const currencyKey = formData.currency as keyof typeof CURRENCY_LIMITS;
      const limits = CURRENCY_LIMITS[currencyKey] || CURRENCY_LIMITS.USD;
      const maxAmount = isVerified ? limits.verified : limits.unverified;
      
      if (numericAmount > maxAmount) {
        setAmountError(
          isVerified 
            ? `Amount exceeds verified user limit of ${maxAmount.toLocaleString()} ${formData.currency}` 
            : `Amount exceeds unverified user limit of ${maxAmount.toLocaleString()} ${formData.currency}. Please verify your account for higher limits.`
        );
      }
    }

    // Auto-convert if crypto payment
    if (formData.paymentMethod === 'crypto' && value && Number(value) > 0) {
      const result = await getConversion(
        formData.currency,
        formData.cryptoCurrency,
        Number(value)
      );
      if (result) {
        setConversion(`≈ ${result.convertedAmount} ${formData.cryptoCurrency}`);
      }
    } else {
      setConversion(null);
    }
  };

  const handleCryptoChange = async (value: string) => {
    setFormData({ ...formData, cryptoCurrency: value });
    setWalletBalance(null); // Reset balance when currency changes

    // Re-convert if amount exists
    if (formData.amount && Number(formData.amount) > 0) {
      const result = await getConversion(
        formData.currency,
        value,
        Number(formData.amount)
      );
      if (result) {
        setConversion(`≈ ${result.convertedAmount} ${value}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTierError(null);
    setAmountError(null);
    setSellerError(null);

    const userId = user?.id || profile?.id;
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create an escrow transaction",
        variant: "destructive",
      });
      return;
    }

    if (!formData.sellerId || !formData.amount || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate seller username format
    const sellerInput = formData.sellerId.trim();
    if (sellerInput.length < 3) {
      setSellerError("Username must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(sellerInput) && !sellerInput.startsWith('0x')) {
      setSellerError("Username can only contain letters, numbers, underscores, and hyphens");
      return;
    }

    // Validate amount limits based on currency
    const numericAmount = Number(formData.amount);
    if (formData.paymentMethod === 'traditional') {
      const isVerified = userProfile?.verification_status === 'verified';
      const currencyKey = formData.currency as keyof typeof CURRENCY_LIMITS;
      const limits = CURRENCY_LIMITS[currencyKey] || CURRENCY_LIMITS.USD;
      const maxAmount = isVerified ? limits.verified : limits.unverified;
      
      if (numericAmount > maxAmount) {
        setAmountError(
          isVerified 
            ? `Amount exceeds verified user limit of ${maxAmount.toLocaleString()} ${formData.currency}` 
            : `Amount exceeds unverified user limit of ${maxAmount.toLocaleString()} ${formData.currency}. Please verify your account for higher limits.`
        );
        toast({
          title: "Amount Limit Exceeded",
          description: `Maximum transaction amount is ${maxAmount.toLocaleString()} ${formData.currency} for ${isVerified ? 'verified' : 'unverified'} users`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const result = await createTransaction({
        buyerId: userId,
        sellerId: formData.sellerId,
        amount: Number(formData.amount),
        currency: formData.currency,
        description: formData.description,
        releaseConditions: releaseConditions.length > 0 ? releaseConditions : undefined,
      });

      if (result) {
        toast({
          title: "Escrow Created",
          description: "Your secure escrow transaction has been initiated",
        });
        setTierError(null);
        onSuccess?.();
      }
    } catch (error: any) {
      if (error.tierInfo) {
        setTierError({
          currentTier: error.tierInfo.currentTier,
          tierLimit: error.tierInfo.tierLimit,
          requestedAmount: error.tierInfo.requestedAmount,
        });
      }
    }
  };

  const toggleCondition = (condition: string) => {
    setReleaseConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const addCustomCondition = () => {
    if (customCondition.trim()) {
      setReleaseConditions(prev => [...prev, customCondition.trim()]);
      setCustomCondition("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Verification Prompt */}
      {userProfile && (
        <VerificationPrompt
          verificationStatus={userProfile.verification_status || 'unverified'}
          currentTier={userReputation?.tier || 'Shadow Trader'}
        />
      )}

      {/* Tier Limit Alert */}
      {tierError && (
        <TierLimitAlert
          currentTier={tierError.currentTier}
          tierLimit={tierError.tierLimit}
          requestedAmount={tierError.requestedAmount}
        />
      )}
      {/* Payment Method Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-cyan-400" />
          Payment Method
        </Label>
        <RadioGroup
          value={formData.paymentMethod}
          onValueChange={(value: "traditional" | "crypto") =>
            setFormData({ ...formData, paymentMethod: value })
          }
        >
          <div className="flex items-center space-x-2 p-4 border border-gray-700 rounded-lg hover:border-cyan-500 transition-colors">
            <RadioGroupItem value="traditional" id="traditional" />
            <Label htmlFor="traditional" className="flex items-center gap-2 cursor-pointer flex-1">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Traditional Currency</p>
                <p className="text-sm text-gray-400">Credit/Debit Card via Stripe</p>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-4 border border-gray-700 rounded-lg hover:border-cyan-500 transition-colors">
            <RadioGroupItem value="crypto" id="crypto" />
            <Label htmlFor="crypto" className="flex items-center gap-2 cursor-pointer flex-1">
              <Bitcoin className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">Cryptocurrency</p>
                <p className="text-sm text-gray-400">Secure blockchain payment</p>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {formData.paymentMethod === 'crypto' && walletAddress && (
          <Card className="p-4 bg-cyan-500/10 border-cyan-500/30">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Wallet className="h-4 w-4" />
                  <span className="font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCheckBalance}
                  disabled={cryptoLoading}
                  className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${cryptoLoading ? 'animate-spin' : ''}`} />
                  Check Balance
                </Button>
              </div>
              {walletBalance && (
                <div className="text-sm">
                  <span className="text-gray-400">Available: </span>
                  <span className="text-cyan-400 font-semibold">{walletBalance} {formData.cryptoCurrency}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {formData.paymentMethod === 'crypto' && !walletAddress && (
          <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
            <p className="text-sm text-yellow-300">
              ⚠️ Please connect your Web3 wallet to proceed with cryptocurrency payment
            </p>
          </Card>
        )}
      </div>

      {/* Seller Username */}
      <div className="space-y-2">
        <Label htmlFor="sellerId">
          Seller Username <span className="text-red-500">*</span>
        </Label>
        <Input
          id="sellerId"
          value={formData.sellerId}
          onChange={(e) => {
            setFormData({ ...formData, sellerId: e.target.value });
            setSellerError(null);
          }}
          placeholder="username or 0x... wallet address"
          className={`bg-gray-800 border-gray-700 ${sellerError ? 'border-red-500' : ''}`}
          required
        />
        {sellerError && (
          <p className="text-sm text-red-500">{sellerError}</p>
        )}
      </div>

      {/* Amount and Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">
            Amount <span className="text-red-500">*</span>
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            className={`bg-gray-800 border-gray-700 ${amountError ? 'border-red-500' : ''}`}
            required
          />
          {amountError && (
            <p className="text-sm text-red-500">{amountError}</p>
          )}
          {conversion && formData.paymentMethod === 'crypto' && !amountError && (
            <p className="text-xs text-cyan-400">{conversion}</p>
          )}
          {!amountError && formData.amount && formData.paymentMethod === 'traditional' && (
            <p className="text-xs text-gray-400">
              {(() => {
                const isVerified = userProfile?.verification_status === 'verified';
                const currencyKey = formData.currency as keyof typeof CURRENCY_LIMITS;
                const limits = CURRENCY_LIMITS[currencyKey] || CURRENCY_LIMITS.USD;
                const maxAmount = isVerified ? limits.verified : limits.unverified;
                return `Limit: ${maxAmount.toLocaleString()} ${formData.currency}${!isVerified ? ' (verify for higher limits)' : ''}`;
              })()}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          {formData.paymentMethod === "traditional" ? (
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData({ ...formData, currency: value })}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Select
              value={formData.cryptoCurrency}
              onValueChange={handleCryptoChange}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
                <SelectItem value="BTC">BTC (Bitcoin)</SelectItem>
                <SelectItem value="USDC">USDC (Stablecoin)</SelectItem>
                <SelectItem value="USDT">USDT (Tether)</SelectItem>
                <SelectItem value="MATIC">MATIC (Polygon)</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Transaction Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what is being bought/sold..."
          className="bg-gray-800 border-gray-700 min-h-[100px]"
          required
        />
      </div>

      {/* Release Conditions */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Release Conditions (Optional)</Label>
        <p className="text-sm text-gray-400">
          Select or add conditions that must be met before funds are released
        </p>

        <div className="space-y-2">
          {predefinedConditions.map((condition) => (
            <div key={condition} className="flex items-center space-x-2">
              <Checkbox
                id={condition}
                checked={releaseConditions.includes(condition)}
                onCheckedChange={() => toggleCondition(condition)}
              />
              <Label
                htmlFor={condition}
                className="text-sm font-normal cursor-pointer"
              >
                {condition}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={customCondition}
            onChange={(e) => setCustomCondition(e.target.value)}
            placeholder="Add custom condition..."
            className="bg-gray-800 border-gray-700"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomCondition();
              }
            }}
          />
          <Button
            type="button"
            onClick={addCustomCondition}
            variant="outline"
            disabled={!customCondition.trim()}
          >
            Add
          </Button>
        </div>

        {releaseConditions.length > 0 && !predefinedConditions.includes(releaseConditions[releaseConditions.length - 1]) && (
          <div className="mt-2">
            <p className="text-sm text-gray-400 mb-2">Custom conditions:</p>
            {releaseConditions
              .filter(c => !predefinedConditions.includes(c))
              .map((condition, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded mb-1">
                  <span className="text-sm">{condition}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReleaseConditions(prev => prev.filter(c => c !== condition))}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold"
        >
          {loading ? "Creating..." : "Create Escrow Transaction"}
        </Button>
      </div>

      {/* Info */}
      <div className="p-4 bg-green-500/10 border border-green-500 rounded text-sm text-green-200">
        <Shield className="h-4 w-4 inline mr-2 text-green-400" />
        Your funds will be held securely until all parties confirm completion or a dispute is resolved.
      </div>
    </form>
  );
};

export default CreateEscrowForm;
