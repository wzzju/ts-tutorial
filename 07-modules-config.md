# Chapter 7: 模块系统与项目配置

> 目标：理解 TS 的模块系统、tsconfig.json 配置、.d.ts 声明文件。
> 示例代码：[examples/ch07/modules-demo.ts](./examples/ch07/modules-demo.ts) — 运行：`npx tsx examples/ch07/modules-demo.ts` | `bun examples/ch07/modules-demo.ts` | `node examples/ch07/modules-demo.ts`(v24+)

## 7.1 模块系统（ESM）

TS 使用 ES Modules（ESM），与 C/C++ 的头文件和 Rust 的模块系统有本质区别。

### 与其他语言对比

```
C/C++:   #include "header.h"     → 文本替换，全局命名空间
Rust:    mod module; use module::Item;  → 模块树，显式引入
Python:  from module import func  → 运行时导入
TS:      import { func } from "./module";  → 编译期解析，运行时加载
```

### 基本导入导出

```typescript
// ——— math.ts（导出模块）———
// 命名导出（Named Export）
export function add(a: number, b: number): number {
    return a + b;
}

export function multiply(a: number, b: number): number {
    return a * b;
}

export const PI = 3.14159;

export interface MathResult {
    value: number;
    operation: string;
}

// 默认导出（Default Export）——每个模块只能有一个
export default class Calculator {
    // ...
}
```

```typescript
// ——— app.ts（导入模块）———

// 导入命名导出
import { add, multiply, PI } from "./math";
// 注意：路径不需要 .ts 后缀

// 导入默认导出
import Calculator from "./math";

// 导入并重命名（类似 Python 的 as）
import { add as mathAdd } from "./math";

// 导入所有导出为命名空间（类似 Python 的 import module）
import * as MathUtils from "./math";
MathUtils.add(1, 2);

// 只导入类型（编译后完全消失）
import type { MathResult } from "./math";
// 或
import { type MathResult, add } from "./math";
```

### 重导出（Re-export）

```typescript
// ——— index.ts（模块入口，聚合导出）———
// 类似 Rust 的 pub use / Python 的 __init__.py

export { add, multiply } from "./math";
export { default as Calculator } from "./math";
export * from "./utils";  // 导出 utils 的所有命名导出
export type { MathResult } from "./math";
```

### 导入路径的扩展名

导入路径是否需要写文件后缀（`.ts` / `.js`），取决于运行环境和 `tsconfig.json` 配置：

```typescript
import { add } from "./math";      // 无后缀
import { add } from "./math.js";   // .js 后缀
import { add } from "./math.ts";   // .ts 后缀（源文件扩展名）
```

```
               无后缀     .js      .ts
tsc + bundler   ✓         ✓        ✓ (需 allowImportingTsExtensions)
tsx / esbuild   ✓         ✓        ✓
Bun             ✓         ✓        ✓
Node.js ESM     ✗         ✓        ✓ (v22.6+)
```

**为什么会有这种差异？**
- ESM 规范要求**必须带扩展名**，Node.js 严格遵循此规范
- Bundler 工具（tsx、esbuild、Vite、Webpack）自己实现了模块解析，允许省略后缀
- TypeScript 历史上默认省略后缀，但写 `.js` 是因为 import 路径指向**编译后的产物**

**实际项目中的惯例：**
- 前端项目（Vite/Webpack）：通常**省略后缀** `"./math"`
- Node.js ESM 后端项目：写 `"./math.js"`（即使源文件是 `.ts`）
- Bun 项目：写 `"./math.ts"` 最直观，也支持省略

> 建议：团队内保持一致即可。本教程示例使用 `.ts` 后缀，因为源文件就是 `.ts`，意图最明确，且 tsx / Bun / Node v22.6+ 均支持。

> **与 C/C++ 头文件的关键差异**：
> - C/C++: `#include` 是文本替换，同一个头文件可能被多次包含（需要 include guard）
> - TS: `import` 是模块引用，每个模块只会执行一次（天然去重）
> - C/C++: 头文件不包含实现（通常）→ TS: 一个文件既是声明又是实现
> - C/C++: 全局命名空间 → TS: 每个文件都是独立的模块作用域

## 7.2 tsconfig.json

`tsconfig.json` 是 TS 项目的配置文件，类似 `Cargo.toml`（Rust）或 `CMakeLists.txt`（C++）。

