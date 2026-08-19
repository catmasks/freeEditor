import js from "@eslint/js"; // ESLint 内置 JS 规则
import tseslint from "typescript-eslint"; // TypeScript ESLint 解析器与规则
import globals from "globals"; // 预定义全局变量
import sonarjs from "eslint-plugin-sonarjs"; // Sonar 认知复杂度插件

/**
 * 一个「项目包」对应一个独立的规则块
 */
export default [
  // 全局忽略配置
  {
    ignores: [
      "**/node_modules/**", // 依赖目录
      "**/dist/**", // 构建输出目录
      "**/coverage/**", // 测试覆盖率报告目录
      "**/*.d.ts", // TypeScript 类型声明文件
      "**/.vite/**", // Vite 缓存目录
      "eslint.config.js", // 本配置文件自身
    ],
  },
  // 通用基座
  js.configs.recommended, // ESLint 核心推荐规则
  ...tseslint.configs.recommended, // TypeScript 推荐规则
  // 通用质量规则
  {
    files: [
      "{cdnTest,csrTest,ssrTest,packages/freeEditor}/**/*.{ts,js,mjs,cjs}",
    ],
    languageOptions: {
      ecmaVersion: "latest", // 最新的 ECMAScript 版本
      sourceType: "module", // 模块类型
      globals: {
        ...globals.browser, // 浏览器全局变量（window, document 等）
        ...globals.node, // 构建脚本、vite 配置使用 Node 全局变量（process, console 等）
        ...globals.es2021, // 提供 Promise, Map 等 ES2021 全局变量
      },
    },
    plugins: { sonarjs },
    rules: {
      // 圈复杂度：限制函数的圈复杂度为 10
      complexity: ["error", { max: 10 }],
      // 认知复杂度：上限为 15
      "sonarjs/cognitive-complexity": ["error", 15],
    },
  },
  // 包：@catmasks/free-editor
  {
    files: ["packages/freeEditor/**/*.{ts,js,mjs,cjs}"],
    rules: {
      // 强制所有函数显式声明返回类型，提高代码可读性
      "@typescript-eslint/explicit-function-return-type": "error",
      // 强制使用 `import type` 导入类型，避免运行时额外加载
      "@typescript-eslint/consistent-type-imports": "error",
      // 允许使用 any 类型，避免类型检查错误
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_", // 以 _ 开头的函数参数忽略未使用检查
          varsIgnorePattern: "^_", // 以 _ 开头的变量忽略未使用检查
          caughtErrorsIgnorePattern: "^_", // 以 _ 开头的 catch 错误变量忽略检查
        },
      ],
      // 仅允许 warn/error
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },

  // 包：csrTest
  {
    files: ["csrTest/**/*.{ts,js,mjs,cjs}"],
    rules: {
      //允许使用 any，但给出警告以提示潜在类型问题
      "@typescript-eslint/no-explicit-any": "warn",
      // 允许使用 console
      "no-console": "off",
    },
  },

  // 包：ssrTest
  {
    files: ["ssrTest/**/*.{ts,js,mjs,cjs}"],
    rules: {
      // 允许使用 any，但给出警告以提示潜在类型问题
      "@typescript-eslint/no-explicit-any": "warn",
      // 允许使用 console
      "no-console": "off",
    },
  },
];
