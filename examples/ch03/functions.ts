// =====================================================
// Chapter 3 示例：函数、泛型与类型推断
// 运行方式：
//   Node.js (v22.18+): node --experimental-strip-types functions.ts
//   Node.js (v24+):    node functions.ts
//   Node.js (tsx):     npx tsx functions.ts
//   Bun:               bun functions.ts
// =====================================================

console.log("=== Chapter 3: 函数、泛型与类型推断 ===\n");

// ——— 3.1 函数类型 ———
console.log("--- 函数类型 ---");

function add(a: number, b: number): number {
    return a + b;
}

const multiply = (a: number, b: number): number => a * b;

type MathFn = (a: number, b: number) => number;
const subtract: MathFn = (a, b) => a - b;

console.log(`add(2, 3) = ${add(2, 3)}`);
console.log(`multiply(4, 5) = ${multiply(4, 5)}`);
console.log(`subtract(10, 3) = ${subtract(10, 3)}`);

// ——— 3.2 参数高级用法 ———
console.log("\n--- 参数高级用法 ---");

function greet(name: string, greeting?: string): string {
    return `${greeting ?? "Hello"}, ${name}!`;
}

function sum(...nums: number[]): number {
    return nums.reduce((acc, n) => acc + n, 0);
}

interface CanvasOptions {
    width: number;
    height: number;
    color?: string;
}

function createCanvas({ width, height, color = "white" }: CanvasOptions): string {
    return `${width}x${height}, color: ${color}`;
}

console.log(greet("Alice"));
console.log(greet("Bob", "Hi"));
console.log(`sum(1,2,3,4) = ${sum(1, 2, 3, 4)}`);
console.log(`canvas: ${createCanvas({ width: 800, height: 600 })}`);

// ——— 3.3 泛型 ———
console.log("\n--- 泛型 ---");

function identity<T>(value: T): T {
    return value;
}

function pair<A, B>(first: A, second: B): [A, B] {
    return [first, second];
}

console.log(`identity("hello") = "${identity("hello")}"`);
console.log(`identity(42) = ${identity(42)}`);
console.log(`pair("age", 25) = [${pair("age", 25)}]`);

// 泛型约束
interface HasLength {
    length: number;
}

function printLength<T extends HasLength>(item: T): number {
    console.log(`  length of "${item}" = ${item.length}`);
    return item.length;
}

printLength("hello");
printLength([1, 2, 3]);

// keyof 与泛型
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const user = { name: "Alice", age: 30 };
console.log(`getProperty(user, "name") = "${getProperty(user, "name")}"`);
console.log(`getProperty(user, "age") = ${getProperty(user, "age")}`);

// ——— 3.4 泛型类型别名 ———
console.log("\n--- 泛型类型别名（模拟 Rust Result） ---");

type Result<T, E = Error> =
    | { ok: true; value: T }
    | { ok: false; error: E };

function divide(a: number, b: number): Result<number, string> {
    if (b === 0) {
        return { ok: false, error: "Division by zero" };
    }
    return { ok: true, value: a / b };
}

const r1 = divide(10, 3);
if (r1.ok) {
    console.log(`10 / 3 = ${r1.value.toFixed(4)}`);
}

const r2 = divide(10, 0);
if (!r2.ok) {
    console.log(`10 / 0 → Error: ${r2.error}`);
}

// ——— 3.5 类型推断与 as const ———
console.log("\n--- 类型推断与 as const ---");

const config = {
    endpoint: "https://api.example.com",
    timeout: 3000,
} as const;

console.log(`config.endpoint 类型是字面量: "${config.endpoint}"`);

const directions = ["up", "down", "left", "right"] as const;
type Direction = typeof directions[number];
console.log(`directions = [${directions.join(", ")}]`);

// ——— 3.6 类型守卫 ———
console.log("\n--- 类型守卫 ---");

function process(value: string | number): string {
    if (typeof value === "string") {
        return `string: "${value.toUpperCase()}"`;
    } else {
        return `number: ${value.toFixed(2)}`;
    }
}

console.log(process("hello"));
console.log(process(3.14159));

// 自定义类型守卫
interface Fish { swim(): string; }
interface Bird { fly(): string; }

function isFish(animal: Fish | Bird): animal is Fish {
    return "swim" in animal;
}

const animals: (Fish | Bird)[] = [
    { swim() { return "swimming"; } },
    { fly() { return "flying"; } },
];

for (const animal of animals) {
    if (isFish(animal)) {
        console.log(`Fish: ${animal.swim()}`);
    } else {
        console.log(`Bird: ${animal.fly()}`);
    }
}

// ——— 3.7 高阶函数 ———
console.log("\n--- 高阶函数（数组方法） ---");

const numbers = [1, 2, 3, 4, 5];
const squares = numbers.map(n => n * n);
const evens = numbers.filter(n => n % 2 === 0);
const total = numbers.reduce((acc, n) => acc + n, 0);
const firstEven = numbers.find(n => n % 2 === 0);

console.log(`map(n²):    [${squares}]`);
console.log(`filter(偶): [${evens}]`);
console.log(`reduce(+):  ${total}`);
console.log(`find(偶):   ${firstEven}`);

// ——— 练习示例 ———
console.log("\n--- 练习: pipe 函数组合 ---");

function pipe<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C {
    return (a: A) => g(f(a));
}

const doubleIt = (x: number) => x * 2;
const toString = (x: number) => `Result: ${x}`;
const doubleAndFormat = pipe(doubleIt, toString);

console.log(doubleAndFormat(21));  // "Result: 42"

console.log("\n=== Chapter 3 完成 ===");

export {};
