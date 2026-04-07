// =====================================================
// Chapter 5 示例：高级类型系统
// 运行方式：
//   Node.js (v22.18+): node --experimental-strip-types advanced-types.ts
//   Node.js (v24+):    node advanced-types.ts
//   Node.js (tsx):     npx tsx advanced-types.ts
//   Bun:               bun advanced-types.ts
// =====================================================

console.log("=== Chapter 5: 高级类型系统 ===\n");

// ——— 5.1 联合类型 ———
console.log("--- 联合类型 ---");

type StringOrNumber = string | number;

function format(value: StringOrNumber): string {
    if (typeof value === "string") {
        return value.toUpperCase();
    }
    return value.toFixed(2);
}

console.log(`format("hello") = "${format("hello")}"`);
console.log(`format(3.14159) = "${format(3.14159)}"`);

// ——— 5.2 可辨识联合（Discriminated Unions）———
console.log("\n--- 可辨识联合（= Rust 的 tagged enum）---");

interface Circle {
    kind: "circle";
    radius: number;
}

interface Rect {
    kind: "rectangle";
    width: number;
    height: number;
}

interface Triangle {
    kind: "triangle";
    base: number;
    height: number;
}

type Shape = Circle | Rect | Triangle;

function area(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius ** 2;
        case "rectangle":
            return shape.width * shape.height;
        case "triangle":
            return 0.5 * shape.base * shape.height;
    }
}

const shapes: Shape[] = [
    { kind: "circle", radius: 5 },
    { kind: "rectangle", width: 4, height: 6 },
    { kind: "triangle", base: 3, height: 8 },
];

for (const s of shapes) {
    console.log(`  ${s.kind}: area = ${area(s).toFixed(2)}`);
}

// ——— 5.3 交叉类型 ———
console.log("\n--- 交叉类型 ---");

interface HasName { name: string; }
interface HasAge { age: number; }

type Person = HasName & HasAge;

const alice: Person = { name: "Alice", age: 30 };
console.log(`Person: ${JSON.stringify(alice)}`);

// WithId 工具类型
type WithId<T> = T & { id: number };
type UserWithId = WithId<{ name: string; email: string }>;

const userWithId: UserWithId = { id: 1, name: "Bob", email: "bob@example.com" };
console.log(`UserWithId: ${JSON.stringify(userWithId)}`);

// ——— 5.4 字面量类型与模板字面量类型 ———
console.log("\n--- 字面量类型 ---");

type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
const roll: DiceRoll = 3;
console.log(`dice roll = ${roll}`);

// 模板字面量类型
type EventName = "click" | "scroll" | "mousemove";
type Handler = `on${Capitalize<EventName>}`;
// Handler = "onClick" | "onScroll" | "onMousemove"

const handler: Handler = "onClick";
console.log(`handler = "${handler}"`);

// ——— 5.5 映射类型与工具类型 ———
console.log("\n--- 工具类型演示 ---");

interface User {
    id: number;
    name: string;
    email: string;
    age?: number;
}

// Pick
type UserPreview = Pick<User, "id" | "name">;
const preview: UserPreview = { id: 1, name: "Alice" };
console.log(`Pick<User, "id"|"name">: ${JSON.stringify(preview)}`);

// Omit
type UserWithoutAge = Omit<User, "age">;
const noAge: UserWithoutAge = { id: 1, name: "Alice", email: "a@b.com" };
console.log(`Omit<User, "age">: ${JSON.stringify(noAge)}`);

// Record
type StatusMap = Record<string, number>;
const codes: StatusMap = { ok: 200, notFound: 404, error: 500 };
console.log(`Record<string, number>: ${JSON.stringify(codes)}`);

// Partial
type PartialUser = Partial<User>;
const partial: PartialUser = { name: "Alice" };
console.log(`Partial<User>: ${JSON.stringify(partial)}`);

// ——— 5.6 条件类型与 infer ———
console.log("\n--- 条件类型 ---");

