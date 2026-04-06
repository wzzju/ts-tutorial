# Chapter 5: 高级类型系统

> 目标：掌握 TS 最强大的部分——高级类型操作，这是阅读复杂 TS 代码的关键。
> 示例代码：[examples/ch05/advanced-types.ts](./examples/ch05/advanced-types.ts) — 运行：`npx tsx examples/ch05/advanced-types.ts` | `bun examples/ch05/advanced-types.ts` | `node examples/ch05/advanced-types.ts`(v24+)

## 5.1 联合类型（Union Types）

```typescript
// 联合类型：值可以是多种类型之一
// 类似 Rust 的 enum（不带数据），C 的 union（但类型安全）

type StringOrNumber = string | number;

function format(value: StringOrNumber): string {
    // 使用前必须用类型守卫缩窄
    if (typeof value === "string") {
        return value.toUpperCase();
    }
    return value.toFixed(2);
}

// 常见用法：可空类型
type Nullable<T> = T | null;

function findUser(id: number): Nullable<{ name: string }> {
    if (id === 1) return { name: "Alice" };
    return null;
}
```

### 可辨识联合（Discriminated Unions）

这是 TS 中**最重要的模式之一**，等价于 Rust 的 `enum`（tagged union）。

```typescript
// Rust 写法:
// enum Shape {
//     Circle { radius: f64 },
//     Rectangle { width: f64, height: f64 },
//     Triangle { base: f64, height: f64 },
// }

// TS 写法：用共同的字面量字段（判别字段）区分
interface Circle {
    kind: "circle";       // 字面量类型，值只能是 "circle"
    radius: number;
}

interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}

interface Triangle {
    kind: "triangle";
    base: number;
    height: number;
}

type Shape = Circle | Rectangle | Triangle;

// 模式匹配（类似 Rust 的 match）
function area(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            // TS 在此分支中知道 shape 是 Circle
            return Math.PI * shape.radius ** 2;
        case "rectangle":
            return shape.width * shape.height;
        case "triangle":
            return 0.5 * shape.base * shape.height;
    }
}

// 穷尽检查：如果添加新的 Shape 变体但忘记处理，TS 会报错
// 方法：在 default 分支赋值给 never
function areaExhaustive(shape: Shape): number {
    switch (shape.kind) {
        case "circle":    return Math.PI * shape.radius ** 2;
        case "rectangle": return shape.width * shape.height;
        case "triangle":  return 0.5 * shape.base * shape.height;
        default:
            const _exhaustive: never = shape;
            return _exhaustive;
    }
}
```

> **Rust 对比表**：
> | Rust | TypeScript |
> |------|-----------|
> | `enum Shape { Circle { r: f64 } }` | `interface Circle { kind: "circle"; r: number }` |
> | `match shape { ... }` | `switch (shape.kind) { ... }` |
> | 编译器强制穷尽 | 需要 `never` 技巧或 `--noUncheckedIndexedAccess` |
> | `Option<T>` = `Some(T) \| None` | `T \| null` |
> | `Result<T,E>` = `Ok(T) \| Err(E)` | `{ ok: true; value: T } \| { ok: false; error: E }` |

## 5.2 交叉类型（Intersection Types）

```typescript
// 交叉类型：合并多个类型的所有字段
// 类似 C++ 的多重继承（但只合并数据，不合并行为）

interface HasName {
    name: string;
}

interface HasAge {
    age: number;
}

type Person = HasName & HasAge;
// Person = { name: string; age: number }

const alice: Person = { name: "Alice", age: 30 };

// 实际常用场景：给现有类型添加字段
type WithId<T> = T & { id: number };

type UserWithId = WithId<{ name: string; email: string }>;
// = { name: string; email: string; id: number }
```

> **联合 vs 交叉**：
> - `A | B`：值是 A **或** B（用时需缩窄）
> - `A & B`：值**同时**满足 A **和** B（合并所有字段）

## 5.3 字面量类型（Literal Types）

