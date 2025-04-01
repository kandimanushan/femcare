import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { InfoIcon } from "lucide-react";

export function ModelInfoTooltip({ model }: { model: 'ollama' | 'openrouter' }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="h-4 w-4 text-gray-400 cursor-help ml-2" />
        </TooltipTrigger>
        <TooltipContent>
          {model === 'ollama' ? (
            <p>TinyLlama - Runs locally on your machine using Ollama</p>
          ) : (
            <p>Deepseek - Cloud-based model via OpenRouter</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 