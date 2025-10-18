import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Upload, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DisputeFormProps {
  transactionId: string;
  onSubmit: (reason: string, category: string, evidence: File[]) => Promise<void>;
  onCancel: () => void;
}

const DISPUTE_CATEGORIES = [
  { value: "not_as_described", label: "Item/Service Not as Described" },
  { value: "not_received", label: "Item/Service Not Received" },
  { value: "damaged", label: "Item Damaged or Defective" },
  { value: "counterfeit", label: "Counterfeit or Fake Item" },
  { value: "unauthorized", label: "Unauthorized Transaction" },
  { value: "quality_issue", label: "Quality Issues" },
  { value: "other", label: "Other Issue" },
];

const DisputeForm = ({ transactionId, onSubmit, onCancel }: DisputeFormProps) => {
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file size (max 5MB per file)
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    // Limit to 5 files total
    if (evidenceFiles.length + validFiles.length > 5) {
      toast({
        title: "Too Many Files",
        description: "Maximum 5 evidence files allowed",
        variant: "destructive",
      });
      return;
    }

    setEvidenceFiles([...evidenceFiles, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      toast({
        title: "Category Required",
        description: "Please select a dispute category",
        variant: "destructive",
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a detailed explanation",
        variant: "destructive",
      });
      return;
    }

    if (reason.length < 50) {
      toast({
        title: "Insufficient Detail",
        description: "Please provide at least 50 characters of explanation",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(reason, category, evidenceFiles);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div className="text-sm text-yellow-200">
            <p className="font-semibold mb-1">Important: Initiating a Dispute</p>
            <p className="text-yellow-300">
              Filing a dispute will freeze the transaction and involve a mediator. 
              Please ensure you've attempted to resolve the issue with the other party first.
            </p>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-base font-semibold">
          Dispute Category <span className="text-red-500">*</span>
        </Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category" className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select category..." />
          </SelectTrigger>
          <SelectContent>
            {DISPUTE_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Detailed Explanation */}
      <div className="space-y-2">
        <Label htmlFor="reason" className="text-base font-semibold">
          Detailed Explanation <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please provide a comprehensive explanation of the issue, including:&#10;- What was expected vs what was received&#10;- Timeline of events&#10;- Steps taken to resolve with the other party&#10;- Any relevant details or circumstances"
          className="bg-gray-800 border-gray-700 min-h-[200px]"
          required
        />
        <p className="text-sm text-gray-400">
          {reason.length}/1000 characters (minimum 50 required)
        </p>
      </div>

      {/* Evidence Upload */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Supporting Evidence (Optional)
        </Label>
        <p className="text-sm text-gray-400">
          Upload screenshots, receipts, or other documentation (max 5 files, 5MB each)
        </p>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => document.getElementById('evidence-upload')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
          <Input
            id="evidence-upload"
            type="file"
            accept="image/*,.pdf"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <span className="text-sm text-gray-400">
            {evidenceFiles.length} file(s) selected
          </span>
        </div>

        {evidenceFiles.length > 0 && (
          <div className="space-y-2">
            {evidenceFiles.map((file, index) => (
              <Card key={index} className="p-3 bg-gray-800/50 border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded">
                      <Upload className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">{file.name}</p>
                      <p className="text-xs text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !category || !reason.trim() || reason.length < 50}
          className="flex-1 bg-yellow-600 hover:bg-yellow-700"
        >
          {isSubmitting ? "Submitting..." : "File Dispute"}
        </Button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        By filing a dispute, you acknowledge that the information provided is accurate 
        and the mediator's decision will be final.
      </p>
    </form>
  );
};

export default DisputeForm;
