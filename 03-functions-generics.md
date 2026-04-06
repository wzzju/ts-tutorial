# Chapter 3: 函数、泛型与类型推断

> 目标：掌握 TS 函数的类型化方式、泛型系统，理解类型推断的工作机制。
> 示例代码：[examples/ch03/functions.ts](./examples/ch03/functions.ts) — 运行：`npx tsx examples/ch03/functions.ts` | `bun examples/ch03/functions.ts` | `node examples/ch03/functions.ts`(v24+)

## 3.1 函数类型

```typescript
// ——— 基本函数声明 ———
function add(a: number, b: number): number {
    return a + b;
}

// ——— 箭头函数（Arrow Function）———
// 这是 TS/JS 中最常见的函数写法，类似 Rust 的闭包、Python 的 lambda
const multiply = (a: number, b: number): number => {
    return a * b;
};

// 单行表达式可省略 {} 和 return
const double = (x: number): number => x * 2;

// ——— 函数类型注解 ———
// 可以把函数类型单独声明，类似 C 的函数指针类型
type MathFn = (a: number, b: number) => number;

const subtract: MathFn = (a, b) => a - b;  // 参数类型从 MathFn 推断

// 接口写法（等价）
interface MathFnAlt {
    (a: number, b: number): number;
}
```

> **与 C/Rust 对比**：
> - C 函数指针：`int (*fn)(int, int)` → TS：`(a: number, b: number) => number`
> - Rust 闭包：`|a: i32, b: i32| -> i32 { a + b }` → TS：`(a: number, b: number) => a + b`
> - TS 的箭头函数 `=>` 不是胖箭头运算符，而是定义函数的语法

## 3.2 参数的高级用法

```typescript
// ——— 可选参数（? 标记）———
function greet(name: string, greeting?: string): string {
    // greeting 的类型是 string | undefined
    return `${greeting ?? "Hello"}, ${name}!`;
    // ?? 是空值合并运算符：左侧为 null/undefined 时取右侧
    // 类似 Rust 的 .unwrap_or("Hello")
}

greet("Alice");           // "Hello, Alice!"
greet("Bob", "Hi");       // "Hi, Bob!"

// ——— 默认参数 ———
function createUser(name: string, role: string = "viewer"): object {
    return { name, role };
    // { name, role } 是简写，等价于 { name: name, role: role }
}

// ——— 剩余参数（Rest Parameters）———
// 类似 Python 的 *args
function sum(...nums: number[]): number {
    return nums.reduce((acc, n) => acc + n, 0);
}
sum(1, 2, 3, 4);  // 10

// ——— 解构参数 ———
// 类似 Python 接收 dict 参数，Rust 的结构体解构
interface Options {
    width: number;
    height: number;
    color?: string;
}

function createCanvas({ width, height, color = "white" }: Options) {
    console.log(`${width}x${height}, color: ${color}`);
}

createCanvas({ width: 800, height: 600 });
```

## 3.3 函数重载（Overloads）

TS 的函数重载与 C++ 不同——不能有多个实现，只有多个**签名声明**加一个**统一实现**。

```typescript
// 重载签名（Overload Signatures）
function parse(input: string): number;
function parse(input: number): string;

// 实现签名（Implementation Signature）——不对外暴露
function parse(input: string | number): string | number {
    if (typeof input === "string") {
        return parseInt(input, 10);
    } else {
        return input.toString();
    }
}

parse("42");   // 返回类型推断为 number（匹配第一个重载）
parse(42);     // 返回类型推断为 string（匹配第二个重载）
// parse(true);  // 错误：没有匹配的重载
```

> 实际上，很多场景下用**泛型**或**联合类型**比重载更简洁。

## 3.4 泛型（Generics）

TS 的泛型与 C++ 模板 / Rust 泛型概念一致：编写可复用的、类型安全的代码。

```typescript
// ——— 泛型函数 ———
// C++: template<typename T> T identity(T value) { return value; }
// Rust: fn identity<T>(value: T) -> T { value }
// TS:
function identity<T>(value: T): T {
    return value;
}

identity<string>("hello");  // 显式指定类型参数
identity(42);               // 类型推断为 identity<number>(42)

// ——— 多个类型参数 ———
function pair<A, B>(first: A, second: B): [A, B] {
    return [first, second];
}
const p = pair("age", 25);  // 推断为 [string, number]

// ——— 泛型约束（Constraints）———
// 类似 Rust 的 trait bound: fn print<T: Display>(value: T)
// 类似 C++ 的 concepts (C++20)

interface HasLength {
    length: number;
}

function printLength<T extends HasLength>(item: T): void {
    console.log(item.length);
}

printLength("hello");     // OK，string 有 .length
printLength([1, 2, 3]);   // OK，数组有 .length
// printLength(42);       // 错误：number 没有 .length

// ——— keyof 与泛型结合 ———
// 类型安全地访问对象属性
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const user = { name: "Alice", age: 30 };
getProperty(user, "name");   // 返回类型为 string
getProperty(user, "age");    // 返回类型为 number
// getProperty(user, "email"); // 错误："email" 不是 user 的键
```

> **Rust 对比**：
> - Rust: `fn get<T: Index<K>, K>(obj: &T, key: K)` 需要 trait bound
> - TS: `<T, K extends keyof T>` 用 `keyof` 运算符获取所有键的联合类型
> - TS 泛型在编译后**完全擦除**，不像 Rust 会单态化生成不同代码

## 3.5 泛型接口与类型别名

