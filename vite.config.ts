import {defineConfig, loadEnv} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      tailwindcss(),
      hydrogen(),
      oxygen({env}),
      reactRouter(),
      tsconfigPaths(),
    ],
    build: {
      // Allow a strict Content-Security-Policy
      // without inlining assets as base64:
      assetsInlineLimit: 0,
    },
    ssr: {
      optimizeDeps: {
        include: ['set-cookie-parser', 'cookie', 'react-router'],
      },
    },
    server: {
      allowedHosts: ['.tryhydrogen.dev'],
    },
  };
});
