# Chapter 10: 常见错误与速查表

> 目标：能够独立理解和解决 TS 编译器报错，并提供日常开发速查表。
> 示例代码：[examples/ch10/error-patterns.ts](./examples/ch10/error-patterns.ts) — 运行：`npx tsx examples/ch10/error-patterns.ts` | `bun examples/ch10/error-patterns.ts` | `node examples/ch10/error-patterns.ts`(v24+)

## 10.1 最常见错误信息解读

### 错误 1：类型不匹配

```typescript
// TS2322: Type 'string' is not assignable to type 'number'.
let x: number = "hello";
// 修复：确保类型一致

// TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
function add(a: number, b: number) { return a + b; }
add("1", 2);
// 修复：传入正确类型 add(1, 2) 或转换 add(Number("1"), 2)
```

### 错误 2：属性不存在

```typescript
// TS2339: Property 'foo' does not exist on type 'Bar'.
interface Bar { name: string; }
const b: Bar = { name: "test" };
b.foo;   // 错误
// 修复：检查拼写，或扩展接口

// 常见场景：对象可能是 null
// TS2531: Object is possibly 'null'.
function getUser(): { name: string } | null { return null; }
const user = getUser();
user.name;  // 错误
// 修复方案：
user?.name;              // 可选链（返回 undefined 如果 user 是 null）
user!.name;              // 非空断言（你确定不是 null 时）
if (user) user.name;     // 类型守卫（最安全）
```

### 错误 3：泛型约束

```typescript
// TS2344: Type 'string' does not satisfy the constraint 'number'.
type OnlyNumber<T extends number> = T;
type Bad = OnlyNumber<string>;
// 修复：传入满足约束的类型

// TS2536: Type 'string' cannot be used to index type 'T'.
function getValue<T>(obj: T, key: string) {
    return obj[key];  // 错误：key 没有约束为 T 的键
}
// 修复：
function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];  // OK
}
```

### 错误 4：缺少属性

```typescript
// TS2741: Property 'age' is missing in type '{ name: string; }'
// but required in type 'User'.
interface User { name: string; age: number; }
const u: User = { name: "Alice" };
// 修复：添加缺少的属性，或将属性标为可选 age?: number
```

### 错误 5：隐式 any

```typescript
// TS7006: Parameter 'x' implicitly has an 'any' type.
// （在 strict 模式下）
function process(x) { }     // x 没有类型注解
// 修复：添加类型注解
function process(x: unknown) { }

// TS7053: Element implicitly has an 'any' type because expression
// of type 'string' can't be used to index type '{}'.
const obj = { a: 1, b: 2 };
const key = "a";
obj[key];   // 错误：string 不能索引 obj
// 修复：
obj[key as keyof typeof obj];
// 或声明 key 的类型
const key: keyof typeof obj = "a";
```

### 错误 6：Promise 相关

```typescript
// TS2801: This condition will always return true since this
// 'Promise<boolean>' is always defined.
async function check(): Promise<boolean> { return true; }
if (check()) { }  // 错误！忘记 await
// 修复：
if (await check()) { }

// 类型 'Promise<string>' 不能赋给 'string'
const result: string = fetchData();  // 忘记 await
// 修复：
const result: string = await fetchData();
```

## 10.2 语法速查表

### 变量与类型

```typescript
// 声明
const x: number = 42;        // 不可重绑定
let y: string = "hello";     // 可重绑定

// 基础类型
let n: number;                // 数字（含浮点）
let s: string;                // 字符串
let b: boolean;               // 布尔
let a: any;                   // 任意（避免使用）
let u: unknown;               // 安全的任意
let v: void;                  // 无返回值
let nv: never;                // 永不返回

// 数组与元组
let arr: number[] = [1, 2, 3];
let arr2: Array<string> = ["a"];
let tuple: [string, number] = ["age", 25];

// 对象
let obj: { name: string; age?: number } = { name: "Alice" };

// 类型别名 & 接口
type ID = string | number;
interface User { name: string; age: number; }
```

### 函数