```typescript
// ——— 泛型接口 ———
// 类似 Rust: trait Container<T>
interface Container<T> {
    value: T;
    getValue(): T;
    setValue(newValue: T): void;
}

// ——— 泛型类型别名 ———
// 极其常见，模拟 Rust 的 Result/Option

// 类似 Rust 的 Result<T, E>
type Result<T, E = Error> = 
    | { ok: true; value: T }
    | { ok: false; error: E };

// 类似 Rust 的 Option<T>（TS 通常用 T | null 代替）
type Option<T> = T | null;

// 使用
function divide(a: number, b: number): Result<number> {
    if (b === 0) {
        return { ok: false, error: new Error("Division by zero") };
    }
    return { ok: true, value: a / b };
}

const result = divide(10, 3);
if (result.ok) {
    console.log(result.value);  // TS 知道这里 value 存在
} else {
    console.log(result.error);  // TS 知道这里 error 存在
}
```

## 3.6 类型推断详解

TS 编译器会尽可能推断类型，减少手动标注。

```typescript
// ——— 基本推断 ———
let x = 10;              // 推断为 number
const y = 10;            // 推断为字面量类型 10（不是 number！）
                         // 因为 const 永不改变
let arr = [1, 2, 3];     // 推断为 number[]
let mixed = [1, "two"];  // 推断为 (string | number)[]

// ——— 返回值推断 ———
// 函数返回值通常不需要手动标注
function add(a: number, b: number) {  // 返回值推断为 number
    return a + b;
}

// ——— 上下文推断 ———
// 当 TS 知道函数的类型签名时，参数类型自动推断
const numbers = [1, 2, 3, 4, 5];

// map 的回调参数 n 自动推断为 number
const doubled = numbers.map(n => n * 2);
// 不需要写 numbers.map((n: number) => n * 2)

// ——— as const：推断为最窄类型 ———
// 类似 Rust 的编译期常量
const config = {
    endpoint: "https://api.example.com",
    timeout: 3000,
} as const;
// config.endpoint 的类型是 "https://api.example.com"（字面量），不是 string
// config.timeout 的类型是 3000，不是 number
// config 所有属性变为 readonly

const directions = ["up", "down", "left", "right"] as const;
// 类型为 readonly ["up", "down", "left", "right"]
// 不是 string[]
type Direction = typeof directions[number];  // "up" | "down" | "left" | "right"
```

## 3.7 类型守卫（Type Guards）

类型守卫是运行时检查，告诉 TS 编译器在某个代码分支中变量的确切类型。类似 Rust 的 `match` + 模式匹配。

```typescript
// ——— typeof 守卫 ———
function process(value: string | number) {
    if (typeof value === "string") {
        // 这个分支中，TS 知道 value 是 string
        console.log(value.toUpperCase());
    } else {
        // 这个分支中，TS 知道 value 是 number
        console.log(value.toFixed(2));
    }
}

// ——— instanceof 守卫 ———
function handleError(err: Error | TypeError) {
    if (err instanceof TypeError) {
        console.log("Type error:", err.message);
    } else {
        console.log("General error:", err.message);
    }
}

// ——— 自定义类型守卫（Type Predicate）———
// 函数返回类型用 `paramName is Type` 标注
interface Fish { swim(): void; }
interface Bird { fly(): void; }

function isFish(animal: Fish | Bird): animal is Fish {
    return (animal as Fish).swim !== undefined;
}

function move(animal: Fish | Bird) {
    if (isFish(animal)) {
        animal.swim();   // TS 知道是 Fish
    } else {
        animal.fly();    // TS 知道是 Bird
    }
}

// ——— in 操作符守卫 ———
function move2(animal: Fish | Bird) {
    if ("swim" in animal) {
        animal.swim();  // 如果有 swim 属性，TS 推断为 Fish
    } else {
        animal.fly();
    }
}
```

## 3.8 常见模式：回调与高阶函数

JS/TS 中函数是一等公民，大量使用高阶函数（接收或返回函数的函数）。

```typescript
// ——— 数组的高阶函数方法 ———
// 类似 Rust 的迭代器方法 / Python 的列表推导

const numbers = [1, 2, 3, 4, 5];

// map: 映射每个元素（Rust: .iter().map() / Python: [f(x) for x in list]）
const squares = numbers.map(n => n * n);  // [1, 4, 9, 16, 25]

// filter: 过滤（Rust: .iter().filter() / Python: [x for x in list if cond]）
const evens = numbers.filter(n => n % 2 === 0);  // [2, 4]

// reduce: 折叠（Rust: .iter().fold() / Python: functools.reduce）
const total = numbers.reduce((acc, n) => acc + n, 0);  // 15

// find: 查找第一个匹配元素（Rust: .iter().find()）
const firstEven = numbers.find(n => n % 2 === 0);  // 2 (类型为 number | undefined)

// ——— 回调模式 ———
// 很多 API 接收回调函数
function fetchData(url: string, callback: (data: string) => void): void {
    // 异步操作，稍后调用 callback
    setTimeout(() => callback("response data"), 1000);
}

fetchData("/api", (data) => {
    console.log(data);  // data 的类型从回调签名推断
});
```

## 3.9 练习

```typescript
// 练习1：实现泛型函数 first<T>，返回数组的第一个元素
// 如果数组为空，返回 undefined
// 提示：返回类型为 T | undefined

// 练习2：实现泛型函数 groupBy<T>
// 参数：数组 T[]，分组函数 (item: T) => string
// 返回：Record<string, T[]>（一个以 string 为键、T[] 为值的对象）
// 类似 Python 的 itertools.groupby 或 Rust 的手动 HashMap 分组

// 练习3：实现一个 pipe 函数，接收两个函数 f: (a: A) => B 和 g: (b: B) => C
// 返回一个新函数 (a: A) => C
// 即函数组合：pipe(f, g)(x) === g(f(x))
```

---
下一章：[Chapter 4 - 面向对象：类、继承与装饰器](./04-oop-classes.md)
