import {defineConfig} from 'vite';import react from '@vitejs/plugin-react';
// /nasa-img proxies NASA's image host through our own origin so the share card can draw NASA images (no CORS taint).
export default defineConfig({plugins:[react()],server:{proxy:{'/nasa-img':{target:'https://images-assets.nasa.gov',changeOrigin:true,rewrite:p=>p.replace(/^\/nasa-img/,'')}}}});