// 手动实现 ReturnType
type MyReturnType<T> = T extends (...args: unknown[]) => infer R ? R : never;

function getName(): string { return "Alice"; }
function getAge(): number { return 30; }

// 用 typeof 获取函数类型，再提取返回类型
type NameReturn = MyReturnType<typeof getName>;   // string
type AgeReturn = MyReturnType<typeof getAge>;     // number

// 运行时验证
console.log(`typeof getName() = "${typeof getName()}"`);
console.log(`typeof getAge() = "${typeof getAge()}"`);

// Unwrap Promise
type Unwrap<T> = T extends Promise<infer U> ? U : T;
// Unwrap<Promise<string>> = string
// Unwrap<number> = number

// ——— 5.7 DeepPartial 实战 ———
console.log("\n--- DeepPartial 实战 ---");

type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

interface Config {
    server: {
        host: string;
        port: number;
        ssl: {
            cert: string;
            key: string;
        };
    };
    debug: boolean;
}

const defaultConfig: Config = {
    server: { host: "localhost", port: 3000, ssl: { cert: "", key: "" } },
    debug: false,
};

function updateConfig(config: Config, update: DeepPartial<Config>): Config {
    // 简单的浅合并演示
    return {
        ...config,
        ...update,
        server: {
            ...config.server,
            ...(update.server ?? {}),
            ssl: {
                ...config.server.ssl,
                ...(update.server?.ssl ?? {}),
            },
        },
    };
}

const updated = updateConfig(defaultConfig, {
    server: { port: 8080 },
    debug: true,
});
console.log(`updated config: ${JSON.stringify(updated, null, 2)}`);

// ——— 5.7 satisfies 与类型操作的组合 ———
console.log("\n--- satisfies + as const 组合 ---");

interface RouteConfig {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    auth: boolean;
}

const apiRoutes = {
    getUsers: { path: "/users", method: "GET", auth: true },
    createUser: { path: "/users", method: "POST", auth: true },
    health: { path: "/health", method: "GET", auth: false },
} as const satisfies Record<string, RouteConfig>;

// 每个路由的 method 保留字面量类型（"GET"），不是宽泛的 string
type RouteNames = keyof typeof apiRoutes;
console.log(`Route names: ${(Object.keys(apiRoutes) as RouteNames[]).join(", ")}`);
console.log(`getUsers.method = "${apiRoutes.getUsers.method}"`);

// satisfies 验证事件处理器
type EventHandlerMap = Record<string, (...args: any[]) => void>;

const myHandlers = {
    onClick: (x: number, y: number) => console.log(`  click at ${x},${y}`),
    onKeydown: (key: string) => console.log(`  key: ${key}`),
} satisfies EventHandlerMap;

myHandlers.onClick(100, 200);
myHandlers.onKeydown("Enter");

// ——— 5.8 类型安全的事件系统 ———
console.log("\n--- 类型安全的事件系统 ---");

type EventMap = {
    click: { x: number; y: number };
    keydown: { key: string; code: number };
    resize: { width: number; height: number };
};

class TypedEmitter<Events extends Record<string, unknown>> {
    private handlers = new Map<string, Function[]>();

    on<K extends keyof Events & string>(
        event: K,
        handler: (payload: Events[K]) => void
    ): void {
        const list = this.handlers.get(event) ?? [];
        list.push(handler);
        this.handlers.set(event, list);
    }

    emit<K extends keyof Events & string>(
        event: K,
        payload: Events[K]
    ): void {
        const list = this.handlers.get(event) ?? [];
        for (const handler of list) {
            handler(payload);
        }
    }
}

const emitter = new TypedEmitter<EventMap>();
emitter.on("click", (payload) => {
    console.log(`  click at (${payload.x}, ${payload.y})`);
});
emitter.on("resize", (payload) => {
    console.log(`  resize to ${payload.width}x${payload.height}`);
});

emitter.emit("click", { x: 100, y: 200 });
emitter.emit("resize", { width: 1920, height: 1080 });

console.log("\n=== Chapter 5 完成 ===");

export {};
