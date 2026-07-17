import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@components': resolve(__dirname, 'src/components'),
            '@pages': resolve(__dirname, 'src/pages'),
            '@hooks': resolve(__dirname, 'src/hooks'),
            '@services': resolve(__dirname, 'src/services'),
            '@store': resolve(__dirname, 'src/store'),
            '@context': resolve(__dirname, 'src/context'),
            '@assets': resolve(__dirname, 'src/assets'),
            '@utils': resolve(__dirname, 'src/utils'),
        },
    },
    build: {
        // Warn when a chunk exceeds 500kb (default is 500, making it explicit)
        chunkSizeWarningLimit: 500,
        rollupOptions: {
            output: {
                // Manually split large vendor libs into separate cacheable chunks
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
                    'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
                    'vendor-charts': ['recharts'],
                    'vendor-motion': ['framer-motion'],
                },
            },
        },
    },
    server: {
        port: 5174,
        proxy: {
            // Inside Docker: backend is reachable via the service name "backend"
            // Outside Docker (plain npm run dev): falls back to localhost:5000
            '/api': {
                target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
});
