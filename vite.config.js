// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
  ],

  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-bundler.js',
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  // 社区模块加的
  server: {
    open: true,
    proxy: {
      // 当你的请求路径以 /m1 开头时，vite服务器会将其代理到 target 地址
      '/m1': {
        // 你的 Apifox 本地 Mock 服务的地址
        target: 'http://127.0.0.1:4523', 
        // 必须开启，服务器会修改请求头中的 Origin 字段
        changeOrigin: true, 
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Vite Proxy sending request to target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Vite Proxy received response from target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})