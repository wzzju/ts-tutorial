# Chapter 2: 类型系统基础

> 目标：掌握 TS 基础类型体系，建立与 C/C++/Rust/Python 的心智映射。
> 示例代码：[examples/ch02/types.ts](./examples/ch02/types.ts) — 运行：`npx tsx examples/ch02/types.ts` | `bun examples/ch02/types.ts` | `node examples/ch02/types.ts`(v24+)

## 2.1 基本类型对照表

| TypeScript | C/C++ | Rust | Python | 说明 |
|-----------|-------|------|--------|------|
| `number` | `double` | `f64` | `float` | 唯一数值类型，IEEE 754 双精度 |
| `bigint` | — | — | `int` | 任意精度整数 `100n` |
| `string` | `std::string` | `String` | `str` | UTF-16 编码，不可变 |
| `boolean` | `bool` | `bool` | `bool` | `true` / `false` |
| `null` | `NULL`/`nullptr` | `None`(Option) | `None` | 显式空值 |
| `undefined` | — | — | — | 未初始化，JS 特有 |
| `void` | `void` | `()` | `None`(返回值) | 函数无返回值 |
| `never` | — | `!` (never type) | `NoReturn` | 函数永远不返回 |
| `any` | `void*` | — | 无类型提示 | 跳过类型检查（尽量避免） |
| `unknown` | — | — | — | 安全的 any，使用前必须检查 |
| `object` | — | — | `object` | 非原始类型的统称 |

## 2.2 变量声明

```typescript
// const：绑定不可变（类似 Rust 的 let）
const PI: number = 3.14159;
// PI = 3;  // 错误：不能重新赋值

// let：绑定可变（类似 Rust 的 let mut）
let counter: number = 0;
counter = 1;  // OK

// var：旧式声明，有作用域问题，永远不要用
// var old = "don't use this";

// 类型推断：TS 可以自动推断类型，不必每次都写
const name = "Alice";    // 推断为 string
let age = 30;            // 推断为 number
// age = "thirty";       // 错误：不能将 string 赋给 number
```

> **与 Rust 对比**：Rust 的 `let x = 5;` 默认不可变，`let mut x = 5;` 可变。
> TS 的 `const x = 5;` 不可变，`let x = 5;` 可变。方向一致，关键字不同。

## 2.3 数组与元组

```typescript
// ——— 数组（Array）———
// 类似 Rust 的 Vec<T>，Python 的 List[T]
let nums: number[] = [1, 2, 3];
let strs: Array<string> = ["a", "b"];  // 等价写法

// 数组是动态大小的（不像 C 的固定数组）
nums.push(4);         // [1, 2, 3, 4]
nums.length;          // 4

// ——— 元组（Tuple）———
// 固定长度、每个位置类型可不同（类似 Rust/Python 的元组）
let point: [number, number] = [10, 20];
let entry: [string, number] = ["age", 25];

// 解构赋值（类似 Rust 的模式匹配，Python 的解包）
let [key, value] = entry;  // key: string, value: number

// 注意：TS 元组在运行时就是普通数组，类型约束只在编译期
```

## 2.4 对象类型（Object Types）

这是 TS 与 C/C++/Rust 差异最大的地方。TS 使用**结构化类型系统**（Structural Typing），而非名义类型系统（Nominal Typing）。

```typescript
// ——— 对象字面量 ———
// 类似 Python 的 dict，但有固定的类型结构
let user: { name: string; age: number } = {
    name: "Alice",
    age: 30,
};

// ——— 接口（Interface）———
// 定义对象的"形状"，类似 Rust 的 trait（但不定义行为，只定义结构）
interface User {
    name: string;
    age: number;
    email?: string;    // ? 表示可选字段（类似 Rust 的 Option<String>）
    readonly id: number;  // readonly：类似 C++ 的 const 成员
}

let alice: User = { name: "Alice", age: 30, id: 1 };
// alice.id = 2;  // 错误：readonly

// ——— 类型别名（Type Alias）———
// 类似 Rust 的 type / C++ 的 using
type Point = { x: number; y: number };
type ID = string | number;  // 联合类型（第5章详述）

// ——— interface vs type ———
// 简单规则：对象结构用 interface，其余用 type
// interface 可以合并声明，type 不行（后面会讲）
```

