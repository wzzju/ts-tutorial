# Chapter 8: 实战项目分析与代码修改

> 目标：学会阅读真实 TS 项目代码，定位功能入口，理解类型约束，修改现有逻辑。
> 示例代码：[examples/ch08/task-store.ts](./examples/ch08/task-store.ts) — 运行：`npx tsx examples/ch08/task-store.ts` | `bun examples/ch08/task-store.ts` | `node examples/ch08/task-store.ts`(v24+)

## 8.1 真实项目的典型结构

以一个中等规模的 Web 应用为例（使用 React + TypeScript）：

```
my-app/
├── src/
│   ├── api/                 # API 请求层
│   │   ├── client.ts        # HTTP 客户端封装
│   │   ├── endpoints.ts     # 各端点定义
│   │   └── types.ts         # API 请求/响应类型
│   ├── components/          # UI 组件
│   │   ├── Button/
│   │   │   ├── Button.tsx   # 组件实现
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts     # 重导出
│   │   └── ...
│   ├── hooks/               # 自定义 hooks（React 特有）
│   ├── store/               # 状态管理
│   │   ├── slices/          # 各功能模块的状态
│   │   └── index.ts
│   ├── types/               # 全局类型定义
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   ├── App.tsx              # 应用根组件
│   └── main.tsx             # 入口文件
├── public/                  # 静态资源
├── tsconfig.json
├── package.json
└── vite.config.ts           # 构建工具配置
```

## 8.2 完整示例项目：任务管理器

下面是一个完整的、可分析的 TypeScript 项目代码。我们将逐步解读。

### 类型定义层

```typescript
// ——— src/types/models.ts ———
// 领域模型类型定义

/** 任务优先级 */
export type Priority = "low" | "medium" | "high" | "critical";

/** 任务状态 */
export type TaskStatus = "todo" | "in_progress" | "done" | "archived";

/** 任务 */
export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    assignee: string | null;     // null 表示未分配
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    dueDate: Date | null;
}

/** 创建任务的参数（省略自动生成的字段） */
export type CreateTaskInput = Omit<Task, "id" | "createdAt" | "updatedAt">;
// Omit 从 Task 中排除指定字段
// 等价于：{ title: string; description: string; status: TaskStatus; ... }

/** 更新任务的参数（所有字段可选） */
export type UpdateTaskInput = Partial<Omit<Task, "id" | "createdAt">>;
// Partial 使所有字段可选
// 等价于：{ title?: string; description?: string; status?: TaskStatus; ... }

/** 任务筛选条件 */
export interface TaskFilter {
    status?: TaskStatus | TaskStatus[];
    priority?: Priority | Priority[];
    assignee?: string;
    search?: string;              // 搜索关键词
    dueBefore?: Date;
}
```

> **解读要点**：
> 1. `Omit<Task, "id" | "createdAt">` — 工具类型组合，从基础类型派生
> 2. `Partial<...>` — 让所有字段可选
> 3. `string | null` — 联合类型处理可空值
> 4. `TaskStatus | TaskStatus[]` — 支持单个值或数组

### 数据存储层

```typescript
// ——— src/store/task-store.ts ———
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilter } from "../types/models";

// 简单的事件系统类型
type Listener<T> = (data: T) => void;

export interface TaskEvent {
    type: "created" | "updated" | "deleted";
    task: Task;
}

export class TaskStore {
    private tasks: Map<string, Task> = new Map();
    private listeners: Set<Listener<TaskEvent>> = new Set();

    /** 生成唯一 ID */
    private generateId(): string {
        return crypto.randomUUID();  // 浏览器内置 API
    }

    /** 通知所有监听器 */
    private notify(event: TaskEvent): void {
        this.listeners.forEach(listener => listener(event));
    }

    /** 创建任务 */
    create(input: CreateTaskInput): Task {
        const now = new Date();
        const task: Task = {
            ...input,                     // 展开运算符：复制所有字段
            id: this.generateId(),
            createdAt: now,
            updatedAt: now,
        };
        this.tasks.set(task.id, task);
        this.notify({ type: "created", task });
        return task;
    }

    /** 更新任务 */
    update(id: string, input: UpdateTaskInput): Task {
        const existing = this.tasks.get(id);
        if (!existing) {
            throw new Error(`Task not found: ${id}`);
        }

        const updated: Task = {
            ...existing,                  // 保留原有字段
            ...input,                     // 用新字段覆盖
            updatedAt: new Date(),
        };
        this.tasks.set(id, updated);
        this.notify({ type: "updated", task: updated });
        return updated;
    }

    /** 删除任务 */
    delete(id: string): boolean {
        const task = this.tasks.get(id);
        if (!task) return false;

        this.tasks.delete(id);
        this.notify({ type: "deleted", task });
        return true;
    }

    /** 按 ID 获取 */
    getById(id: string): Task | undefined {
        return this.tasks.get(id);
    }

    /** 筛选任务 */
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

        if (criteria.dueBefore) {
            results = results.filter(t =>
                t.dueDate !== null && t.dueDate < criteria.dueBefore!
            );
            // 注意 ! 是非空断言：告诉 TS "我确定这不是 undefined"
        }

        return results;
    }

    /** 订阅事件 */
    subscribe(listener: Listener<TaskEvent>): () => void {
        this.listeners.add(listener);
        // 返回取消订阅函数（类似 Rust 的 RAII 返回 guard）
        return () => this.listeners.delete(listener);
    }

    /** 获取统计 */
    getStats(): Record<TaskStatus, number> {
        const stats: Record<TaskStatus, number> = {
            todo: 0,
            in_progress: 0,
            done: 0,
            archived: 0,
        };
        for (const task of this.tasks.values()) {
            stats[task.status]++;
        }
        return stats;
    }
}
```

