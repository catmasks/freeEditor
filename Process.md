## 开发流程 / development process

### 卸载 freeEditor 库 / uninstall freeEditor library

```bash
cd playground
pnpm remove @catmasks/free-editor
```

```typescript
/**
 * 在 playground 项目中的 main.ts 顶部注释以下代码
 * comment the following code to the main.ts file of the playground project
 */
import "@catmasks/free-editor/style.css";
```

### 添加 freeEditor 库到 playground 项目的 vite.config.ts 中 / add freeEditor library to playground project's vite.config.ts

```typescript
/**
 * 在 playground 演示项目的 vite.config.ts 中添加以下配置
 * add the following configuration to the playground project's vite.config.ts
 */
resolve:{
     alias: {
      "@catmasks/free-editor": path.resolve(
        __dirname,
        "../packages/freeEditor/src"
      ),
    }
}
```

## 初步测试 / initial test

### 打包 freeEditor 库 / build freeEditor library

```bash
cd packages/freeEditor
pnpm run build
```

### 测试 freeEditor 库 / test freeEditor library

```typescript
/**
 * 在 playground 演示项目的 vite.config.ts 中添加以下配置
 * add the following configuration to the playground project's vite.config.ts
 */
resolve:{
     alias: {
      "@catmasks/free-editor": path.resolve(
        __dirname,
        "../packages/freeEditor/dist"
      ),
    }
}
```

```typescript
/**
 * 在 playground 项目中的 main.ts 顶部添加以下代码
 * add the following code to the main.ts file of the playground project
 */
import "@catmasks/free-editor/style.css";
```

## 二次测试 / second test

### 生成 .tgz 文件 / generate .tgz file

```bash
cd packages/freeEditor
pnpm pack --out free-editor.tgz
```

### 测试 .tgz 文件 / test .tgz file

- 确保只有一个 .tgz 文件

```bash
cd playground
pnpm add ../packages/freeEditor/free-editor.tgz
```

### 运行 playground 项目 / run playground project

```typescript
/**
 * 在 playground 项目中的 main.ts 顶部添加以下代码
 * add the following code to the main.ts file of the playground project
 */
import "@catmasks/free-editor/style.css";
```

```bash
cd playground
pnpm run dev
```

## 发布 / publish

```bash
cd packages/freeEditor
pnpm publish
```
