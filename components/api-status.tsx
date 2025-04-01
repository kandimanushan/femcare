import { useEffect, useState } from 'react';

export function ApiStatus() {
  const [status, setStatus] = useState<{
    ollama: boolean;
    openrouter: boolean;
  }>({
    ollama: false,
    openrouter: false
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check Ollama status
        const ollamaResponse = await fetch('/api/ollama-status');
        const ollamaData = await ollamaResponse.json();
        
        // Check OpenRouter status
        const openRouterResponse = await fetch('/api/openrouter-status');
        const openRouterData = await openRouterResponse.json();

        setStatus({
          ollama: ollamaData.status === 'online',
          openrouter: openRouterData.status === 'online'
        });
      } catch (error) {
        console.error('Error checking API status:', error);
      }
    };

    checkStatus();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 flex gap-2">
      <div className={`px-3 py-1 rounded-full ${status.ollama ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        Ollama: {status.ollama ? 'Online' : 'Offline'}
      </div>
      <div className={`px-3 py-1 rounded-full ${status.openrouter ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        OpenRouter: {status.openrouter ? 'Online' : 'Offline'}
      </div>
    </div>
  );
} 