> **关键语法解读**：
> - `...input`：展开运算符，类似 Python 的 `**kwargs`，Rust 的 `..other`
> - `Map<string, Task>`：泛型集合，类似 Rust 的 `HashMap<String, Task>`
> - `Set<Listener<TaskEvent>>`：泛型集合
> - `() => void` 返回值：函数返回一个清理函数（常见模式）
> - `criteria.dueBefore!`：非空断言，告诉编译器该值一定不是 null/undefined

### API 层

```typescript
// ——— src/api/client.ts ———

interface RequestConfig {
    method: "GET" | "POST" | "PUT" | "DELETE";
    headers?: Record<string, string>;
    body?: unknown;
    signal?: AbortSignal;         // 用于取消请求
}

interface ApiError {
    status: number;
    message: string;
    code: string;
}

// 泛型 API 响应包装
interface ApiResponse<T> {
    data: T;
    meta?: {
        total: number;
        page: number;
        pageSize: number;
    };
}

export class ApiClient {
    constructor(private baseUrl: string) {}

    // 泛型请求方法
    async request<T>(path: string, config: RequestConfig): Promise<T> {
        const url = `${this.baseUrl}${path}`;

        const response = await fetch(url, {
            method: config.method,
            headers: {
                "Content-Type": "application/json",
                ...config.headers,
            },
            body: config.body ? JSON.stringify(config.body) : undefined,
            signal: config.signal,
        });

        if (!response.ok) {
            const error: ApiError = await response.json();
            throw error;
        }

        return response.json() as Promise<T>;
        // as Promise<T>：类型断言，告诉 TS json() 返回的是 T
    }

    // 便捷方法
    get<T>(path: string, signal?: AbortSignal): Promise<T> {
        return this.request<T>(path, { method: "GET", signal });
    }

    post<T>(path: string, body: unknown): Promise<T> {
        return this.request<T>(path, { method: "POST", body });
    }

    put<T>(path: string, body: unknown): Promise<T> {
        return this.request<T>(path, { method: "PUT", body });
    }

    delete<T>(path: string): Promise<T> {
        return this.request<T>(path, { method: "DELETE" });
    }
}

// ——— src/api/endpoints.ts ———
import { ApiClient, ApiResponse } from "./client";
import { Task, CreateTaskInput, UpdateTaskInput } from "../types/models";

const api = new ApiClient("https://api.example.com");

export const taskApi = {
    list: () =>
        api.get<ApiResponse<Task[]>>("/tasks"),

    getById: (id: string) =>
        api.get<ApiResponse<Task>>(`/tasks/${id}`),

    create: (input: CreateTaskInput) =>
        api.post<ApiResponse<Task>>("/tasks", input),

    update: (id: string, input: UpdateTaskInput) =>
        api.put<ApiResponse<Task>>(`/tasks/${id}`, input),

    delete: (id: string) =>
        api.delete<{ success: boolean }>(`/tasks/${id}`),
};
```

## 8.3 如何定位功能入口

当你面对一个陌生的 TS 项目时，按以下顺序阅读：

### 步骤 1：看 package.json

```bash
# 找到入口文件和脚本
cat package.json | grep -E '"main"|"entry"|"scripts"'
```

