// =====================================================
// ch07/types.ts — 演示类型导出
// 这些类型编译后会被完全擦除，不会出现在 JS 中
// 类比 Rust: 单独的 types.rs 定义共享结构体
// =====================================================

// 导出接口
export interface Todo {
    id: string;
    title: string;
    completed: boolean;
    createdAt: Date;
}

// 导出类型别名（基于已有类型派生）
export type CreateTodoInput = Omit<Todo, "id" | "createdAt">;
export type UpdateTodoInput = Partial<Omit<Todo, "id" | "createdAt">>;

// 导出泛型类型
export type ApiResponse<T> = {
    data: T;
    status: number;
    message: string;
};
