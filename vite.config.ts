import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Leave-Management-System/', // 👈 Add this line
  plugins: [react()],
})
