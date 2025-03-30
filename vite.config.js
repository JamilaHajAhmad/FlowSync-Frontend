import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'process'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 3001,
    },
    define: {
      'process.env.VITE_REACT_APP_OPENAI_API_KEY': JSON.stringify(env.VITE_REACT_APP_OPENAI_API_KEY)
    }
  }
});

