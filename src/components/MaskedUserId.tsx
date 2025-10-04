import { maskUserId } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MaskedUserIdProps {
  userId: string;
  showTooltip?: boolean;
  className?: string;
}

/**
 * Component that displays a masked user ID for privacy
 * Optionally shows the full ID on hover with a tooltip
 */
export function MaskedUserId({ userId, showTooltip = false, className = "" }: MaskedUserIdProps) {
  const maskedId = maskUserId(userId);

  if (!showTooltip) {
    return <span className={className}>{maskedId}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`cursor-help ${className}`}>{maskedId}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs font-mono">{userId}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
