jsimport { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

**"Commit changes" 클릭!**

---

## 3단계 — index.html 만들기

같은 방법으로 **"Add file" → "Create new file"**

**파일명:**
```
index.html
html<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI 영어 학습 툴 - Chai-Banbok</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
