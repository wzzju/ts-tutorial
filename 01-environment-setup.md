# Chapter 1: 环境搭建与第一个程序

> 目标：安装 TypeScript 工具链，理解 TS 与 JS 的关系，运行第一个程序。
> 示例代码：[examples/ch01/hello.ts](./examples/ch01/hello.ts)

## 1.1 TypeScript 是什么

TypeScript 是 JavaScript 的**超集**——所有合法 JS 代码都是合法 TS 代码。TS 在 JS 之上添加了**静态类型系统**，在编译期（而非运行期）捕获类型错误。

类比你熟悉的语言：

| 你的经验 | TypeScript 对应理解 |
|---------|-------------------|
| C/C++ 编译为机器码 | TS **编译为 JS**（类似 C++ 编译为汇编） |
| Rust 的零成本抽象 | TS 类型信息在编译后**完全擦除**，运行时零开销 |
| Python 的 type hints | TS 类型是**强制检查**的，不像 Python 只是提示 |

**关键心智模型**：TS = JS + 编译期类型检查。运行时只有 JS，没有 TS。

## 1.2 安装运行时与 TypeScript

### 方式一：Node.js（最通用）

```bash
# macOS
brew install node

# 验证
node --version   # v22.x 或更高（推荐 v22.18+ 或 v24+）
npm --version    # 10.x 或更高

# 全局安装 TypeScript 编译器
npm install -g typescript

# 验证
tsc --version    # Version 5.8.x（截至 2025 年最新稳定版）
```

### 方式二：Bun（更快的替代运行时）

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# 验证
bun --version    # 1.x

# Bun 内置 TypeScript 支持，无需额外安装
```

### 方式三：Deno（另一个现代运行时）

```bash
# macOS / Linux
curl -fsSL https://deno.land/install.sh | sh

# 验证
deno --version   # 2.x

# Deno 原生支持 TypeScript，零配置
deno run hello.ts
```

> **Node.js vs Bun vs Deno vs 浏览器**：
> - **Node.js** = 最成熟的 JS 运行时，生态最完整，类似 Python 解释器
> - **Bun** = 新一代运行时（用 Zig 编写），原生支持 TS，启动更快
> - **Deno** = Ryan Dahl（Node.js 创始人）的新作，原生 TS 支持，内置安全沙箱
> - **浏览器** = 前端 JS 运行时，有 DOM/window 等浏览器特有 API
> - 本教程示例同时支持 Node.js、Bun 和 Deno，浏览器特有 API 会标注

## 1.3 第一个 TypeScript 程序

与 C/C++、Rust 不同，TypeScript/JavaScript **没有 `main` 函数**。代码从文件顶部开始，逐行执行到底部——这一点和 Python 一样：

```
C++/Rust:      编译器找 main() → 从 main() 开始执行
Python/TS/JS:  从文件第一行开始，逐行执行到底部
```

创建文件 `hello.ts`：

```typescript
// hello.ts
// 注意：TS 用 let/const 声明变量，不用 var
// const = 不可重绑定（类似 Rust 的默认不可变绑定）
// let = 可重绑定（类似 Rust 的 let mut）

const greeting: string = "Hello, TypeScript!";
let count: number = 42;
let active: boolean = true;

// 函数：参数和返回值都有类型注解
function add(a: number, b: number): number {
    return a + b;
}

console.log(greeting);          // 类似 Python 的 print()，Rust 的 println!()
console.log(add(count, 8));     // 50
```

## 1.4 运行方式（四种）

```bash
# ——— 方式 1：tsx（Node.js 生态，推荐开发使用）———
npm install -g tsx     # 安装
tsx hello.ts           # 内存中转译+运行，不生成文件

# ——— 方式 2：Node.js 原生运行 TS（v22.18+）———
# Node.js 22.18+ 内置类型剥离（type stripping），可直接运行 .ts 文件
node --experimental-strip-types hello.ts   # Node.js 22.18+
node hello.ts                              # Node.js 24+（默认启用）
# 注意：类型剥离不支持 enum、参数属性等需要代码生成的 TS 语法

# ——— 方式 3：Bun 直接运行（最快）———
bun hello.ts           # 原生支持，零配置，启动最快

# ——— 方式 3b：Deno 直接运行 ———
deno run hello.ts      # 原生 TS 支持，内置权限系统