### 结构化类型 vs 名义类型

```typescript
interface Cat {
    name: string;
    purr(): void;
}

interface Dog {
    name: string;
    purr(): void;  // 碰巧同结构
}

// 在 C++/Rust 中，Cat 和 Dog 是不同类型，即使结构相同
// 在 TS 中，只要结构匹配，就可以互相赋值！

let cat: Cat = { name: "Kitty", purr() { console.log("purr"); } };
let dog: Dog = cat;  // OK！结构一致就兼容

function greetCat(c: Cat) { c.purr(); }
greetCat(dog);  // OK！Dog 的结构满足 Cat 的要求
```

> **关键理解**：TS 的类型兼容性看**结构（shape）**，不看**名字**。
> 这意味着你不需要显式 `implements` 一个接口——只要结构匹配就行。
> 类似 Go 的接口隐式实现。

## 2.5 枚举（Enum）

```typescript
// ——— 数值枚举 ———
// 类似 C/C++ 的 enum
enum Direction {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
}
// 不指定值时自动从 0 递增
enum Color { Red, Green, Blue }  // Red=0, Green=1, Blue=2

let dir: Direction = Direction.Up;

// ——— 字符串枚举 ———
// 比数值枚举更安全，推荐使用
enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
}

// ——— const enum ———
// 编译后内联值，无运行时对象（类似 C++ 的 constexpr）
const enum StatusCode {
    OK = 200,
    NotFound = 404,
}
let code = StatusCode.OK;  // 编译后直接变成 let code = 200;

// ——— 更推荐：用联合类型代替枚举 ———
// 很多 TS 开发者偏好这种写法
type Dir = "up" | "down" | "left" | "right";
let d: Dir = "up";
// d = "diagonal";  // 错误：不在联合类型中
```

> **Rust 对比**：Rust 的 `enum` 是 tagged union（可以携带数据），TS 的 `enum` 更像 C 的枚举。
> Rust 的 tagged union 在 TS 中用**可辨识联合**（Discriminated Union）实现，详见第5章。

## 2.6 特殊类型深入

```typescript
// ——— any：逃生舱口 ———
// 跳过所有类型检查，类似 C 的 void*
let anything: any = 42;
anything = "now a string";  // OK
anything.nonExistentMethod();  // 编译通过！运行时崩溃
// 规则：除了迁移旧 JS 代码，不要用 any

// ——— unknown：安全的 any ———
// 可以接收任何值，但使用前必须做类型检查
let value: unknown = getUserInput();

// value.toUpperCase();  // 错误！unknown 不能直接用
if (typeof value === "string") {
    value.toUpperCase();  // OK，此处 TS 知道 value 是 string
}
// 类似 Rust：先 match 再使用

// ——— never：永远不会发生 ———
function throwError(msg: string): never {
    throw new Error(msg);  // 永不返回
}

function infiniteLoop(): never {
    while (true) {}
}

// never 最重要的用途：穷尽检查（类似 Rust match 的穷尽性）
type Shape = "circle" | "square";

function area(shape: Shape): number {
    switch (shape) {
        case "circle": return Math.PI * 10 * 10;
        case "square": return 10 * 10;
        default:
            // 如果 Shape 新增了成员但这里忘记处理，
            // TS 会在编译期报错，因为 exhaustiveCheck 的类型不是 never
            const exhaustiveCheck: never = shape;
            return exhaustiveCheck;
    }
}
```

## 2.7 satisfies 操作符（TS 4.9+）

`satisfies` 是 TypeScript 4.9 引入的重要操作符，解决了一个常见痛点：既要验证值符合某个类型，又不想丢失字面量类型的精确信息。

