# Chapter 9: 调试与工具链

> 目标：掌握 TS 项目的调试方法、构建工具配置、开发工作流。
> 示例代码：[examples/ch09/testing-demo.ts](./examples/ch09/testing-demo.ts) — 运行：`npx tsx examples/ch09/testing-demo.ts` | `bun examples/ch09/testing-demo.ts` | `node examples/ch09/testing-demo.ts`(v24+)

## 9.1 浏览器调试

### Chrome DevTools

```
1. 打开 DevTools: F12 或 Cmd+Option+I

2. Sources 面板：
   - 左侧文件树可以找到源文件
   - 如果启用了 Source Map（tsconfig 中 "sourceMap": true），
     可以直接看到 .ts 源码，而不是编译后的 .js
   - 点击行号设置断点

3. Console 面板：
   - 可以直接运行 JS/TS 表达式
   - console.log() 的输出在这里
   - console.table() 以表格形式显示对象/数组
   - console.dir() 显示对象结构
   - console.time() / console.timeEnd() 计时

4. Network 面板：
   - 查看所有 HTTP 请求
   - 检查请求/响应的 headers 和 body
   - 类似 Wireshark 但只看 HTTP 层
```

### 调试技巧

```typescript
// ——— console 方法 ———
console.log("basic log");
console.warn("warning");
console.error("error");
console.table([{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }]);
console.group("Group Name");
console.log("inside group");
console.groupEnd();

// ——— debugger 语句 ———
// 在代码中插入 debugger，浏览器会在此暂停
function processData(data: unknown) {
    debugger;  // 浏览器执行到这里会自动暂停
    // 然后可以在 DevTools 中检查变量
}

// ——— 条件断点 ———
// 在 Chrome DevTools 中右键行号 → "Add conditional breakpoint"
// 输入条件表达式，如 i === 100
// 只有条件为 true 时才暂停
```

## 9.2 VS Code 调试

### launch.json 配置

```jsonc
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        // ——— 调试 Node.js 程序 ———
        {
            "type": "node",
            "request": "launch",
            "name": "Debug TS (tsx)",
            "runtimeExecutable": "tsx",
            "args": ["${file}"],           // 当前打开的文件
            "cwd": "${workspaceFolder}"
        },

        // ——— 调试浏览器程序 ———
        {
            "type": "chrome",
            "request": "launch",
            "name": "Debug in Chrome",
            "url": "http://localhost:5173",  // Vite 默认端口
            "webRoot": "${workspaceFolder}/src",
            "sourceMaps": true
        },

        // ——— 附加到已运行的 Node.js 进程 ———
        {
            "type": "node",
            "request": "attach",
            "name": "Attach to Process",
            "port": 9229
        }
    ]
}
```

### VS Code 调试快捷键

```
F5          → 开始调试 / 继续执行
F9          → 切换断点
F10         → 单步跳过（Step Over）
F11         → 单步进入（Step Into）
Shift+F11   → 单步跳出（Step Out）
Shift+F5    → 停止调试
```

> **类比**：VS Code 调试 TS 的体验与用 GDB 调试 C++ 或用 VS Code 调试 Rust 几乎一样。
> 区别在于 TS 需要 Source Map 将运行时的 JS 映射回源码 TS。

## 9.3 构建工具

### Vite（推荐，现代项目首选）

```bash
# 创建 Vite + TS 项目
npm create vite@latest my-app -- --template vanilla-ts
# 可选模板：vanilla-ts, react-ts, vue-ts

cd my-app
npm install
npm run dev    # 启动开发服务器（热更新）
npm run build  # 构建生产版本
```

```typescript
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
    // 开发服务器
    server: {
        port: 3000,
        open: true,           // 自动打开浏览器
    },
    // 构建配置
    build: {
        outDir: "dist",
        sourcemap: true,      // 生产环境也生成 source map
    },
    // 路径别名（对应 tsconfig 的 paths）
    resolve: {
        alias: {
            "@": "/src",
        },
    },
});
```

> **Vite vs Webpack**：
> - Vite 利用浏览器原生 ESM，开发时不需要打包，启动极快
> - Webpack 需要打包所有模块，大项目启动慢
> - 类比：Vite 类似 Rust 的增量编译，Webpack 类似全量编译
> - 新项目推荐 Vite，旧项目可能还在用 Webpack

### Webpack（旧项目可能遇到）

