import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Publicado en https://chillaso.github.io/mtc-marketplace/
// En desarrollo se sirve en «/»; BASE_PATH permite sobrescribirlo si hiciera falta.
export const SITE_URL = 'https://chillaso.github.io/mtc-marketplace/'

export default defineConfig(({ command }) => ({
  base: process.env.BASE_PATH ?? (command === 'build' ? new URL(SITE_URL).pathname : '/'),
  plugins: [react(), tailwindcss()],
}))
