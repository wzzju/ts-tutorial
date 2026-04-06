// =====================================================
// Chapter 8 示例：实战项目——任务管理器
// 运行方式：
//   Node.js (v22.18+): node --experimental-strip-types task-store.ts
//   Node.js (v24+):    node task-store.ts
//   Node.js (tsx):     npx tsx task-store.ts
//   Bun:               bun task-store.ts
// =====================================================

console.log("=== Chapter 8: 实战项目 - 任务管理器 ===\n");

// ——— 类型定义层 ———

type Priority = "low" | "medium" | "high" | "critical";
type TaskStatus = "todo" | "in_progress" | "done" | "archived";

interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    assignee: string | null;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    dueDate: Date | null;
}

type CreateTaskInput = Omit<Task, "id" | "createdAt" | "updatedAt">;
type UpdateTaskInput = Partial<Omit<Task, "id" | "createdAt">>;

interface TaskFilter {
    status?: TaskStatus | TaskStatus[];
    priority?: Priority | Priority[];
    assignee?: string;
    search?: string;
}

// 可辨识联合：事件类型
type TaskEvent =
    | { kind: "created"; task: Task }
    | { kind: "updated"; task: Task; changes: UpdateTaskInput }
    | { kind: "deleted"; taskId: string };

// 泛型 Result 类型
type Result<T, E = string> =
    | { ok: true; value: T }
    | { ok: false; error: E };

// 批量操作类型
type BatchOperation =
    | { action: "update_status"; ids: string[]; status: TaskStatus }
    | { action: "assign"; ids: string[]; assignee: string }
    | { action: "delete"; ids: string[] };

interface BatchResult {
    succeeded: string[];
    failed: { id: string; reason: string }[];
}

// 排序配置
interface SortConfig {
    field: "createdAt" | "priority" | "title";
    order: "asc" | "desc";
}

// ——— 数据存储层 ———

type Listener<T> = (data: T) => void;

let nextId = 0;
function generateId(): string {
    return `task_${++nextId}`;
}

class TaskStore {
    private tasks: Map<string, Task> = new Map();
    private listeners: Set<Listener<TaskEvent>> = new Set();

    private notify(event: TaskEvent): void {
        this.listeners.forEach(fn => fn(event));
    }

    create(input: CreateTaskInput): Result<Task> {
        if (!input.title.trim()) {
            return { ok: false, error: "Title cannot be empty" };
        }

        const now = new Date();
        const task: Task = {
            ...input,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
        };
        this.tasks.set(task.id, task);
        this.notify({ kind: "created", task });
        return { ok: true, value: task };
    }

    update(id: string, changes: UpdateTaskInput): Result<Task> {
        const existing = this.tasks.get(id);
        if (!existing) {
            return { ok: false, error: `Task not found: ${id}` };
        }

        const updated: Task = {
            ...existing,
            ...changes,
            updatedAt: new Date(),
        };
        this.tasks.set(id, updated);
        this.notify({ kind: "updated", task: updated, changes });
        return { ok: true, value: updated };
    }

    delete(id: string): boolean {
        const task = this.tasks.get(id);
        if (!task) return false;
        this.tasks.delete(id);
        this.notify({ kind: "deleted", taskId: id });
        return true;
    }

    getById(id: string): Task | undefined {
        return this.tasks.get(id);
    }