```typescript
// 声明
function add(a: number, b: number): number { return a + b; }

// 箭头函数
const add = (a: number, b: number): number => a + b;

// 可选参数 & 默认值
function greet(name: string, greeting?: string): string { ... }
function greet(name: string, greeting: string = "Hello"): string { ... }

// 剩余参数
function sum(...nums: number[]): number { ... }

// 函数类型
type Fn = (a: number, b: number) => number;

// 泛型函数
function identity<T>(value: T): T { return value; }
function getKey<T, K extends keyof T>(obj: T, key: K): T[K] { ... }
```

### 类

```typescript
class Animal {
    constructor(
        public name: string,         // 自动声明 + 赋值
        private _age: number,
        protected species: string,
        readonly id: number,
    ) {}

    get age(): number { return this._age; }
    set age(v: number) { this._age = v; }

    static create(name: string): Animal { ... }
}

class Dog extends Animal {
    constructor(name: string) { super(name, 0, "Dog", 0); }
}
```

### 类型操作

```typescript
// 联合 & 交叉
type A = string | number;        // A 或 B
type B = HasName & HasAge;       // A 且 B

// 字面量类型
type Dir = "up" | "down" | "left" | "right";

// keyof & typeof
type Keys = keyof User;          // "name" | "age"
const obj = { x: 1 };
type ObjType = typeof obj;       // { x: number }

// 索引访问
type NameType = User["name"];    // string

// 映射类型
type MyPartial<T> = { [K in keyof T]?: T[K] };

// 条件类型
type IsStr<T> = T extends string ? true : false;

// infer
type RetType<T> = T extends (...args: any[]) => infer R ? R : never;
```

### 工具类型

```typescript
Partial<T>          // 所有字段可选
Required<T>         // 所有字段必选
Readonly<T>         // 所有字段只读
Pick<T, K>          // 选取字段
Omit<T, K>          // 排除字段
Record<K, V>        // { [key in K]: V }
Extract<T, U>       // 从联合提取
Exclude<T, U>       // 从联合排除
NonNullable<T>      // 排除 null/undefined
ReturnType<T>       // 函数返回类型
Parameters<T>       // 函数参数元组
Awaited<T>          // 解包 Promise
```

### 异步

```typescript
// Promise
const p = new Promise<string>((resolve, reject) => { ... });
p.then(data => ...).catch(err => ...).finally(() => ...);

// async/await
async function load(): Promise<string> {
    try {
        const data = await fetchData();
        return data;
    } catch (err) {
        throw err;
    }
}

// 并发
await Promise.all([p1, p2, p3]);        // 全部成功
await Promise.allSettled([p1, p2]);      // 不论成败
await Promise.race([p1, p2]);           // 第一个完成
await Promise.any([p1, p2]);            // 第一个成功
```

### 模块

```typescript
// 导出
export function add() { ... }
export default class App { ... }
export type { User };

// 导入
import { add } from "./math";
import App from "./App";
import * as Utils from "./utils";
import type { User } from "./types";
```

## 10.3 跨语言概念速查

| 你想做的事 | C/C++ | Rust | Python | TypeScript |
|-----------|-------|------|--------|------------|
| 空值处理 | `if (ptr != NULL)` | `if let Some(v) = opt` | `if x is not None` | `if (x !== null)` 或 `x?.prop` |
| 类型转换 | `(int)x` / `static_cast` | `x as i32` / `From` | `int(x)` | `x as number`（编译期） |
| 字符串格式化 | `sprintf` / `fmt` | `format!("{}", x)` | `f"{x}"` | `` `${x}` `` |
| 错误处理 | 返回错误码 / 异常 | `Result<T,E>` + `?` | `try/except` | `try/catch` + `Promise` |
| 容器遍历 | `for(auto& x : vec)` | `for x in vec.iter()` | `for x in list` | `for (const x of arr)` |
| 哈希表 | `std::unordered_map` | `HashMap<K,V>` | `dict` | `Map<K,V>` 或 `Record<K,V>` |
| 接口/契约 | 纯虚类 | `trait` | `Protocol`(3.8+) | `interface` |
| 模式匹配 | `switch` | `match` | `match`(3.10+) | `switch` + 类型缩窄 |
| 包管理 | conan/vcpkg | cargo | pip | npm/yarn/pnpm |
| 构建系统 | cmake/make | cargo build | setuptools | tsc/vite/webpack |
| 代码检查 | clang-tidy | clippy | pylint/ruff | eslint |
| 格式化 | clang-format | rustfmt | black/ruff | prettier |

