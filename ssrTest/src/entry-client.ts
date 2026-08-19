import { createSSRApp } from "vue";
import App from "./App.vue";

/**
 * 客户端入口
 *
 * 服务端已渲染出 #app 内的真实标记，这里用 createSSRApp().mount('#app')
 * 对已有标记做「水合（hydrate）」——接管事件与响应式，而不是重建 DOM。
 * 编辑器实例在 App.vue 的 onMounted 中创建（只在浏览器端执行）。
 */
createSSRApp(App).mount("#app");