```jsonc
// tsconfig.json
{
    "compilerOptions": {
        // ——— 输出目标 ———
        "target": "ES2023",        // 编译目标 JS 版本（推荐 ES2022 或 ES2023）
        "module": "ESNext",         // 模块系统格式
        "moduleResolution": "bundler", // 模块解析策略（前端项目推荐）
        "outDir": "./dist",         // 输出目录
        "rootDir": "./src",         // 源码根目录

        // ——— 类型检查严格度 ———
        "strict": true,             // 开启所有严格检查（强烈推荐）
        // strict 包含以下所有：
        // "strictNullChecks": true,       // null/undefined 检查
        // "noImplicitAny": true,          // 禁止隐式 any
        // "strictFunctionTypes": true,    // 函数参数逆变检查
        // "strictPropertyInitialization": true,  // 类属性必须初始化

        // ——— 额外严格选项 ———
        "noUncheckedIndexedAccess": true,  // 索引访问返回 T | undefined
        "noUnusedLocals": true,            // 未使用的局部变量报错
        "noUnusedParameters": true,        // 未使用的参数报错
        "erasableSyntaxOnly": false,       // TS 5.8+：是否只允许可擦除语法

        // ——— 互操作 ———
        "esModuleInterop": true,    // 允许 import x from "commonjs-module"
        "allowSyntheticDefaultImports": true,
        "resolveJsonModule": true,  // 允许 import json 文件
        "verbatimModuleSyntax": true, // TS 5.0+：严格模块语法（替代 importsNotUsedAsValues）

        // ——— 声明文件 ———
        "declaration": true,        // 生成 .d.ts 声明文件
        "declarationMap": true,     // 声明文件的 source map
        "sourceMap": true,          // JS 的 source map（调试用）

        // ——— 路径别名 ———
        "baseUrl": ".",
        "paths": {
            "@/*": ["./src/*"],     // import { x } from "@/utils" → ./src/utils
            "@components/*": ["./src/components/*"]
        },

        // ——— 库 ———
        "lib": ["ES2023", "DOM", "DOM.Iterable"]  // 可用的全局类型
        // "DOM" 提供浏览器 API 类型（document, window 等）
        // 不加 "DOM" 则只有 Node.js 环境
    },

    // ——— 文件范围 ———
    "include": ["src/**/*"],       // 包含哪些文件
    "exclude": ["node_modules", "dist", "**/*.test.ts"]  // 排除哪些文件
}
```

### TS 5.x 新增配置选项

```jsonc
{
    "compilerOptions": {
        // verbatimModuleSyntax (TS 5.0+)
        // 替代旧的 importsNotUsedAsValues 和 preserveValueImports
        // 强制使用 import type 导入纯类型，避免运行时副作用
        "verbatimModuleSyntax": true,

        // erasableSyntaxOnly (TS 5.8+)
        // 只允许可擦除的 TS 语法（类型注解、接口等）
        // 禁止 enum、参数属性、namespace 等需要代码生成的语法
        // 适用于配合 Node.js --experimental-strip-types 使用
        "erasableSyntaxOnly": false,  // 默认 false，按需开启
    }
}
```

### 常见配置场景

```jsonc
// 纯 Node.js 项目
{
    "compilerOptions": {
        "target": "ES2023",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "lib": ["ES2023"],           // 不包含 DOM
        "outDir": "./dist"
    }
}

// 浏览器前端项目（配合 Vite/Webpack）
{
    "compilerOptions": {
        "target": "ES2023",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "lib": ["ES2023", "DOM", "DOM.Iterable"],
        "jsx": "react-jsx",          // React JSX 支持
        "noEmit": true                // 不输出 JS（交给 Vite/Webpack）
    }
}

// 配合 Node.js --experimental-strip-types 的项目
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "erasableSyntaxOnly": true,   // 只允许可擦除语法
        "verbatimModuleSyntax": true,
        "noEmit": true
    }
}
```

## 7.3 类型声明文件（.d.ts）

`.d.ts` 文件只包含类型信息，没有实现——类似 C/C++ 的头文件（.h）。

```typescript
// ——— types.d.ts ———
// 为纯 JS 库提供类型信息

// 声明一个模块的类型
declare module "some-js-library" {
    export function doSomething(input: string): number;
    export interface Config {
        verbose: boolean;
        timeout: number;
    }
    export default class Client {
        constructor(config: Config);
        connect(): Promise<void>;
    }
}

// 声明全局变量（如浏览器注入的）
declare const __VERSION__: string;
declare const __DEBUG__: boolean;

// 声明全局函数
declare function gtag(command: string, ...args: any[]): void;

// 扩展已有类型（Declaration Merging）
// 例如给 Window 添加自定义属性
declare global {
    interface Window {
        myApp: {
            version: string;
            config: Record<string, unknown>;
        };
    }
}
```