```typescript
// ——— 问题：类型注解会拓宽类型 ———
type Color = "red" | "green" | "blue";
type RGB = [number, number, number];

// 方式 1：类型注解 —— 丢失了字面量类型信息
const palette1: Record<Color, string | RGB> = {
    red: [255, 0, 0],
    green: "#00ff00",
    blue: [0, 0, 255],
};
palette1.red;    // 类型是 string | RGB，不知道具体是哪个
// palette1.red.map(...)  // 错误！因为可能是 string

// 方式 2：satisfies —— 既验证类型又保留精确信息
const palette2 = {
    red: [255, 0, 0],
    green: "#00ff00",
    blue: [0, 0, 255],
} satisfies Record<Color, string | RGB>;

palette2.red;    // 类型是 number[]（保留了实际类型）
palette2.green;  // 类型是 string
palette2.red.map(x => x / 255);  // OK！
palette2.green.toUpperCase();     // OK！

// ——— 常见用法：配置对象验证 ———
interface AppConfig {
    apiUrl: string;
    timeout: number;
    debug: boolean;
}

const config = {
    apiUrl: "https://api.example.com",
    timeout: 3000,
    debug: false,
} satisfies AppConfig;
// config.apiUrl 的类型是 "https://api.example.com"（字面量），不是 string
// 同时如果少写或拼错字段，编译器会报错
```

> **类比**：`satisfies` 类似 Rust 中的 trait bound 检查——确保值满足约束，但不改变其具体类型。
> 简单记忆：
> - `const x: T = ...` → 类型是 T（拓宽）
> - `const x = ... satisfies T` → 类型是实际值的类型（精确），但保证符合 T

## 2.8 类型断言（Type Assertion）

```typescript
// 类似 C++ 的 static_cast，告诉编译器"我比你更了解这个类型"
// 不做运行时转换，只是编译期的类型覆盖

let input: unknown = "hello";

// 写法一：as 语法（推荐）
let len1 = (input as string).length;

// 写法二：尖括号语法（在 JSX/TSX 中不可用）
let len2 = (<string>input).length;

// 双重断言（极少使用，类似 C 的 reinterpret_cast）
let x = (someValue as unknown as TargetType);

// 注意：断言不会做运行时检查！
// 如果断言错误，运行时会崩溃，就像 C++ 的错误 static_cast
```

## 2.9 概念对比总结

| 概念 | C/C++ | Rust | Python | TypeScript |
|------|-------|------|--------|------------|
| 不可变绑定 | `const int x = 5;` | `let x = 5;` | _(无)_ | `const x = 5;` |
| 可变绑定 | `int x = 5;` | `let mut x = 5;` | `x = 5` | `let x = 5;` |
| 可空类型 | 指针可为 NULL | `Option<T>` | 可为 None | `T \| null` |
| 空值 | `NULL`/`nullptr` | `None` | `None` | `null` / `undefined` |
| 类型转换 | `static_cast<T>` | `as T` / `From` | `int(x)` | `x as T`（编译期） |
| 类型检查 | 编译期(名义) | 编译期(名义) | 运行期(鸭子) | 编译期(结构化) |
| 类型擦除 | 不擦除 | 单态化 | 无类型信息 | **完全擦除** |

## 2.10 练习

```typescript
// 练习：定义以下类型并创建对应的变量

// 1. 定义一个 Config 接口，包含：
//    - host: string
//    - port: number
//    - debug: boolean（可选）
//    - tags: string[]（字符串数组）

// 2. 创建一个 Config 类型的变量并赋值

// 3. 尝试访问可选字段 debug，观察 TS 如何要求你处理 undefined

// 4. 创建一个函数 getPort(config: Config): number
//    如果 config.port > 65535，抛出错误
```

---
下一章：[Chapter 3 - 函数、泛型与类型推断](./03-functions-generics.md)
