/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** 效果包成员（懒加载模块）的 id 形态：…/effects/<slug>/meta.json、…/index.html?raw、…/prompt.md?raw */
const EFFECT_BUNDLE_RE = /\/effects\/([^/]+)\/(?:meta\.json|index\.html\?raw|prompt\.md\?raw)$/;

const LIGHT_QUERY = '?light';

/**
 * `effects/<slug>/meta.json?light` → 去掉 params / presets 的轻量 meta。
 * 注册表用它构建首包里的效果索引：参数表占 meta 体积八成以上，而目录 / 搜索 / 卡片标题用不到。
 * 仍以 JSON 文本 + moduleType 'json' 交回，由 Vite 内置 JSON 处理生成模块；
 * id 带 query，与被详情页懒加载的全量 meta.json 是两个模块，可分别落到首包与效果包。
 * 文件路径不含 query，改 meta.json 时开发服务器会同时失效两者。
 */
function lightMetaPlugin(): Plugin {
  return {
    name: 'mt:light-meta',
    enforce: 'pre',
    load(id) {
      if (!id.endsWith(`/meta.json${LIGHT_QUERY}`)) return;
      const file = id.slice(0, -LIGHT_QUERY.length);
      const light = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
      delete light.params;
      delete light.presets;
      return { code: JSON.stringify(light), moduleType: 'json' };
    },
  };
}

// 纯静态 SPA：hash 路由，部署在根路径，任何静态服务器零配置可托管
export default defineConfig({
  plugins: [lightMetaPlugin(), react()],
  base: '/',
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    // 首包 ≈ React + Router（~270 KB）+ 效果索引（272 条，~240 KB 含加载表）≈ 620 KB / 180 KB gzip；
    // 阈值压在这之上一点：若效果源码或全量 meta 又被内联进首包，构建会重新告警
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            {
              // 每个效果的全量 meta.json + index.html + prompt.md 合成一个 chunk
              // （assets/effects/<slug>-[hash].js）：首包只带索引，卡片滚近 / 进详情页时按 slug 拉一次
              name: (id) => {
                const m = EFFECT_BUNDLE_RE.exec(id);
                return m ? `effects/${m[1]}` : undefined;
              },
              test: EFFECT_BUNDLE_RE,
              priority: 100,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