    filter(criteria: TaskFilter): Task[] {
        let results = Array.from(this.tasks.values());

        if (criteria.status) {
            const statuses = Array.isArray(criteria.status)
                ? criteria.status
                : [criteria.status];
            results = results.filter(t => statuses.includes(t.status));
        }

        if (criteria.priority) {
            const priorities = Array.isArray(criteria.priority)
                ? criteria.priority
                : [criteria.priority];
            results = results.filter(t => priorities.includes(t.priority));
        }

        if (criteria.assignee) {
            results = results.filter(t => t.assignee === criteria.assignee);
        }

        if (criteria.search) {
            const q = criteria.search.toLowerCase();
            results = results.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q)
            );
        }

        return results;
    }

    sort(tasks: Task[], config: SortConfig): Task[] {
        const priorityOrder: Record<Priority, number> = {
            critical: 0, high: 1, medium: 2, low: 3,
        };

        return [...tasks].sort((a, b) => {
            let cmp: number;
            switch (config.field) {
                case "createdAt":
                    cmp = a.createdAt.getTime() - b.createdAt.getTime();
                    break;
                case "priority":
                    cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
                    break;
                case "title":
                    cmp = a.title.localeCompare(b.title);
                    break;
            }
            return config.order === "asc" ? cmp : -cmp;
        });
    }

    batch(operation: BatchOperation): BatchResult {
        const result: BatchResult = { succeeded: [], failed: [] };

        switch (operation.action) {
            case "update_status":
                for (const id of operation.ids) {
                    const r = this.update(id, { status: operation.status });
                    if (r.ok) result.succeeded.push(id);
                    else result.failed.push({ id, reason: r.error });
                }
                break;

            case "assign":
                for (const id of operation.ids) {
                    const r = this.update(id, { assignee: operation.assignee });
                    if (r.ok) result.succeeded.push(id);
                    else result.failed.push({ id, reason: r.error });
                }
                break;

            case "delete":
                for (const id of operation.ids) {
                    if (this.delete(id)) result.succeeded.push(id);
                    else result.failed.push({ id, reason: "Not found" });
                }
                break;
        }

        return result;
    }

    subscribe(listener: Listener<TaskEvent>): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    getStats(): Record<TaskStatus, number> {
        const stats: Record<TaskStatus, number> = {
            todo: 0, in_progress: 0, done: 0, archived: 0,
        };
        for (const task of this.tasks.values()) {
            stats[task.status]++;
        }
        return stats;
    }

    get size(): number {
        return this.tasks.size;
    }
}

// ——— 运行演示 ———

const store = new TaskStore();

// 订阅事件
const unsubscribe = store.subscribe((event) => {
    switch (event.kind) {
        case "created":
            console.log(`  [Event] Created: "${event.task.title}"`);
            break;
        case "updated":
            console.log(`  [Event] Updated: "${event.task.title}"`);
            break;
        case "deleted":
            console.log(`  [Event] Deleted: ${event.taskId}`);
            break;
    }
});

// 创建任务
console.log("--- 创建任务 ---");
const tasks = [
    { title: "设计 API 接口", description: "RESTful API 设计", status: "todo" as TaskStatus, priority: "high" as Priority, assignee: "Alice", tags: ["backend"], dueDate: null },
    { title: "实现用户认证", description: "JWT 认证流程", status: "in_progress" as TaskStatus, priority: "critical" as Priority, assignee: "Bob", tags: ["backend", "security"], dueDate: null },
    { title: "编写单元测试", description: "覆盖核心模块", status: "todo" as TaskStatus, priority: "medium" as Priority, assignee: "Alice", tags: ["testing"], dueDate: null },
    { title: "优化首页性能", description: "Lighthouse 评分优化", status: "done" as TaskStatus, priority: "low" as Priority, assignee: null, tags: ["frontend", "performance"], dueDate: null },
];

const createdIds: string[] = [];
for (const t of tasks) {
    const result = store.create(t);
    if (result.ok) createdIds.push(result.value.id);
}

// 统计
console.log("\n--- 统计 ---");
console.log(store.getStats());

// 筛选
console.log("\n--- 筛选: Alice 的任务 ---");
const aliceTasks = store.filter({ assignee: "Alice" });
aliceTasks.forEach(t => console.log(`  [${t.status}] ${t.title}`));

console.log("\n--- 筛选: 高优先级 ---");
const urgent = store.filter({ priority: ["high", "critical"] });
urgent.forEach(t => console.log(`  [${t.priority}] ${t.title}`));

// 排序
console.log("\n--- 按优先级排序（从高到低）---");
const sorted = store.sort(Array.from(store.filter({})), { field: "priority", order: "asc" });
sorted.forEach(t => console.log(`  [${t.priority}] ${t.title}`));

// 批量操作
console.log("\n--- 批量操作: 将 Alice 的任务标为进行中 ---");
const aliceIds = aliceTasks.map(t => t.id);
const batchResult = store.batch({
    action: "update_status",
    ids: aliceIds,
    status: "in_progress",
});
console.log(`  succeeded: ${batchResult.succeeded.length}, failed: ${batchResult.failed.length}`);

// 更新后统计
console.log("\n--- 更新后统计 ---");
console.log(store.getStats());

// 验证类型守卫
console.log("\n--- 类型守卫验证 ---");
function isTask(value: unknown): value is Task {
    return (
        typeof value === "object" &&
        value !== null &&
        "id" in value &&
        "title" in value &&
        "status" in value
    );
}

const maybeTask: unknown = store.getById(createdIds[0]);
if (isTask(maybeTask)) {
    console.log(`  类型守卫确认: "${maybeTask.title}"`);
}

// 清理
unsubscribe();

console.log(`\n总任务数: ${store.size}`);
console.log("\n=== Chapter 8 完成 ===");

export {};
