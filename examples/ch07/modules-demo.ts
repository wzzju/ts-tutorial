// =====================================================
// Chapter 7 示例：模块系统演示
// 本示例展示 import/export 用法，所有逻辑在单文件中模拟
// 运行方式：
//   Node.js (v22.18+): node --experimental-strip-types modules-demo.ts
//   Node.js (v24+):    node modules-demo.ts
//   Node.js (tsx):     npx tsx modules-demo.ts
//   Bun:               bun modules-demo.ts
// =====================================================

console.log("=== Chapter 7: 模块系统演示 ===\n");

// ——— 模拟模块导出/导入的概念 ———
// 在实际项目中，这些会分散在不同文件中
// 这里在单文件中演示语法和概念

// ——— 模拟 types.ts ———
interface Todo {
    id: string;
    title: string;
    completed: boolean;
    createdAt: Date;
}

type CreateTodoInput = Omit<Todo, "id" | "createdAt">;
type UpdateTodoInput = Partial<Omit<Todo, "id" | "createdAt">>;

// ——— 模拟 store.ts ———
class TodoStore {
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

// ——— 演示 tsconfig.json 关键配置 ———
console.log("--- tsconfig.json 关键配置说明 ---");
const tsconfigExample = {
    compilerOptions: {
        target: "ES2022",                     // 编译目标
        module: "ESNext",                      // 模块格式
        moduleResolution: "bundler",           // 模块解析策略
        strict: true,                          // 开启所有严格检查
        noUncheckedIndexedAccess: true,        // 索引访问返回 T | undefined
        esModuleInterop: true,                 // CommonJS 互操作
        declaration: true,                     // 生成 .d.ts
        sourceMap: true,                       // 生成 source map
        outDir: "./dist",
        rootDir: "./src",
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist"],
};
console.log(JSON.stringify(tsconfigExample, null, 2));

// ——— 演示 package.json 脚本 ———
console.log("\n--- package.json scripts 示例 ---");
const packageScripts = {
    dev: "tsx watch src/index.ts",
    "dev:node": "node --watch --experimental-strip-types src/index.ts",
    "dev:bun": "bun --watch src/index.ts",
    build: "tsc",
    start: "node dist/index.js",
    typecheck: "tsc --noEmit",
    test: "vitest",
};
console.log(JSON.stringify(packageScripts, null, 2));

// ——— 实际使用 TodoStore ———
console.log("\n--- TodoStore 使用演示 ---");

const store = new TodoStore();

const todo1 = store.create({ title: "Learn TypeScript", completed: false });
const todo2 = store.create({ title: "Build a project", completed: false });
const todo3 = store.create({ title: "Write tests", completed: true });

console.log("All todos:");
store.getAll().forEach(t => {
    console.log(`  [${t.completed ? "✓" : " "}] #${t.id}: ${t.title}`);
});

store.update(todo1.id, { completed: true });
console.log("\nAfter completing todo1:");
store.getAll().forEach(t => {
    console.log(`  [${t.completed ? "✓" : " "}] #${t.id}: ${t.title}`);
});

const incomplete = store.filter(t => !t.completed);
console.log(`\nIncomplete: ${incomplete.length} items`);

store.delete(todo3.id);
console.log(`After delete: ${store.getAll().length} items`);

// ——— .d.ts 声明文件概念 ———
console.log("\n--- .d.ts 声明文件概念 ---");
console.log(`
// 声明文件示例（为纯 JS 库提供类型）:
// legacy-lib.d.ts
declare module "legacy-lib" {
    export function parse(input: string): object;
    export function stringify(obj: object): string;
}

// 全局变量声明:
// declare const __VERSION__: string;
// declare const __DEBUG__: boolean;

// 扩展已有类型:
// declare global {
//     interface Window {
//         myApp: { version: string };
//     }
// }
`);

console.log("=== Chapter 7 完成 ===");

export {};
