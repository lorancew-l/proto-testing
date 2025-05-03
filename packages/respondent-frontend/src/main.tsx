import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Research } from 'shared';

import { App } from './app.tsx';
import './index.css';
import { ResearchMachineContextProvider } from './research-machine';

(() => {
  const research = window.research;
  const rootElement = document.getElementById('research-root');

  if (!rootElement) {
    throw new Error('Research root is not provided!');
  }

  if (research) {
    createRoot(rootElement).render(
      <StrictMode>
        <ResearchMachineContextProvider research={research}>
          <App />
        </ResearchMachineContextProvider>
      </StrictMode>,
    );
  } else {
    throw new Error('Research data is not provided!');
  }
})();

declare global {
  interface Window {
    research: (Research & { id: string; revision: number }) | undefined;
    DEV_MODE?: boolean;
  }
}
