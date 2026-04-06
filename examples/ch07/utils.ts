// =====================================================
// ch07/utils.ts — 工具函数，用于演示重导出和命名空间导入
// =====================================================

import type { Todo } from "./types.ts";

export function formatTodo(todo: Todo): string {
    return `[${todo.completed ? "✓" : " "}] #${todo.id}: ${todo.title}`;
}

export function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
}
