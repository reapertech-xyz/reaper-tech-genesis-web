
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ShippingCalculatorProps {
  subtotal: number;
  onShippingChange: (shipping: number, tax: number) => void;
}

// State tax rates (simplified - real implementation would use API)
const STATE_TAX_RATES = {
  'AL': 0.04, 'AK': 0.00, 'AZ': 0.056, 'AR': 0.065, 'CA': 0.0725,
  'CO': 0.029, 'CT': 0.0635, 'DE': 0.00, 'FL': 0.06, 'GA': 0.04,
  'HI': 0.04, 'ID': 0.06, 'IL': 0.0625, 'IN': 0.07, 'IA': 0.06,
  'KS': 0.065, 'KY': 0.06, 'LA': 0.0445, 'ME': 0.055, 'MD': 0.06,
  'MA': 0.0625, 'MI': 0.06, 'MN': 0.06875, 'MS': 0.07, 'MO': 0.0423,
  'MT': 0.00, 'NE': 0.055, 'NV': 0.0685, 'NH': 0.00, 'NJ': 0.06625,
  'NM': 0.05125, 'NY': 0.08, 'NC': 0.0475, 'ND': 0.05, 'OH': 0.0575,
  'OK': 0.045, 'OR': 0.00, 'PA': 0.06, 'RI': 0.07, 'SC': 0.06,
  'SD': 0.045, 'TN': 0.07, 'TX': 0.0625, 'UT': 0.0485, 'VT': 0.06,
  'VA': 0.053, 'WA': 0.065, 'WV': 0.06, 'WI': 0.05, 'WY': 0.04
};

const SHIPPING_RATES = {
  'USPS_Ground': { base: 4.95, perLb: 0.85, name: 'USPS Ground' },
  'USPS_Priority': { base: 8.95, perLb: 1.25, name: 'USPS Priority' },
  'UPS_Ground': { base: 7.95, perLb: 1.15, name: 'UPS Ground' },
  'UPS_3Day': { base: 12.95, perLb: 2.25, name: 'UPS 3-Day' },
  'FedEx_Ground': { base: 8.45, perLb: 1.35, name: 'FedEx Ground' },
  'FedEx_Express': { base: 15.95, perLb: 2.85, name: 'FedEx Express' },
  'Amazon_Standard': { base: 5.99, perLb: 0.99, name: 'Amazon Standard' },
  'Amazon_Prime': { base: 0.00, perLb: 0.00, name: 'Amazon Prime (Free)' }
};

const ShippingCalculator = ({ subtotal, onShippingChange }: ShippingCalculatorProps) => {
  const [zipCode, setZipCode] = useState("");
  const [state, setState] = useState("");
  const [shippingMethod, setShippingMethod] = useState("");
  const [weight, setWeight] = useState(1); // Default 1 lb
  const [shippingCost, setShippingCost] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);

  const calculateShipping = () => {
    if (!shippingMethod || !state) return;

    const carrier = SHIPPING_RATES[shippingMethod as keyof typeof SHIPPING_RATES];
    const shipping = carrier.base + (carrier.perLb * weight);
    
    const taxRate = STATE_TAX_RATES[state as keyof typeof STATE_TAX_RATES] || 0;
    const tax = subtotal * taxRate;

    setShippingCost(shipping);
    setTaxAmount(tax);
    onShippingChange(shipping, tax);
  };

  return (
    <Card className="bg-gray-900 border-gray-700 mb-4">
      <CardHeader>
        <CardTitle className="text-cyan-400 font-mono">Shipping & Tax Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="zipCode" className="text-gray-300">ZIP Code</Label>
            <Input
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter ZIP"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="state" className="text-gray-300">State</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {Object.keys(STATE_TAX_RATES).map((stateCode) => (
                  <SelectItem key={stateCode} value={stateCode} className="text-white">
                    {stateCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="weight" className="text-gray-300">Package Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value) || 1)}
            min="0.1"
            step="0.1"
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>

        <div>
          <Label htmlFor="shipping" className="text-gray-300">Shipping Method</Label>
          <Select value={shippingMethod} onValueChange={setShippingMethod}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select Carrier" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {Object.entries(SHIPPING_RATES).map(([key, carrier]) => (
                <SelectItem key={key} value={key} className="text-white">
                  {carrier.name} - ${carrier.base.toFixed(2)} + ${carrier.perLb.toFixed(2)}/lb
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={calculateShipping}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-mono"
          disabled={!state || !shippingMethod}
        >
          Calculate Shipping & Tax
        </Button>

        {(shippingCost > 0 || taxAmount > 0) && (
          <div className="pt-4 border-t border-gray-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Shipping:</span>
              <span className="text-green-400">${shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tax ({state}):</span>
              <span className="text-green-400">${taxAmount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingCalculator;