```typescript
// 字面量类型：值的类型就是值本身
let exact: "hello" = "hello";
// exact = "world";  // 错误：Type '"world"' is not assignable to type '"hello"'

// 数字字面量
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
let roll: DiceRoll = 3;
// roll = 7;  // 错误

// 布尔字面量
type True = true;

// const 声明自动推断为字面量类型
const x = "hello";   // 类型是 "hello"，不是 string
let y = "hello";     // 类型是 string（因为 let 可变）

// ——— 模板字面量类型 ———
// TS 4.1+ 的强大特性，类似宏生成类型
type EventName = "click" | "scroll" | "mousemove";
type Handler = `on${Capitalize<EventName>}`;
// Handler = "onClick" | "onScroll" | "onMousemove"

type HttpEndpoint = `/${"users" | "posts"}/${"list" | "detail"}`;
// HttpEndpoint = "/users/list" | "/users/detail" | "/posts/list" | "/posts/detail"
```

## 5.4 索引类型与映射类型

```typescript
// ——— keyof：获取对象所有键的联合类型 ———
interface User {
    name: string;
    age: number;
    email: string;
}

type UserKeys = keyof User;  // "name" | "age" | "email"

// ——— 索引访问类型：T[K] ———
type NameType = User["name"];      // string
type AgeOrEmail = User["age" | "email"];  // number | string

// ——— 映射类型（Mapped Types）———
// 基于现有类型生成新类型，类似 Rust 的 derive 宏

// 把所有字段变为可选
type Partial<T> = {
    [K in keyof T]?: T[K];
};

// 把所有字段变为只读
type Readonly<T> = {
    readonly [K in keyof T]: T[K];
};

// 把所有字段变为必选
type Required<T> = {
    [K in keyof T]-?: T[K];   // -? 移除可选标记
};

// 提取部分字段
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};

// 用法：
type UserPreview = Pick<User, "name" | "email">;
// = { name: string; email: string }

type PartialUser = Partial<User>;
// = { name?: string; age?: number; email?: string }
```

## 5.5 条件类型（Conditional Types）

类似 C++ 的 `std::conditional` 或 Rust 的 where 子句 + 关联类型。

```typescript
// 基本语法：T extends U ? X : Y
// 如果 T 可赋值给 U，则类型为 X，否则为 Y

type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;  // true
type B = IsString<42>;       // false

// ——— 实用条件类型 ———

// Extract：从联合类型中提取匹配的成员
type Extract<T, U> = T extends U ? T : never;

type Strings = Extract<string | number | boolean, string>;  // string

// Exclude：从联合类型中排除匹配的成员
type Exclude<T, U> = T extends U ? never : T;

type NonString = Exclude<string | number | boolean, string>;  // number | boolean

// NonNullable：排除 null 和 undefined
type NonNullable<T> = Exclude<T, null | undefined>;

type Safe = NonNullable<string | null | undefined>;  // string

// ——— infer 关键字：在条件类型中推断子类型 ———
// 类似模式匹配中的绑定变量

// 提取函数的返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type R1 = ReturnType<() => string>;           // string
type R2 = ReturnType<(x: number) => boolean>; // boolean

// 提取 Promise 内部类型
type Unwrap<T> = T extends Promise<infer U> ? U : T;

type V1 = Unwrap<Promise<string>>;  // string
type V2 = Unwrap<number>;           // number（不是 Promise，返回自身）

// 提取数组元素类型
type ElementOf<T> = T extends (infer E)[] ? E : never;

type E1 = ElementOf<string[]>;    // string
type E2 = ElementOf<number[]>;    // number
```

## 5.6 内置工具类型速查

这些都是 TS 预定义的，实际项目中非常常用：

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age?: number;
}

// Partial<T> - 所有字段可选
type A = Partial<User>;
// { id?: number; name?: string; email?: string; age?: number }

// Required<T> - 所有字段必选
type B = Required<User>;
// { id: number; name: string; email: string; age: number }

// Readonly<T> - 所有字段只读
type C = Readonly<User>;

