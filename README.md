# TypeScript 快速入门教程

> 为 C/C++/Rust/Python 程序员编写的 TypeScript 系统教程

## 教程章节

| 章节 | 主题 | 示例代码 |
|------|------|---------|
| [Chapter 1](./01-environment-setup.md) | 环境搭建与第一个程序 | [ch01/hello.ts](./examples/ch01/hello.ts) |
| [Chapter 2](./02-type-system-basics.md) | 类型系统基础 | [ch02/types.ts](./examples/ch02/types.ts) |
| [Chapter 3](./03-functions-generics.md) | 函数、泛型与类型推断 | [ch03/functions.ts](./examples/ch03/functions.ts) |
| [Chapter 4](./04-oop-classes.md) | 面向对象：类、继承、装饰器 | [ch04/classes.ts](./examples/ch04/classes.ts) |
| [Chapter 5](./05-advanced-types.md) | 高级类型系统 | [ch05/advanced-types.ts](./examples/ch05/advanced-types.ts) |
| [Chapter 6](./06-async-programming.md) | 异步编程 | [ch06/async.ts](./examples/ch06/async.ts) |
| [Chapter 7](./07-modules-config.md) | 模块系统与项目配置 | [ch07/modules-demo.ts](./examples/ch07/modules-demo.ts) |
| [Chapter 8](./08-project-analysis.md) | 实战项目分析与代码修改 | [ch08/task-store.ts](./examples/ch08/task-store.ts) |
| [Chapter 9](./09-debugging-toolchain.md) | 调试与工具链 | [ch09/testing-demo.ts](./examples/ch09/testing-demo.ts) |
| [Chapter 10](./10-errors-cheatsheet.md) | 常见错误与速查表 | [ch10/error-patterns.ts](./examples/ch10/error-patterns.ts) |

## 运行示例代码

### 前置安装

```bash
npm install    # 安装 typescript 和 tsx
```

### 方式一：tsx（推荐，开发最常用）

```bash
npx tsx examples/ch01/hello.ts
npx tsx examples/ch02/types.ts
# ... 以此类推
```

### 方式二：Node.js 原生运行

```bash
# Node.js v22.18+
node --experimental-strip-types examples/ch01/hello.ts

# Node.js v24+（默认启用类型剥离）
node examples/ch01/hello.ts
```

> **注意**：Node.js 原生模式不支持 `enum`、参数属性、装饰器等需要代码生成的语法。
> Ch04（含装饰器和参数属性）需要用 tsx 或 bun 运行。

### 方式三：Bun

```bash
# 安装 Bun: curl -fsSL https://bun.sh/install | bash
bun examples/ch01/hello.ts
bun examples/ch02/types.ts
# ... 以此类推
```

### 方式四：Deno

```bash
# 安装 Deno: curl -fsSL https://deno.land/install.sh | sh
deno run examples/ch01/hello.ts
deno run examples/ch02/types.ts
# ... 以此类推
```

### 方式五：npm scripts

```bash
npm run ch01    # 运行 Chapter 1 示例
npm run ch02    # 运行 Chapter 2 示例
# ... ch03 到 ch10
```

### 类型检查（不运行代码）

```bash
npm run typecheck    # 等价于 tsc --noEmit
```

## 运行时兼容性

| 示例 | tsx | bun | deno | node (v24+) | node --strip-types (v22.18+) |
|------|-----|-----|------|-------------|------------------------------|
| ch01 | ✓ | ✓ | ✓ | ✓ | ✓ |
| ch02 | ✓ | ✓ | ✓ | ✓* | ✓* |
| ch03 | ✓ | ✓ | ✓ | ✓ | ✓ |
| ch04 | ✓ | ✓ | ✓ | ✗ | ✗ |
| ch05 | ✓ | ✓ | ✓ | ✓ | ✓ |
| ch06 | ✓ | ✓ | ✓ | ✓ | ✓ |
| ch07 | ✓ | ✓ | ✓ | ✓ | ✓ |
| ch08 | ✓ | ✓ | ✓ | ✓ | ✓ |
| ch09 | ✓ | ✓ | ✓ | ✓ | ✓ |
| ch10 | ✓ | ✓ | ✓ | ✓ | ✓ |

\* ch02 含 `enum`，Node.js 原生类型剥离不支持 enum 语法，需用 tsx 或 bun。

Ch04 含装饰器和参数属性简写，均为需要代码生成的 TS 语法，Node.js 原生不支持。
