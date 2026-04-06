// =====================================================
// ch07/index.ts — 桶文件（Barrel File），聚合重导出
// 类似 Rust 的 pub use / Python 的 __init__.py
// 使用方可以从一个入口导入所有需要的东西：
//   import { TodoStore, formatTodo, add } from "./index.ts";
// =====================================================

// 重导出：从其他模块收集并统一导出
export { add, multiply, PI } from "./math.ts";
export { default as Calculator } from "./math.ts";      // 重导出默认导出并命名
export { TodoStore } from "./store.ts";
export { formatTodo, formatDate } from "./utils.ts";

// 仅重导出类型
export type { Todo, CreateTodoInput, ApiResponse } from "./types.ts";

// 也可以用 export * from "./utils.ts" 导出模块的所有命名导出
// 但显式列出更清晰，避免意外导出内部实现
