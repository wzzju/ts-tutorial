// =====================================================
// Chapter 1 示例：Hello TypeScript
// 运行方式：
//   npx tsx hello.ts                          (tsx)
//   bun hello.ts                              (Bun)
//   node --experimental-strip-types hello.ts   (Node v22.18+)
//   node hello.ts                             (Node v24+)
//   npx tsc --noEmit hello.ts                 (仅类型检查，不生成文件)
// =====================================================

// const = 不可重绑定（类似 Rust 的默认不可变绑定）
// let = 可重绑定（类似 Rust 的 let mut）
const greeting: string = "Hello, TypeScript!";
let count: number = 42;
let active: boolean = true;

// 函数：参数和返回值都有类型注解
function add(a: number, b: number): number {
    return a + b;
}

console.log(greeting);
console.log(`add(${count}, 8) = ${add(count, 8)}`);
console.log(`active = ${active}`);

// ——— JS 运行时的"怪异行为" ———

// 1. 没有整数类型——所有数字都是 IEEE 754 双精度浮点
let x: number = 1;
let y: number = 1.5;
console.log(`\n--- 数值类型 ---`);
console.log(`typeof 1 = ${typeof x}, typeof 1.5 = ${typeof y}`);

// 2. 字符串：单引号、双引号、反引号（模板字符串）
let s1: string = 'hello';
let s2: string = "hello";
let s3: string = `value is ${x}`;  // 类似 Python f-string / Rust format!()
console.log(`\n--- 字符串 ---`);
console.log(`s3 = "${s3}"`);

// 3. null 和 undefined 是两个不同的"空值"
let a: null = null;
let b: undefined = undefined;
console.log(`\n--- 空值 ---`);
console.log(`null === undefined: ${a === b}`);   // false
console.log(`null == undefined: ${a == b}`);     // true（宽松相等）

// 4. 相等比较：永远用 === 而不是 ==
console.log(`\n--- 相等比较 ---`);
console.log(`1 === 1: ${1 === 1}`);
console.log(`1 === "1": ${(1 as unknown) === "1"}`);  // false

// ——— 练习示例 ———
function greet(name: string): string {
    return `Hello, ${name}!`;
}

console.log(`\n--- 练习 ---`);
console.log(greet("World"));
// greet(42);  // 取消注释 → TS 编译错误（但 bun/tsx 运行时不报错，因为它们不做类型检查）

// export {} 使文件成为 ES 模块，避免顶层变量泄漏到全局作用域
// 详见 Chapter 7
export {};
