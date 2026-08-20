import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 카카오톡 등 인앱 브라우저의 낮은 엔진 버전도 지원하기 위해 CSS 하위 호환 대상을 넓게 잡음
    cssTarget: ['chrome80', 'safari13', 'ios13'],
  },
})
