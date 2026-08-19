<template>
  <main class="page">
    <!-- 顶部品牌区 -->
    <header class="hero">
      <h1>Vue 3 SSR <span class="accent">+</span> hydrate</h1>
      <p class="subtitle">
        这段页面由 <strong>服务端</strong> 真实渲染产出标记，再由浏览器
        <strong>hydrate</strong> 接管。下方编辑器组件跨两端无缝运行。
      </p>
    </header>

    <!-- SSR 信息卡片 -->
    <section class="box">
      <div class="card">
        <h2>🖥️ 服务端渲染</h2>
        <p v-if="!isHydrated" class="tag">首屏由 server 生成</p>
        <ul class="kv">
          <li>
            <span>语言 locale</span><code>{{ serverLocale }}</code>
          </li>
          <li>
            <span>渲染时间</span><code>{{ serverTime }}</code>
          </li>
          <li>
            <span>执行环境</span>
            <code>{{ isHydrated ? "client (hydrated)" : "server (SSR)" }}</code>
          </li>
        </ul>
      </div>

      <div class="card">
        <h2>🧩 编辑器（FreeEditor）</h2>
        <p class="desc">
          由 <code>new Editor(el)</code> 在浏览器端挂载，可在客户端正常工作。
        </p>
        <div ref="editorEl" class="editor-box"></div>
      </div>
    </section>
  </main>
</template>
<script setup lang="ts">
// @ts-expect-error SSR 测试包
import { Editor, i18n, type EditorOptions } from "@catmasks/free-editor";
import { onBeforeUnmount, onMounted, ref } from "vue";
import "@catmasks/free-editor/style.css";

/** 服务端读取的语言（SSR 阶段即已注入值，静态不变） */
const serverLocale = i18n.locale;

/**
 * 渲染时间。
 *
 * 用 ref 初始化为固定字符串：SSR 与 hydrate 首次渲染保持完全一致，
 * 避免动态时间戳跨秒触发 Vue 的 hydration mismatch。onMounted 后再更新为真实时间。
 */
const serverTime = ref("渲染中…");

/** 是否为浏览器（hydrate）阶段 */
const isHydrated = ref(false);

/** 编辑器实例与挂载点 */
let editor: Editor | null = null;
const editorEl = ref<HTMLElement | null>(null);

onMounted(() => {
  // 客户端阶段：hydrate 完成后，更新动态值并挂载编辑器
  isHydrated.value = true;

  serverTime.value = new Date().toLocaleString("zh-CN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  if (editorEl.value) {
    const options: EditorOptions = {
      locale: serverLocale,
      height: 300,
      content: "<p>你好，Vue 3 SSR + hydrate 世界！</p>",
      placeholder: "在这里输入内容...",
    };
    editor = new Editor(editorEl.value, options);
  }
});

onBeforeUnmount(() => {
  editor?.destroy();
  editor = null;
});
</script>
<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 3rem;
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    sans-serif;
  color: #1f2328;
  line-height: 1.7;
}

.hero {
  margin-bottom: 2rem;
}
.hero h1 {
  font-size: 2rem;
  margin: 0.6rem 0;
  color: #0b1a33;
}
.hero .accent {
  color: #2563eb;
}
.hero .subtitle {
  color: #57606a;
  margin: 0;
}
.badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.3px;
}
.badge--ssr {
  background: #2563eb;
  color: #fff;
}

.box {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: #ffffff;
  border: 1px solid #e6eaf0;
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 6px 24px rgba(16, 24, 40, 0.06);
}
.card h2 {
  font-size: 1.05rem;
  margin-top: 0;
  color: #1f2937;
}
.tag {
  font-size: 12px;
  color: #059669;
  background: #ecfdf5;
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
}

.kv {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 0;
}
.kv li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px dashed #eef1f6;
}
.kv li:last-child {
  border-bottom: none;
}
.kv span {
  color: #6b7280;
  font-size: 13px;
}
.kv code {
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  color: #2563eb;
}

.desc {
  color: #57606a;
  font-size: 13px;
}
.editor-box {
  min-height: 300px;
  overflow: hidden;
}
</style>
