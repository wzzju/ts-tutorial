// =====================================================
// Chapter 2 示例：类型系统基础
// 运行方式：
//   Node.js (v22.18+): node --experimental-strip-types types.ts
//   Node.js (v24+):    node types.ts
//   Node.js (tsx):     npx tsx types.ts
//   Bun:               bun types.ts
// =====================================================

console.log("=== Chapter 2: 类型系统基础 ===\n");

// ——— 2.1 变量声明与类型推断 ———
console.log("--- 变量声明 ---");
const PI: number = 3.14159;
let counter: number = 0;
counter = 1;

const name1 = "Alice";    // 推断为 string
let age = 30;             // 推断为 number
console.log(`PI = ${PI}, counter = ${counter}`);
console.log(`name1: ${typeof name1} = "${name1}", age: ${typeof age} = ${age}`);

// ——— 2.2 数组与元组 ———
console.log("\n--- 数组与元组 ---");
let nums: number[] = [1, 2, 3];
let strs: Array<string> = ["a", "b"];
nums.push(4);
console.log(`nums = [${nums}], length = ${nums.length}`);

let point: [number, number] = [10, 20];
let entry: [string, number] = ["age", 25];
let [key, value] = entry;
console.log(`point = [${point}], entry解构: key="${key}", value=${value}`);

// ——— 2.3 对象类型与接口 ———
console.log("\n--- 对象类型与接口 ---");

interface User {
    name: string;
    age: number;
    email?: string;        // 可选字段
    readonly id: number;   // 只读
}

let alice: User = { name: "Alice", age: 30, id: 1 };
console.log(`user = ${JSON.stringify(alice)}`);
console.log(`email = ${alice.email}`); // undefined（可选字段）

// 类型别名
type Point2D = { x: number; y: number };
type ID = string | number;

// ——— 2.4 结构化类型 ———
console.log("\n--- 结构化类型（Structural Typing）---");

interface Cat {
    name: string;
    speak(): string;
}

interface Dog {
    name: string;
    speak(): string;
}

let cat: Cat = { name: "Kitty", speak() { return "Meow"; } };
let dog: Dog = cat;  // OK！结构一致就兼容
console.log(`dog.speak() = "${dog.speak()}"`);

function greetAnimal(c: Cat) { return c.speak(); }
console.log(`greetAnimal(dog) = "${greetAnimal(dog)}"`);

// ——— 2.5 枚举 ———
console.log("\n--- 枚举 ---");

enum Direction {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
}

enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
}

console.log(`Direction.Up = ${Direction.Up}`);
console.log(`HttpMethod.POST = "${HttpMethod.POST}"`);

// 联合类型代替枚举（推荐）
type Dir = "up" | "down" | "left" | "right";
let d: Dir = "up";
console.log(`Dir = "${d}"`);

// ——— 2.6 特殊类型 ———
console.log("\n--- 特殊类型 ---");

// unknown：安全的 any
let val: unknown = "hello";
if (typeof val === "string") {
    console.log(`unknown缩窄后: "${val.toUpperCase()}"`);
}

// never：穷尽检查
type Shape = "circle" | "square";

function area(shape: Shape): number {
    switch (shape) {
        case "circle": return Math.PI * 10 * 10;
        case "square": return 10 * 10;
        default:
            const _exhaustive: never = shape;
            return _exhaustive;
    }
}

console.log(`circle area = ${area("circle").toFixed(2)}`);
console.log(`square area = ${area("square")}`);

// ——— 2.7 类型断言 ———
console.log("\n--- 类型断言 ---");
let input: unknown = "hello";
let len = (input as string).length;
console.log(`"hello" as string → length = ${len}`);

// ——— 2.8 satisfies 操作符（TS 4.9+）———
console.log("\n--- satisfies 操作符 ---");

type Color = "red" | "green" | "blue";
type RGB = [number, number, number];

// satisfies 验证类型但保留精确推断
const palette = {
    red: [255, 0, 0],
    green: "#00ff00",
    blue: [0, 0, 255],
} satisfies Record<Color, string | RGB>;

// palette.red 的类型是 number[]（精确），不是 string | RGB（宽泛）
console.log(`palette.red = [${palette.red}]`);
console.log(`palette.green = "${palette.green.toUpperCase()}"`);

// satisfies + as const 组合
interface AppConfig {
    apiUrl: string;
    timeout: number;
    debug: boolean;
}

const appConfig = {
    apiUrl: "https://api.example.com",
    timeout: 3000,
    debug: false,
} satisfies AppConfig;
// appConfig.apiUrl 的类型是 "https://api.example.com"（字面量）
console.log(`config.apiUrl = "${appConfig.apiUrl}"`);

console.log("\n=== Chapter 2 完成 ===");

export {};
