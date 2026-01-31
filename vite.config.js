import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        const plausibleDomain = process.env.VITE_PLAUSIBLE_DOMAIN
        
        // Only inject Plausible in production mode and if domain is configured
        if (mode === 'production' && plausibleDomain) {
          return html.replace(
            '<!-- PLAUSIBLE_INJECT -->',
            `<script defer data-domain="${plausibleDomain}" src="https://plausible.io/js/script.hash.js"></script>`
          )
        }
        
        // Remove placeholder in development or if no domain configured
        return html.replace('<!-- PLAUSIBLE_INJECT -->', '')
      }
    }
  ],
  server: {
    port: 3001
  }
}))
