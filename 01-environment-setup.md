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
tsc --version    # Version 5.x
```

### 方式二：Bun（更快的替代运行时）

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# 验证
bun --version    # 1.x

# Bun 内置 TypeScript 支持，无需额外安装
```

> **Node.js vs Bun vs 浏览器**：
> - **Node.js** = 最成熟的 JS 运行时，生态最完整，类似 Python 解释器
> - **Bun** = 新一代运行时（用 Zig 编写），原生支持 TS，启动更快
> - **浏览器** = 前端 JS 运行时，有 DOM/window 等浏览器特有 API
> - 本教程示例同时支持 Node.js 和 Bun，浏览器特有 API 会标注

## 1.3 第一个 TypeScript 程序

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
# ——— 方式 1：tsc 编译 + node 运行（传统方式）———
tsc hello.ts          # 编译 TS → JS，生成 hello.js
node hello.js         # 运行 JS

# ——— 方式 2：tsx（Node.js 生态，推荐开发使用）———
npm install -g tsx     # 安装
tsx hello.ts           # 一步编译+运行

# ——— 方式 3：Node.js 原生运行 TS（v22.18+）———
# Node.js 22.18+ 内置类型剥离（type stripping），可直接运行 .ts 文件
node --experimental-strip-types hello.ts   # Node.js 22.18+
node hello.ts                              # Node.js 24+（默认启用）
# 注意：类型剥离不支持 enum、参数属性等需要代码生成的 TS 语法

# ——— 方式 4：Bun 直接运行（最快）———
bun hello.ts           # 原生支持，零配置，启动最快
```

> **Node.js 原生 TS 支持的限制**：
> Node.js 的 `--experimental-strip-types` 只做类型剥离（删除类型注解），不做语法转换。
> 以下 TS 语法**不被支持**（因为它们需要生成额外 JS 代码）：
> - `enum`（用联合类型或 `as const` 对象代替）
> - 参数属性简写（`constructor(public x: number)`）
> - 旧式实验性装饰器（`experimentalDecorators`）
> - `namespace`
>
> 这些语法在 tsx 和 Bun 中均可正常使用。

## 1.5 编译产物分析

查看 `tsc hello.ts` 生成的 `hello.js`（默认 target 为 ES2022 时）：

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

## 1.6 VS Code 配置

VS Code 是 TypeScript 开发的最佳 IDE（TS 和 VS Code 都是微软出品）。

必装扩展：
- **TypeScript**（内置，无需安装）
- **Error Lens**：行内显示错误信息
- **Pretty TypeScript Errors**：更可读的错误信息

VS Code 的 TS 支持是**实时**的——保存文件前就能看到类型错误，类似你在写 Rust 时 rust-analyzer 的体验。

## 1.7 关键概念：JS 运行时的"怪异行为"

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

## 1.8 练习

1. 创建一个 `exercise01.ts`，定义一个函数 `greet(name: string): string`，返回 `"Hello, {name}!"`。
2. 尝试传入一个 `number` 类型参数，观察编译器的错误信息。
3. 分别用 `tsx`、`node`（原生）、`bun` 三种方式运行你的程序。

---
下一章：[Chapter 2 - 类型系统基础](./02-type-system-basics.md)