```javascript
// webpack.config.js（简化版）
const path = require("path");

module.exports = {
    entry: "./src/index.ts",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",      // 用 ts-loader 处理 TS 文件
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    devtool: "source-map",
};
```

## 9.4 代码质量工具

### ESLint（代码检查）

```bash
# typescript-eslint v8+（2025/2026 推荐）
npm install -D eslint @eslint/js typescript-eslint
```

```javascript
// eslint.config.mjs（Flat Config 格式，ESLint 9+ 默认）
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            // 自定义规则
            "@typescript-eslint/no-explicit-any": "warn",    // 警告使用 any
            "@typescript-eslint/no-unused-vars": "error",    // 禁止未使用变量
        },
    },
);

// 运行：npx eslint src/
```

> **注意**：ESLint 9+ 使用 Flat Config（`eslint.config.mjs`），不再支持 `.eslintrc`。
> `typescript-eslint` v8 提供 `tseslint.config()` 辅助函数简化配置。

### Prettier（代码格式化）

```bash
npm install -D prettier
```

```jsonc
// .prettierrc
{
    "semi": true,              // 语句末尾分号
    "singleQuote": false,      // 双引号
    "tabWidth": 4,             // 缩进宽度
    "trailingComma": "all",    // 尾随逗号
    "printWidth": 100          // 行宽
}
```

> **类比**：
> - ESLint ≈ Clippy（Rust）/ pylint（Python）/ clang-tidy（C++）
> - Prettier ≈ rustfmt（Rust）/ black（Python）/ clang-format（C++）

## 9.5 测试

```bash
# 推荐 Vitest（与 Vite 集成，类似 pytest）
npm install -D vitest
```

```typescript
// src/utils/math.ts
export function add(a: number, b: number): number {
    return a + b;
}

export function divide(a: number, b: number): number {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
}
```

```typescript
// src/utils/math.test.ts
import { describe, it, expect } from "vitest";
import { add, divide } from "./math";

describe("math utils", () => {
    describe("add", () => {
        it("adds two numbers", () => {
            expect(add(1, 2)).toBe(3);
        });

        it("handles negative numbers", () => {
            expect(add(-1, -2)).toBe(-3);
        });
    });

    describe("divide", () => {
        it("divides two numbers", () => {
            expect(divide(10, 2)).toBe(5);
        });

        it("throws on division by zero", () => {
            expect(() => divide(10, 0)).toThrow("Division by zero");
        });
    });
});
```

```bash
# 运行测试
npx vitest          # 监听模式（文件变化自动重跑）
npx vitest run      # 运行一次
npx vitest --coverage  # 带覆盖率
```

> **对比**：
> - Vitest ≈ pytest（Python）/ cargo test（Rust）/ Google Test（C++）
> - `describe` / `it` 是 BDD 风格，类似 Rust 的 `#[cfg(test)] mod tests`
> - `expect(...).toBe(...)` 是断言，类似 `assert_eq!`

## 9.6 开发工作流总结

```
日常开发流程：
1. npm run dev          → 启动开发服务器（Vite 热更新）
2. 编写代码              → VS Code 实时类型检查
3. 保存                  → ESLint 检查 + Prettier 格式化（配置保存时自动执行）
4. 浏览器查看效果         → 自动刷新
5. 遇到 bug             → Chrome DevTools 或 VS Code 断点调试
6. 写测试               → npx vitest（监听模式自动运行）
7. npm run build        → 构建生产版本
8. tsc --noEmit         → 单独运行类型检查（CI 中使用）

常用 VS Code 设置（settings.json）：
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit"
    },
    "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 9.7 练习

```
练习1：Source Map 体验
  - 创建一个 TS 文件，用 tsc --sourceMap 编译
  - 用 node --inspect dist/index.js 启动调试
  - 在 Chrome DevTools 中打开 chrome://inspect
  - 确认可以在 .ts 源文件中设置断点

练习2：搭建完整工具链
  - 用 Vite 创建一个 vanilla-ts 项目
  - 配置 ESLint + Prettier
  - 配置 Vitest
  - 编写一个工具函数并测试

练习3：调试一个 bug
  - 在 TaskStore 的 filter 方法中故意引入一个 bug
  - 使用 VS Code 断点调试定位问题
  - 编写回归测试确保修复
```

---
下一章：[Chapter 10 - 常见错误与速查表](./10-errors-cheatsheet.md)