## 10.4 TypeScript 编译器错误码速查

| 错误码 | 含义 | 常见原因 |
|-------|------|---------|
| TS2304 | 找不到名称 | 未导入、拼写错误 |
| TS2322 | 类型不可赋值 | 类型不匹配 |
| TS2339 | 属性不存在 | 拼写错误、类型不对 |
| TS2345 | 参数类型不匹配 | 函数调用参数错误 |
| TS2531 | 对象可能为 null | 需要空值检查 |
| TS2532 | 对象可能为 undefined | 需要空值检查 |
| TS2536 | 不能用该类型索引 | 需要 keyof 约束 |
| TS2741 | 缺少必需属性 | 对象字面量缺少字段 |
| TS7006 | 隐式 any 类型 | 参数缺少类型注解 |
| TS7053 | 隐式 any 索引 | 动态键访问需要类型断言 |
| TS18046 | unknown 类型 | 使用前需要类型检查 |

## 10.5 常见模式 Cheat Sheet

```typescript
// ——— 空值安全 ———
obj?.prop                     // 可选链：obj 为 null 时返回 undefined
obj?.method()                 // 方法也可以
arr?.[0]                      // 索引也可以
value ?? "default"            // 空值合并：null/undefined 时取右值
value!                        // 非空断言（你确定不为 null）

// ——— 类型缩窄 ———
typeof x === "string"         // 基本类型检查
x instanceof MyClass          // 类实例检查
"prop" in obj                 // 属性存在检查
Array.isArray(x)              // 数组检查

// ——— 对象操作 ———
const copy = { ...obj };                  // 浅拷贝
const merged = { ...obj1, ...obj2 };      // 合并
const { a, b, ...rest } = obj;           // 解构 + 剩余
const { a: renamed } = obj;              // 解构 + 重命名

// ——— 数组操作 ———
const copy = [...arr];                    // 浅拷贝
const merged = [...arr1, ...arr2];        // 合并
const [first, ...rest] = arr;            // 解构 + 剩余
arr.map(x => x * 2)                      // 映射
arr.filter(x => x > 0)                   // 过滤
arr.reduce((acc, x) => acc + x, 0)       // 折叠
arr.find(x => x > 0)                     // 查找（T | undefined）
arr.some(x => x > 0)                     // 存在检查
arr.every(x => x > 0)                    // 全部检查
arr.flatMap(x => [x, x * 2])            // 映射 + 展平

// ——— 类型断言 ———
value as string                           // 断言为 string
value as unknown as Target               // 双重断言（最后手段）
<string>value                             // 尖括号语法（JSX 中不可用）
```

## 10.6 从其他语言迁移的心智模型

### 给 C/C++ 程序员

1. **没有手动内存管理**——GC 自动处理，不需要 `free`/`delete`
2. **没有指针算术**——数组越界不会段错误，而是返回 `undefined`
3. **没有头文件**——`import` 代替 `#include`
4. **没有编译链接分离**——一步编译
5. **对象是引用类型**——赋值是浅拷贝（引用），不是深拷贝

### 给 Rust 程序员

1. **没有所有权系统**——GC 回收，不需要考虑生命周期
2. **没有 `move` 语义**——对象赋值是引用共享
3. **类型在编译后完全擦除**——运行时没有类型信息
4. **`null` 不是编译期错误**——需要 `strictNullChecks` 开启检查
5. **结构化类型**——只看形状不看名字，不需要 `impl Trait for`

### 给 Python 程序员

1. **类型是强制的**——不像 type hints 只是提示
2. **花括号代替缩进**——缩进不影响语义
3. **分号可选**——但一行多语句时需要
4. **`===` 而非 `==`**——严格相等
5. **`const`/`let` 而非直接赋值**——必须声明

---

恭喜完成教程！你现在应该能够：
1. 阅读 TypeScript 类型定义（包括 .d.ts 文件）
2. 在现有项目中添加新功能
3. 理解和解决常见编译器错误

建议的后续学习路径：
- 官方 Handbook: https://www.typescriptlang.org/docs/handbook/
- Type Challenges: https://github.com/type-challenges/type-challenges
- 实际参与一个开源 TS 项目，从修复小 issue 开始
