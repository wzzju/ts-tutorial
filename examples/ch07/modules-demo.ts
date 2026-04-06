// =====================================================
// Chapter 7 示例：模块系统演示（主入口）
// 本文件通过真实的 import/export 演示模块机制
//
// 文件结构：
//   ch07/
//   ├── types.ts        — 类型定义（export interface/type）
//   ├── math.ts         — 命名导出 + 默认导出
//   ├── store.ts        — 导入类型，导出类
//   ├── utils.ts        — 工具函数
//   ├── index.ts        — 桶文件（重导出）
//   └── modules-demo.ts — 主入口（本文件）
//
// 运行方式：
//   Node.js (v22.18+): node --experimental-strip-types examples/ch07/modules-demo.ts
//   Node.js (v24+):    node examples/ch07/modules-demo.ts
//   Node.js (tsx):     npx tsx examples/ch07/modules-demo.ts
//   Bun:               bun examples/ch07/modules-demo.ts
// =====================================================

console.log("=== Chapter 7: 模块系统演示 ===\n");

// ——— 1. 命名导入（Named Import）———
// 从 math.ts 导入指定的函数和常量
import { add, multiply, PI } from "./math.ts";

console.log("--- 1. 命名导入 ---");
console.log(`add(2, 3) = ${add(2, 3)}`);
console.log(`multiply(4, 5) = ${multiply(4, 5)}`);
console.log(`PI = ${PI}`);

// ——— 2. 默认导入（Default Import）———
// 默认导出可以用任意名字导入
import Calculator from "./math.ts";

console.log("\n--- 2. 默认导入 ---");
const calc = new Calculator();
calc.run("add", 10, 20);
calc.run("multiply", 3, 7);
console.log("Calculator history:", calc.getHistory());

// ——— 3. 重命名导入（Import Renaming）———
// 类似 Python 的 from math import add as math_add
import { add as mathAdd } from "./math.ts";

console.log("\n--- 3. 重命名导入 ---");
console.log(`mathAdd(100, 200) = ${mathAdd(100, 200)}`);

// ——— 4. 命名空间导入（Namespace Import）———
// 类似 Python 的 import module
// 类似 Rust 的 use module::*（但更显式）
import * as MathUtils from "./math.ts";

console.log("\n--- 4. 命名空间导入 ---");
console.log(`MathUtils.add(7, 8) = ${MathUtils.add(7, 8)}`);
console.log(`MathUtils.PI = ${MathUtils.PI}`);

// ——— 5. 类型导入（Type-Only Import）———
// import type 只导入类型，编译后完全消失
// 类比 Rust: use crate::types::Todo;（Rust 不区分值/类型导入）
import type { Todo, ApiResponse } from "./types.ts";

console.log("\n--- 5. 类型导入 ---");
// Todo 和 ApiResponse 只能用于类型标注，不能当值使用
const response: ApiResponse<Todo[]> = {
    data: [],
    status: 200,
    message: "ok",
};
console.log(`ApiResponse status: ${response.status}, message: ${response.message}`);

// ——— 6. 从桶文件（Barrel File）导入 ———
// index.ts 聚合了所有模块的导出，一行导入多个模块的内容
import { TodoStore, formatTodo, formatDate } from "./index.ts";

console.log("\n--- 6. 通过 index.ts 桶文件导入 ---");
const store = new TodoStore();

const todo1 = store.create({ title: "Learn TypeScript modules", completed: false });
const todo2 = store.create({ title: "Build a project", completed: false });
const todo3 = store.create({ title: "Write tests", completed: true });

console.log("All todos:");
store.getAll().forEach(t => console.log(`  ${formatTodo(t)}`));

store.update(todo1.id, { completed: true });
console.log("\nAfter completing todo1:");
store.getAll().forEach(t => console.log(`  ${formatTodo(t)}`));

const incomplete = store.filter(t => !t.completed);
console.log(`\nIncomplete: ${incomplete.length} items`);

store.delete(todo3.id);
console.log(`After delete: ${store.getAll().length} items remaining`);

console.log(`\nToday: ${formatDate(new Date())}`);

// ——— 7. 模块只执行一次 ———
// 与 C/C++ 的 #include 不同，import 同一模块多次不会重复执行
// 下面两行导入同一模块，math.ts 的顶层代码只运行一次
console.log("\n--- 7. 模块只执行一次 ---");
console.log("多次 import 同一模块，模块代码只执行一次（天然去重，无需 include guard）");

// ——— 8. .d.ts 声明文件概念 ———
console.log("\n--- 8. .d.ts 声明文件（类似 C/C++ 头文件）---");
console.log(`
.d.ts 文件只包含类型信息，没有实现：

  // 为纯 JS 库提供类型
  declare module "legacy-lib" {
      export function parse(input: string): object;
  }

  // 声明全局变量
  declare const __VERSION__: string;

大多数第三方库的类型：
  npm install lodash           # JS 库本身
  npm install -D @types/lodash # 类型定义（devDependency）
`);

console.log("=== Chapter 7 完成 ===");
