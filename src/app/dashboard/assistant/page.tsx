import AiAssistantChat from "./AiAssistantChat";
import { Bot } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AssistantPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Bot className="text-indigo-600" /> AI Inventory Assistant
        </h1>
        <p className="text-slate-500 mt-1">
          Query your warehouse database using natural language for reorder recommendations, movement audits, and fulfillment status
        </p>
      </div>

      <AiAssistantChat />
    </div>
  );
}
