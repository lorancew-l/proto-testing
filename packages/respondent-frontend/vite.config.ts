import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { version } from './package.json';

export default defineConfig({
  base: `/bundle/v${version}/`,
  plugins: [react()],
});
