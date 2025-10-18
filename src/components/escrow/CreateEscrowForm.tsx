import { useState } from "react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useEscrow } from "@/hooks/useEscrow";
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
import { Shield, DollarSign, Bitcoin } from "lucide-react";

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
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    sellerId: prefillData?.sellerId || "",
    amount: prefillData?.amount || "",
    currency: "USD",
    description: prefillData?.description || "",
    paymentMethod: "traditional" as "traditional" | "crypto",
    cryptoCurrency: "ETH",
  });

  const [releaseConditions, setReleaseConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState("");

  const predefinedConditions = [
    "Item delivered as described",
    "Service completed satisfactorily",
    "Digital goods received and verified",
    "Inspection period completed",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      onSuccess?.();
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
      </div>

      {/* Seller ID */}
      <div className="space-y-2">
        <Label htmlFor="sellerId">
          Seller Wallet Address / User ID <span className="text-red-500">*</span>
        </Label>
        <Input
          id="sellerId"
          value={formData.sellerId}
          onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
          placeholder="0x... or user-id"
          className="bg-gray-800 border-gray-700"
          required
        />
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
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            className="bg-gray-800 border-gray-700"
            required
          />
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
              onValueChange={(value) => setFormData({ ...formData, cryptoCurrency: value })}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
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
      <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded text-sm text-cyan-200">
        <Shield className="h-4 w-4 inline mr-2" />
        Your funds will be held securely until all parties confirm completion or a dispute is resolved.
      </div>
    </form>
  );
};

export default CreateEscrowForm;
