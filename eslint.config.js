import js from "@eslint/js"; // ESLint 内置 JS 规则
import tseslint from "typescript-eslint"; // TypeScript ESLint 解析器与规则
import globals from "globals"; // 预定义全局变量
import { fileURLToPath } from "node:url"; // 获取当前目录

// 获取当前文件所在目录（用于 tsconfigRootDir）
const __dirname = fileURLToPath(new URL(".", import.meta.url));

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

  // 基础规则推荐配置
  js.configs.recommended, // ESLint 核心推荐规则
  ...tseslint.configs.recommended, // TypeScript 推荐规则

  // 针对源码库的配置 (packages/*/src/**/*.ts)
  {
    files: ["packages/*/src/**/*.ts"], // 匹配所有子包的源码文件

    languageOptions: {
      ecmaVersion: "latest", // 使用最新 ECMAScript 语法
      sourceType: "module", // 使用 ES Module 模块系统
      globals: {
        ...globals.browser, // 提供浏览器环境的全局变量（如 window, document）
      },
      parserOptions: {
        projectService: true, // 启用 TypeScript 类型检查（自动查找 tsconfig.json）
        tsconfigRootDir: __dirname, // 指定 TypeScript 配置文件的根目录
      },
    },

    rules: {
      "@typescript-eslint/explicit-function-return-type": "error",
      // 强制所有函数显式声明返回类型，提高代码可读性

      "@typescript-eslint/consistent-type-imports": "error",
      // 强制使用 `import type` 导入类型，避免运行时额外加载

      "@typescript-eslint/no-explicit-any": "off",
      // 允许使用 any 类型，避免类型检查错误

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_", // 以 _ 开头的函数参数忽略未使用检查
          varsIgnorePattern: "^_", // 以 _ 开头的变量忽略未使用检查
          caughtErrorsIgnorePattern: "^_", // 以 _ 开头的 catch 错误变量忽略检查
        },
      ],

      "no-console": ["warn", { allow: ["warn", "error"] }], // 使用 console 时给出警告, 允许 warn 和 error 方法

      // 圈复杂度, 限制函数的圈复杂度为 10
      complexity: ["warn", { max: 10 }],
    },
  },

  //针对 Vite 配置文件的配置 (vite.config.ts / vite.config.mts)
  {
    files: ["**/vite.config.ts", "**/vite.config.mts"],

    languageOptions: {
      globals: {
        ...globals.node, // 提供 Node.js 全局变量（如 process, __dirname）
        ...globals.es2021, // 提供 ES2021 全局变量（如 Promise, Map）
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },

    rules: {
      "@typescript-eslint/no-var-requires": "off",
      // Vite 配置中可能使用 require()，关闭该规则避免误报

      "no-console": "off",
      // Vite 配置中允许使用 console 进行调试
    },
  },

  // 针对 Playground 源码的配置 (playground/src/**/*.ts)
  {
    files: ["playground/src/**/*.ts"],

    languageOptions: {
      globals: {
        ...globals.browser, // 提供浏览器全局变量
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },

    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      // Playground 中允许使用 any，但给出警告以提示潜在类型问题
      "no-console": "off",
      // Playground 中允许使用 console 方便调试演示
    },
  },
];