```jsonc
{
    "main": "src/index.ts",         // 或 "src/main.tsx"
    "scripts": {
        "dev": "vite",              // 开发命令
        "build": "tsc && vite build"
    }
}
```

### 步骤 2：看 tsconfig.json

确认源码目录、编译选项、路径别名。

### 步骤 3：看 src/index.ts 或 src/main.ts

这是应用入口，通常初始化框架和路由。

### 步骤 4：用 IDE 功能导航

```
VS Code 快捷键（最重要的几个）：
- F12 / Cmd+Click      → 跳转到定义（Go to Definition）
- Shift+F12            → 查看所有引用（Find All References）
- Cmd+Shift+F          → 全局搜索
- Cmd+P                → 快速打开文件
- F2                   → 重命名符号（自动更新所有引用）
- Cmd+.                → 快速修复（Quick Fix）
- 悬停（Hover）         → 查看推断的类型
```

### 步骤 5：看 types/ 目录

类型定义是项目的"契约"，先理解数据结构再看逻辑。

## 8.4 实战：在现有项目中添加功能

### 场景：给 TaskStore 添加"批量操作"功能

```typescript
// 步骤1：先定义新的类型
// src/types/models.ts 中添加：

export type BatchOperation =
    | { action: "update_status"; ids: string[]; status: TaskStatus }
    | { action: "assign"; ids: string[]; assignee: string }
    | { action: "delete"; ids: string[] };
// 使用可辨识联合，让每种操作有明确的参数类型

export interface BatchResult {
    succeeded: string[];    // 成功的 ID
    failed: { id: string; reason: string }[];
}
```

```typescript
// 步骤2：在 TaskStore 中添加方法
// src/store/task-store.ts 中添加：

    /** 批量操作 */
    batch(operation: BatchOperation): BatchResult {
        const result: BatchResult = { succeeded: [], failed: [] };

        switch (operation.action) {
            case "update_status":
                for (const id of operation.ids) {
                    try {
                        this.update(id, { status: operation.status });
                        result.succeeded.push(id);
                    } catch (e) {
                        result.failed.push({
                            id,
                            reason: e instanceof Error ? e.message : "Unknown error"
                        });
                    }
                }
                break;

            case "assign":
                for (const id of operation.ids) {
                    try {
                        this.update(id, { assignee: operation.assignee });
                        result.succeeded.push(id);
                    } catch (e) {
                        result.failed.push({
                            id,
                            reason: e instanceof Error ? e.message : "Unknown error"
                        });
                    }
                }
                break;

            case "delete":
                for (const id of operation.ids) {
                    if (this.delete(id)) {
                        result.succeeded.push(id);
                    } else {
                        result.failed.push({ id, reason: "Not found" });
                    }
                }
                break;
        }

        return result;
    }
```

```typescript
// 步骤3：在 API 层添加对应端点
// src/api/endpoints.ts 中添加：

import { BatchOperation, BatchResult } from "../types/models";

// 在 taskApi 对象中添加：
export const taskApi = {
    // ... 原有方法 ...
    batch: (operation: BatchOperation) =>
        api.post<ApiResponse<BatchResult>>("/tasks/batch", operation),
};
```

### 场景：扩展现有接口

```typescript
// 需求：给 Task 添加子任务功能

// 步骤1：扩展类型
// 方式一：直接修改 Task 接口（如果你控制代码库）
interface Task {
    // ... 原有字段 ...
    subtasks: SubTask[];     // 新增
    parentId: string | null; // 新增
}

interface SubTask {
    id: string;
    title: string;
    completed: boolean;
}

// 方式二：不修改原类型，创建扩展类型（更安全）
interface TaskWithSubtasks extends Task {
    subtasks: SubTask[];
    parentId: string | null;
}

// 方式三：用交叉类型（适合临时组合）
type TaskWithMeta = Task & {
    subtasks: SubTask[];
    commentCount: number;
};
```

## 8.5 与现代前端框架结合

### React + TypeScript

React 是目前最流行的前端框架之一，与 TypeScript 结合使用非常普遍。

