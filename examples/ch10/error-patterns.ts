// =====================================================
// Chapter 10 示例：常见错误模式与修复
// 运行方式：
//   Node.js (v22.18+): node --experimental-strip-types error-patterns.ts
//   Node.js (v24+):    node error-patterns.ts
//   Node.js (tsx):     npx tsx error-patterns.ts
//   Bun:               bun error-patterns.ts
// =====================================================

console.log("=== Chapter 10: 常见错误模式与修复 ===\n");

// ——— 1. 空值安全 ———
console.log("--- 空值安全 ---");

function findUser(id: number): { name: string } | null {
    if (id === 1) return { name: "Alice" };
    return null;
}

const user = findUser(1);
// user.name;  // TS2531: Object is possibly 'null'

// 修复方案：
console.log(`可选链: ${user?.name}`);                    // "Alice"
console.log(`空值合并: ${findUser(999)?.name ?? "未知"}`);  // "未知"
if (user) console.log(`类型守卫: ${user.name}`);          // "Alice"

// ——— 2. 类型缩窄 ———
console.log("\n--- 类型缩窄 ---");

function processValue(value: string | number | boolean): string {
    // typeof 守卫
    if (typeof value === "string") {
        return `string: "${value.toUpperCase()}"`;
    }
    if (typeof value === "number") {
        return `number: ${value.toFixed(2)}`;
    }
    return `boolean: ${value}`;
}

console.log(processValue("hello"));
console.log(processValue(3.14));
console.log(processValue(true));

// instanceof 守卫
class ApiError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
    }
}

function handleError(err: Error): string {
    if (err instanceof ApiError) {
        return `API Error ${err.statusCode}: ${err.message}`;
    }
    return `General Error: ${err.message}`;
}

console.log(handleError(new ApiError(404, "Not Found")));
console.log(handleError(new Error("Something broke")));

// in 操作符守卫
interface Dog { bark(): string; }
interface Cat { meow(): string; }

function speak(animal: Dog | Cat): string {
    if ("bark" in animal) {
        return animal.bark();
    }
    return animal.meow();
}

console.log(speak({ bark: () => "Woof!" }));
console.log(speak({ meow: () => "Meow!" }));

// ——— 3. 安全的对象索引访问 ———
console.log("\n--- 安全的对象索引访问 ---");

const config = { host: "localhost", port: 3000 };

// 错误方式（TS7053）：
// const key: string = "host";
// config[key];  // 错误

// 修复：使用 keyof typeof
function getConfigValue(key: keyof typeof config): string | number {
    return config[key];
}

console.log(`config.host = "${getConfigValue("host")}"`);
console.log(`config.port = ${getConfigValue("port")}`);

// ——— 4. 展开运算符与对象操作 ———
console.log("\n--- 展开运算符 ---");

const defaults = { color: "red", size: 10, visible: true };
const overrides = { size: 20, visible: false };
const merged = { ...defaults, ...overrides };
console.log(`merged = ${JSON.stringify(merged)}`);

const { color, ...rest } = merged;
console.log(`解构: color="${color}", rest=${JSON.stringify(rest)}`);

// 数组展开
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];
console.log(`数组合并: [${combined}]`);

const [first, ...remaining] = combined;
console.log(`解构: first=${first}, rest=[${remaining}]`);

// ——— 5. 正确处理 Promise ———
console.log("\n--- Promise 正确处理 ---");

async function fetchData(): Promise<string> {
    return "data";
}

async function demoPromise() {
    // 常见错误：忘记 await
    // const data = fetchData();  // 类型是 Promise<string>，不是 string

    // 正确：
    const data = await fetchData();
    console.log(`await result: "${data}"`);

    // 条件检查必须 await
    async function check(): Promise<boolean> { return true; }
    if (await check()) {
        console.log("condition checked correctly");
    }
}

await demoPromise();

// ——— 6. 泛型约束 ———
console.log("\n--- 泛型约束 ---");

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const person = { name: "Alice", age: 30, email: "alice@example.com" };
console.log(`name = "${getProperty(person, "name")}"`);
console.log(`age = ${getProperty(person, "age")}`);
// getProperty(person, "phone");  // 错误：'"phone"' 不在 keyof

// ——— 7. 穷尽检查 ———
console.log("\n--- 穷尽检查 ---");

type Status = "active" | "inactive" | "pending";

function getStatusLabel(status: Status): string {
    switch (status) {
        case "active": return "活跃";
        case "inactive": return "未活跃";
        case "pending": return "待处理";
        default:
            // 如果新增 Status 成员但忘记处理，TS 会在这里报错
            const _exhaustive: never = status;
            return _exhaustive;
    }
}

console.log(`active → "${getStatusLabel("active")}"`);
console.log(`pending → "${getStatusLabel("pending")}"`);

// ——— 8. for...of vs for...in ———
console.log("\n--- for...of vs for...in ---");

const items = ["a", "b", "c"];

// for...of 遍历值（推荐用于数组）
const ofResults: string[] = [];
for (const item of items) {
    ofResults.push(item);
}
console.log(`for...of: [${ofResults}]`);

// for...in 遍历键/索引（用于对象）
const inResults: string[] = [];
for (const index in items) {
    inResults.push(`${index}:${items[index]}`);
}
console.log(`for...in: [${inResults}]`);

// 对象遍历
const obj = { a: 1, b: 2, c: 3 };
const entries: string[] = [];
for (const [key, val] of Object.entries(obj)) {
    entries.push(`${key}=${val}`);
}
console.log(`Object.entries: [${entries}]`);

console.log("\n=== Chapter 10 完成 ===");

export {};