### 第三方库的类型

```bash
# 大多数流行库都有类型定义，发布在 @types/ 命名空间下
# 例如 lodash 本身是 JS 库，类型单独安装：
npm install lodash
npm install -D @types/lodash    # -D 表示开发依赖

# 很多现代库自带类型（如 axios），不需要额外安装 @types/
npm install axios  # 自带 .d.ts
```

### 阅读 .d.ts 文件的技巧

```typescript
// 以 @types/node 的 fs 模块为例（简化版）
declare module "fs" {
    // 函数重载：多个签名
    export function readFile(
        path: string,
        encoding: BufferEncoding,
        callback: (err: NodeJS.ErrnoException | null, data: string) => void
    ): void;

    export function readFile(
        path: string,
        callback: (err: NodeJS.ErrnoException | null, data: Buffer) => void
    ): void;

    // Promise 版本在 fs/promises
    export namespace promises {
        function readFile(path: string, encoding: BufferEncoding): Promise<string>;
        function readFile(path: string): Promise<Buffer>;
    }
}
// 阅读方法：
// 1. 找到你要用的函数名
// 2. 看有几个重载（哪些参数组合合法）
// 3. 注意返回类型
// 4. 查看泛型约束
```

## 7.4 npm 包管理基础

```bash
# npm 是 Node.js 的包管理器，类似 pip（Python）/ cargo（Rust）/ conan（C++）

# 初始化项目（生成 package.json）
npm init -y

# 安装依赖
npm install axios              # 运行时依赖（dependencies）
npm install -D typescript      # 开发依赖（devDependencies）

# package.json 记录依赖，类似 Cargo.toml / requirements.txt
# node_modules/ 存放实际代码，类似 Python 的 venv/lib

# 常用命令
npm install          # 安装所有依赖
npm run build        # 运行 package.json 中定义的 build 脚本
npm run dev          # 运行开发服务器
```

```jsonc
// package.json（简化版）
{
    "name": "my-project",
    "version": "1.0.0",
    "scripts": {
        "build": "tsc",                    // npm run build → 运行 tsc
        "dev": "tsx watch src/index.ts",   // npm run dev → 开发模式
        "test": "vitest"
    },
    "dependencies": {
        "axios": "^1.7.0"         // 运行时需要
    },
    "devDependencies": {
        "typescript": "^5.8.0",   // 只在开发时需要
        "@types/node": "^22.0.0"
    }
}
```

## 7.5 项目结构惯例

```
my-project/
├── src/                    # 源码目录
│   ├── index.ts            # 入口文件
│   ├── types/              # 共享类型定义
│   │   └── index.ts
│   ├── utils/              # 工具函数
│   │   ├── string.ts
│   │   └── index.ts        # 重导出（barrel file）
│   ├── services/           # 业务逻辑
│   │   └── api.ts
│   └── components/         # UI 组件（前端项目）
├── dist/                   # 编译输出（git ignore）
├── node_modules/           # 依赖（git ignore）
├── tests/                  # 测试文件
├── tsconfig.json           # TS 配置
├── package.json            # 项目配置和依赖
├── package-lock.json       # 依赖锁定文件（类似 Cargo.lock）
└── .gitignore
```

```typescript
// src/types/index.ts — 集中管理类型
export interface User {
    id: number;
    name: string;
    email: string;
}

export type ApiResponse<T> = {
    data: T;
    status: number;
    message: string;
};
```

```typescript
// src/utils/index.ts — Barrel file（桶文件），统一导出
export { formatDate, parseDate } from "./date";
export { capitalize, truncate } from "./string";
export { debounce, throttle } from "./async";

// 使用时可以简洁导入：
// import { formatDate, capitalize } from "@/utils";
```

## 7.6 练习

```
练习1：创建一个小项目
  - 初始化 npm 项目和 tsconfig.json
  - 创建 src/types.ts 定义 Todo 接口
  - 创建 src/store.ts 实现增删查改
  - 创建 src/index.ts 作为入口
  - 用 tsc 编译，确认输出到 dist/

练习2：为以下纯 JS 模块编写 .d.ts 声明文件
  // legacy-lib.js
  function parse(input) { /* ... */ }
  function stringify(obj) { /* ... */ }
  module.exports = { parse, stringify };

练习3：阅读 node_modules/@types/node/fs.d.ts
  - 找到 readFileSync 的类型签名
  - 理解它的重载形式
  - 理解 BufferEncoding 类型
```

---
下一章：[Chapter 8 - 实战项目分析](./08-project-analysis.md)