```typescript
// ——— React 组件的 TypeScript 类型化 ———

// 函数组件的 Props 类型定义
interface ButtonProps {
    label: string;
    variant?: "primary" | "secondary" | "danger";  // 可选，联合类型
    disabled?: boolean;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    children?: React.ReactNode;  // 子元素类型
}

// 函数组件（推荐写法）
function Button({ label, variant = "primary", disabled, onClick, children }: ButtonProps) {
    return (
        <button className={`btn btn-${variant}`} disabled={disabled} onClick={onClick}>
            {children ?? label}
        </button>
    );
}

// ——— 泛型组件 ———
// 类似 Rust 的泛型结构体
interface ListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
    return (
        <ul>
            {items.map((item, i) => (
                <li key={keyExtractor(item)}>{renderItem(item, i)}</li>
            ))}
        </ul>
    );
}

// 使用：TS 自动推断 T 为 User
<List
    items={users}
    renderItem={(user) => <span>{user.name}</span>}
    keyExtractor={(user) => user.id}
/>

// ——— Hooks 的类型化 ———
import { useState, useEffect, useRef, useCallback } from "react";

function useUserProfile(userId: string) {
    // useState 泛型
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);  // 自动推断为 boolean

    // useRef 泛型
    const abortRef = useRef<AbortController | null>(null);

    // useCallback 的参数类型自动推断
    const fetchUser = useCallback(async () => {
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setLoading(true);
        try {
            const response = await fetch(`/api/users/${userId}`, {
                signal: abortRef.current.signal,
            });
            const data: User = await response.json();
            setUser(data);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUser();
        return () => abortRef.current?.abort();
    }, [fetchUser]);

    return { user, loading } as const;
    // as const 让返回类型更精确
}
```

### Vue 3 + TypeScript

Vue 3 的 Composition API 与 TypeScript 配合也非常好。

```typescript
// ——— Vue 3 组件的 TypeScript 类型化 ———
<script setup lang="ts">
import { ref, computed, watch } from "vue";

// Props 类型定义
interface Props {
    title: string;
    count?: number;
    items: string[];
}

// defineProps 使用泛型
const props = withDefaults(defineProps<Props>(), {
    count: 0,
});

// Emits 类型定义
const emit = defineEmits<{
    (e: "update", value: number): void;
    (e: "delete", id: string): void;
}>();

// ref 自动推断类型
const searchQuery = ref("");           // Ref<string>
const selectedItem = ref<string | null>(null);  // Ref<string | null>

// computed 自动推断返回类型
const filteredItems = computed(() =>
    props.items.filter(item =>
        item.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
);

// watch 的类型安全
watch(() => props.count, (newVal, oldVal) => {
    // newVal 和 oldVal 自动推断为 number | undefined
    console.log(`count changed: ${oldVal} → ${newVal}`);
});
</script>
```

> **对 C++/Rust 程序员的提示**：
> - React/Vue 的组件就像带类型参数的函数——Props 是输入类型，渲染结果是输出
> - Hooks（React）/ Composables（Vue）类似 Rust 的 trait 方法——封装可复用的有状态逻辑
> - 你不需要精通框架才能阅读 TS 代码——理解类型系统就能读懂大部分框架代码

## 8.6 阅读第三方库类型的技巧

```typescript
// 示例：阅读 axios 的类型定义

// 在 VS Code 中，Cmd+Click 点击 import 的包名
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// 你会看到类似这样的 .d.ts：
export interface AxiosRequestConfig<D = any> {
    url?: string;
    method?: Method;
    baseURL?: string;
    headers?: RawAxiosRequestHeaders;
    params?: any;
    data?: D;
    timeout?: number;
    // ... 更多字段
}

export interface AxiosResponse<T = any, D = any> {
    data: T;               // 响应数据
    status: number;
    statusText: string;
    headers: RawAxiosResponseHeaders;
    config: AxiosRequestConfig<D>;
}

// 阅读要点：
// 1. <T = any> 是带默认值的泛型（不指定时为 any）
// 2. 关注你要用的字段，其余先跳过
// 3. 看 Method 等类型别名定义（通常在同文件或相邻文件）
// 4. 看 export 了哪些类型——这是库的公共 API
```

## 8.7 练习

```
练习1：在 TaskStore 中添加排序功能
  - 支持按 createdAt、priority、dueDate 排序
  - 支持升序/降序
  - 定义 SortConfig 类型：{ field: keyof Task; order: "asc" | "desc" }

练习2：为 TaskStore 添加持久化
  - 添加 save() 方法，序列化到 localStorage（浏览器）
  - 添加 static load() 方法，从 localStorage 恢复
  - 注意 Date 对象的序列化/反序列化

练习3：阅读一个真实 npm 包的类型
  - npm install zod（流行的类型验证库）
  - 在 node_modules/zod/lib/types.d.ts 中
  - 找到 ZodString 类型的定义
  - 理解 z.string().email().min(1) 的链式调用是如何类型化的
```

---
下一章：[Chapter 9 - 调试与工具链](./09-debugging-toolchain.md)
