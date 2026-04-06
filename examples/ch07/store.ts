// =====================================================
// ch07/store.ts — 演示导入类型和导出类
// 使用 import type 导入纯类型（编译后消失）
// =====================================================

// import type: 仅导入类型，运行时不存在
// 类比 Rust: use crate::types::Todo; （但 Rust 不区分类型导入和值导入）
import type { Todo, CreateTodoInput, UpdateTodoInput } from "./types.ts";

// 命名导出一个类
export class TodoStore {
    private todos: Map<string, Todo> = new Map();
    private nextId = 1;

    create(input: CreateTodoInput): Todo {
        const todo: Todo = {
            ...input,
            id: String(this.nextId++),
            createdAt: new Date(),
        };
        this.todos.set(todo.id, todo);
        return todo;
    }

    update(id: string, input: UpdateTodoInput): Todo | null {
        const existing = this.todos.get(id);
        if (!existing) return null;
        const updated = { ...existing, ...input };
        this.todos.set(id, updated);
        return updated;
    }

    delete(id: string): boolean {
        return this.todos.delete(id);
    }

    getById(id: string): Todo | undefined {
        return this.todos.get(id);
    }

    getAll(): Todo[] {
        return Array.from(this.todos.values());
    }

    filter(predicate: (todo: Todo) => boolean): Todo[] {
        return this.getAll().filter(predicate);
    }
}
