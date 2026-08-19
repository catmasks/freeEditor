/**
 * FreeEditor CDN 测试页公共工具
 *
 * 提供断言、用例注册、结果渲染，以及"点击总览卡片筛选显示结果"的交互逻辑，
 * 供各引入方式（esm.sh / jsDelivr）的测试页复用。
 */

/** 已注册的测试用例 */
const results = [];

/**
 * 注册一个测试用例 / Register a test case
 * @param group 分组名 / Group name
 * @param name 用例名 / Test case name
 * @param fn 用例函数（可同步或异步） / Test function (sync or async)
 */
export function defineTest(group, name, fn) {
  results.push({ group, name, fn });
}

/** 断言：条件不满足时抛出错误 / Assert helper */
export function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "断言失败");
  }
}

/** 当前筛选：'all' | 'pass' | 'fail' | null（null 表示列表隐藏） */
let currentFilter = null;

/** 根据筛选条件显示/隐藏测试行 */
function applyFilter() {
  const listEl = document.getElementById("test-list");
  listEl.classList.toggle("visible", currentFilter !== null);

  listEl.querySelectorAll(".test-row").forEach((row) => {
    const status = row.dataset.status || "pending";
    const matched =
      currentFilter === null ||
      currentFilter === "all" ||
      status === currentFilter;
    row.classList.toggle("hidden", !matched);
  });
}

/** 点击总览卡片：切换筛选与显隐 */
function toggleFilter(filter) {
  // 再次点击同一卡片则收起列表
  currentFilter = currentFilter === filter ? null : filter;

  document.querySelectorAll(".summary .card").forEach((card) => {
    card.classList.toggle("active", card.dataset.filter === currentFilter);
  });
  applyFilter();
}

// 绑定总览卡片点击（模块加载时执行一次）
document.querySelectorAll(".summary .card").forEach((card) => {
  card.addEventListener("click", () => toggleFilter(card.dataset.filter));
});

/**
 * 执行全部测试并渲染结果
 * @param version 包版本号（用于提示文案，可选）/ Package version for hint text
 */
export async function runTests(version) {
  const listEl = document.getElementById("test-list");
  let passed = 0;
  let failed = 0;

  for (const test of results) {
    const row = document.createElement("div");
    row.className = "test-row";
    row.dataset.status = "pending";
    row.innerHTML =
      `<span class="test-group">${test.group}</span>` +
      `<span class="test-name">${test.name}</span>` +
      `<span class="test-status pending">运行中…</span>`;
    listEl.appendChild(row);

    const statusEl = row.querySelector(".test-status");
    try {
      await test.fn();
      statusEl.textContent = "通过";
      statusEl.className = "test-status pass";
      row.dataset.status = "pass";
      passed++;
    } catch (err) {
      statusEl.textContent = `失败：${err.message}`;
      statusEl.className = "test-status fail";
      row.dataset.status = "fail";
      failed++;
    }
  }

  const versionText = version ? `（@catmasks/free-editor@${version}）` : "";
  document.getElementById("summary-total").textContent = results.length;
  document.getElementById("summary-passed").textContent = passed;
  document.getElementById("summary-failed").textContent = failed;
  document.getElementById("test-hint").textContent =
    `已通过 CDN 引入${versionText}执行 ${results.length} 条用例，通过 ${passed}，失败 ${failed}。` +
    ` 若存在失败，请检查网络或刷新重试。` +
    ` 点击上方「用例总数 / 通过 / 失败」可查看测试结果明细。`;

  // 测试完成后刷新筛选视图
  applyFilter();
}
