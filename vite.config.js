import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        const plausibleDomain = process.env.VITE_PLAUSIBLE_DOMAIN
        
        // Only inject Plausible if domain is configured
        if (plausibleDomain) {
          return html.replace(
            '%VITE_PLAUSIBLE_SCRIPT%',
            `<script defer data-domain="${plausibleDomain}" src="https://plausible.io/js/script.hash.js"></script>`
          )
        }
        
        // Remove placeholder if no domain configured
        return html.replace('%VITE_PLAUSIBLE_SCRIPT%', '')
      }
    }
  ],
  server: {
    port: 3001
  }
}))