// Pick<T, K> - 选择部分字段
type D = Pick<User, "id" | "name">;
// { id: number; name: string }

// Omit<T, K> - 排除部分字段
type E = Omit<User, "age">;
// { id: number; name: string; email: string }

// Record<K, V> - 构造键值对类型
type F = Record<string, number>;
// { [key: string]: number } — 类似 Python 的 Dict[str, int]

type G = Record<"a" | "b" | "c", boolean>;
// { a: boolean; b: boolean; c: boolean }

// ReturnType<T> - 函数返回值类型
type H = ReturnType<typeof JSON.parse>;  // any

// Parameters<T> - 函数参数类型（元组）
type I = Parameters<(a: string, b: number) => void>;
// [a: string, b: number]

// Awaited<T> - 解包 Promise
type J = Awaited<Promise<Promise<string>>>;  // string
```

## 5.7 类型体操实战：解读复杂类型

在真实项目中，你会遇到复杂的类型定义。以下是逐步解读的方法：

```typescript
// 真实项目中常见的复杂类型
type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// 解读步骤：
// 1. [K in keyof T]  → 遍历 T 的所有键
// 2. ?               → 每个字段变为可选
// 3. T[K] extends object ? ... : ...  → 条件判断
// 4. 如果字段值是 object → 递归应用 DeepPartial
// 5. 否则保持原类型

// 用法：
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

// 深度部分更新
function updateConfig(config: Config, update: DeepPartial<Config>) {
    // 可以只传部分嵌套字段
}

updateConfig(defaultConfig, {
    server: { port: 8080 },  // 只更新 port，不需要其他字段
});
```

```typescript
// 另一个真实例子：事件系统的类型定义
type EventMap = {
    click: { x: number; y: number };
    keydown: { key: string; code: number };
    resize: { width: number; height: number };
};

// 类型安全的事件发射器
type TypedEmitter<Events extends Record<string, any>> = {
    on<K extends keyof Events>(
        event: K,
        handler: (payload: Events[K]) => void
    ): void;
    emit<K extends keyof Events>(
        event: K,
        payload: Events[K]
    ): void;
};

// 用法：
declare const emitter: TypedEmitter<EventMap>;
emitter.on("click", (payload) => {
    // payload 自动推断为 { x: number; y: number }
    console.log(payload.x, payload.y);
});
// emitter.emit("click", { key: "a" });  // 错误！payload 不匹配
```

## 5.8 类型对比总表

| Rust 概念 | TypeScript 等价 | 示例 |
|-----------|----------------|------|
| `Option<T>` | `T \| null` 或 `T \| undefined` | `let x: string \| null = null;` |
| `Result<T, E>` | 可辨识联合 | `{ ok: true; value: T } \| { ok: false; error: E }` |
| `enum { A(T), B(U) }` | 可辨识联合 | `{ kind: "A"; data: T } \| { kind: "B"; data: U }` |
| `match` | `switch` + 类型缩窄 | `switch (x.kind) { case "A": ... }` |
| `impl Trait` | 结构化类型（隐式满足） | 不需要显式声明 |
| `where T: Bound` | `T extends Bound` | `function f<T extends HasLength>(x: T)` |
| `type Alias = ...` | `type Alias = ...` | 几乎相同 |
| `PhantomData<T>` | 无需（类型擦除） | — |

## 5.9 练习

```typescript
// 练习1：定义一个 DeepReadonly<T> 类型
// 使对象及其所有嵌套字段都变为 readonly

// 练习2：实现 Flatten<T> 类型
// Flatten<string[]> = string
// Flatten<number[][]> = number[]
// Flatten<string> = string（非数组直接返回）

// 练习3：给以下 API 响应类型添加完整的类型定义
// GET /users → User[]
// GET /users/:id → User
// POST /users → User
// DELETE /users/:id → { success: boolean }
// 使用 Record、映射类型或条件类型来构建类型安全的 API 客户端类型
```

---
下一章：[Chapter 6 - 异步编程](./06-async-programming.md)