# ——— 方式 4：tsc 编译 + node 运行（传统方式）———
tsc --target ES2022 --module ESNext hello.ts   # 编译 TS → JS，生成 hello.js
node hello.js                                   # 运行 JS
# 注意：直接 tsc hello.ts 不会读取 tsconfig.json，使用默认配置（ES3 + CommonJS）
# 如果 package.json 有 "type": "module"，需要指定 --module ESNext 避免模块格式冲突
```

> **Node.js 原生 TS 支持的限制**：
> Node.js 的 `--experimental-strip-types` 只做类型剥离（删除类型注解），不做语法转换。
> 以下 TS 语法**不被支持**（因为它们需要生成额外 JS 代码）：
> - `enum`（用联合类型或 `as const` 对象代替）
> - 参数属性简写（`constructor(public x: number)`）
> - 旧式实验性装饰器（`experimentalDecorators`）
> - `namespace`
>
> 这些语法在 tsx、Bun 和 Deno 中均可正常使用。

### tsc 与 tsx 的区别

这两个工具名字只差一个字母，但职责完全不同：

- **`tsc`**（TypeScript Compiler）—— TypeScript 官方**编译器**
  - 做类型检查 + 编译输出 `.js` 文件
  - `tsc --noEmit`：只检查类型，不生成文件
  - **不能直接执行代码**

- **`tsx`**（TypeScript Execute）—— 第三方**执行工具**
  - 底层用 esbuild 在内存中转译，直接运行 `.ts` 文件
  - **不做类型检查**
  - 角色类似 `bun hello.ts`，但跑在 Node.js 上

实际开发中两者互补使用：`tsx`（或 `bun`）负责快速运行，`tsc --noEmit` 负责类型检查。

### 编译一定会产生 .js 文件吗？

不一定。只有 `tsc` 默认会在磁盘上生成 `.js` 文件，其他方式都在**内存中**完成类型擦除/转译：

```
tsc hello.ts      → 磁盘上生成 hello.js → node hello.js 执行
tsx hello.ts      → 内存中转译（esbuild）→ 直接执行
bun hello.ts      → 内存中转译（Zig 实现）→ 直接执行
deno run hello.ts → 内存中转译（SWC 实现）→ 直接执行
node hello.ts     → 内存中类型擦除（Amaro/SWC）→ 直接执行（v22.18+）
```

> **关键理解**：所有 JS 运行时（V8 / JavaScriptCore）最终执行的都是 JavaScript。
> TS 不是独立的执行语言，而是 JS 的类型层超集。"TS → JS"这一步始终存在，
> 区别只在于是否落盘。
>
> **类型检查**：Node.js、Bun、Deno、tsx 都**不做类型检查**——它们只是把类型注解去掉让代码能跑。
> 如果需要类型安全保障，仍然需要单独运行 `tsc --noEmit`。
> （Deno 可通过 `deno check hello.ts` 做类型检查，但默认运行时不检查。）

### npm、npx 与 pnpm

```bash
npx tsx hello.ts       # npx 运行本地或临时下载的命令
npx tsc --noEmit       # 运行本地安装的 tsc
```

- **npm**（Node Package Manager）—— 包管理器，类似 pip（Python）/ cargo（Rust）
- **npx**（Node Package Execute）—— npm 附带的命令执行器，优先找本地 `node_modules/.bin/` 下的命令，没有则临时下载执行
- **pnpm** —— npm 的高性能替代品，API 几乎一致，磁盘效率更高、依赖更严格

## 1.5 编译产物分析

查看 `tsc hello.ts` 生成的 `hello.js`（这是唯一会产生磁盘文件的方式）：

```javascript
// hello.js（编译产物，target: ES2022）
// 注意：类型注解被擦除，但 let/const 保留（不会降级为 var）
const greeting = "Hello, TypeScript!";
let count = 42;
let active = true;
function add(a, b) {
    return a + b;
}
console.log(greeting);
console.log(add(count, 8));
```

> **注意**：只有当 `tsconfig.json` 中 `target` 设置为 `ES5` 时，`let/const` 才会被降级为 `var`。
> 现代项目通常设置 `target: "ES2022"` 或更高，编译产物保留原始语法。

### `export {}` 的作用

你可能注意到示例代码末尾有一行 `export {};`，这不是真正导出东西，而是告诉 TS 把文件视为 **ES 模块**（而非脚本）。区别在于：

- **脚本模式**：所有顶层变量进入全局作用域，多个文件的同名变量会冲突
- **模块模式**：每个文件有独立的作用域（类似 Rust 的 mod、Python 的模块）

一旦文件中有了真正的 `import` / `export` 语句，这行就可以删掉。详见 [Chapter 7 - 模块系统](./07-modules-config.md)。

## 1.6 VS Code 配置

VS Code 是 TypeScript 开发的最佳 IDE（TS 和 VS Code 都是微软出品）。

必装扩展：
- **TypeScript**（内置，无需安装）
- **Error Lens**：行内显示错误信息
- **Pretty TypeScript Errors**：更可读的错误信息

可选但推荐：
- **Biome**：新一代 Linter + Formatter（Rust 编写，极快，可替代 ESLint + Prettier）
- **ESLint**：传统代码检查工具（如果项目使用 ESLint）

VS Code 的 TS 支持是**实时**的——保存文件前就能看到类型错误，类似你在写 Rust 时 rust-analyzer 的体验。

## 1.8 关键概念：JS 运行时的"怪异行为"

作为 C/C++/Rust 程序员，以下 JS/TS 行为可能让你意外：

```typescript
// 1. 没有整数类型——所有数字都是 IEEE 754 双精度浮点
let x: number = 1;       // 没有 int、float、i32、u64 之分
let y: number = 1.5;     // 都是 number

// 2. 字符串用单引号、双引号或反引号（模板字符串）
let s1: string = 'hello';
let s2: string = "hello";
let s3: string = `value is ${x}`;  // 类似 Python f-string / Rust format!()

// 3. null 和 undefined 是两个不同的"空值"
let a: null = null;           // 显式空
let b: undefined = undefined; // 未赋值的默认状态
// 实践中主要用 null，类似 Python 的 None / Rust 的 None

// 4. 相等比较：永远用 === 而不是 ==
// === 是严格相等（类型+值），== 会做隐式类型转换
console.log(1 === 1);    // true
console.log(1 === "1");  // false（类型不同）—— 编译期 TS 也会报错
```

## 1.9 练习

1. 创建一个 `exercise01.ts`，定义一个函数 `greet(name: string): string`，返回 `"Hello, {name}!"`。
2. 尝试传入一个 `number` 类型参数，观察编译器的错误信息。
3. 分别用 `tsx`、`node`（原生）、`bun`、`deno` 四种方式运行你的程序。

---
下一章：[Chapter 2 - 类型系统基础](./02-type-system-basics.md)
