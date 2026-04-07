# Chapter 4: 面向对象——类、继承与装饰器

> 目标：掌握 TS 的 OOP 特性，建立与 C++/Rust 的类比关系。
> 示例代码：[examples/ch04/classes.ts](./examples/ch04/classes.ts) — 运行：`npx tsx examples/ch04/classes.ts` | `bun examples/ch04/classes.ts`
> ⚠️ 本章含装饰器和参数属性，`node --experimental-strip-types` 不支持，请用 tsx 或 bun

## 4.1 类的基础

```typescript
// TS 的 class 与 C++ 类似，但语法更简洁

class Animal {
    // ——— 字段声明 ———
    // 必须在构造函数中初始化，或给默认值
    name: string;
    private _age: number;          // 私有字段（C++ 的 private:）
    protected species: string;     // 受保护字段（C++ 的 protected:）
    readonly id: number;           // 只读（C++ 的 const 成员）
    static count: number = 0;     // 静态字段（C++ 的 static 成员）

    // ——— 构造函数 ———
    constructor(name: string, age: number, species: string) {
        this.name = name;          // this 类似 C++ 的 this-> / Rust 的 self.
        this._age = age;
        this.species = species;
        this.id = ++Animal.count;
    }

    // ——— 方法 ———
    greet(): string {
        return `I'm ${this.name}, a ${this.species}`;
    }

    // ——— getter / setter ———
    // 类似 Python 的 @property，Rust 没有直接等价物
    get age(): number {
        return this._age;
    }

    set age(value: number) {
        if (value < 0) throw new Error("Age cannot be negative");
        this._age = value;
    }
}

const cat = new Animal("Kitty", 3, "Cat");
console.log(cat.greet());     // "I'm Kitty, a Cat"
console.log(cat.age);         // 3（调用 getter，看起来像属性访问）
cat.age = 4;                  // 调用 setter
// cat._age;                  // 错误：private 属性不可外部访问
```

### 参数属性简写

```typescript
// TS 特有的语法糖：在构造函数参数前加访问修饰符，自动声明+赋值
class Point {
    constructor(
        public x: number,    // 自动声明 public x 并赋值
        public y: number,
        private _label: string = "point"
    ) {
        // 不需要 this.x = x; 等赋值语句
    }
}
// 等价于在类中声明字段 + 在构造函数中逐一赋值
// C++ 没有等价语法；类似 Rust derive 宏生成代码
```

## 4.2 继承

```typescript
class Dog extends Animal {
    breed: string;

    constructor(name: string, age: number, breed: string) {
        super(name, age, "Dog");  // 调用父类构造函数（C++ 的初始化列表）
        this.breed = breed;
    }

    // 方法重写（Override）
    greet(): string {
        return `Woof! ${super.greet()}, breed: ${this.breed}`;
        // super.greet() 调用父类方法，类似 C++ 的 Base::method()
    }

    // 新增方法
    fetch(item: string): string {
        return `${this.name} fetches ${item}`;
    }
}

const dog = new Dog("Rex", 5, "Labrador");
console.log(dog.greet());    // "Woof! I'm Rex, a Dog, breed: Labrador"
console.log(dog.fetch("ball"));

// TS 是单继承（和 Java/Python 一样），不支持多继承（不像 C++）
// 用接口（interface）和混入（Mixin）模式代替多继承
```

## 4.3 抽象类

```typescript
// 类似 C++ 的纯虚函数类
abstract class Shape {
    abstract area(): number;       // 抽象方法，子类必须实现
    abstract perimeter(): number;

    // 普通方法可以有实现
    describe(): string {
        return `Area: ${this.area()}, Perimeter: ${this.perimeter()}`;
    }
}

class Circle extends Shape {
    constructor(public radius: number) {
        super();
    }

    area(): number {
        return Math.PI * this.radius ** 2;
    }

    perimeter(): number {
        return 2 * Math.PI * this.radius;
    }
}

// const s = new Shape();  // 错误：不能实例化抽象类
const c = new Circle(5);
console.log(c.describe());
```

> **Rust 对比**：Rust 没有抽象类，用 `trait` 实现类似功能。TS 的 `abstract class`
> 更像 C++ 的含纯虚函数的类——既定义接口，又可以提供默认实现。

## 4.4 接口与类的关系

```typescript
// 接口定义契约，类通过 implements 实现
// 类似 Rust 的 impl Trait for Struct / Java 的 implements

interface Serializable {
    serialize(): string;
    deserialize(data: string): void;
}

interface Printable {
    print(): void;
}

// 一个类可以实现多个接口（替代多继承）
class Document implements Serializable, Printable {
    constructor(public content: string) {}

    serialize(): string {
        return JSON.stringify({ content: this.content });
    }

    deserialize(data: string): void {
        this.content = JSON.parse(data).content;
    }

    print(): void {
        console.log(this.content);
    }
}

// 重要提醒：由于结构化类型，implements 不是必须的
// 即使不写 implements，只要结构匹配，就可以当接口用
class SimpleDoc {
    constructor(public content: string) {}
    serialize(): string { return this.content; }
    deserialize(data: string): void { this.content = data; }
    print(): void { console.log(this.content); }
}

// SimpleDoc 没有声明 implements Serializable，但可以当 Serializable 用
function save(item: Serializable) { /* ... */ }
save(new SimpleDoc("test"));  // OK！结构匹配
```

## 4.5 接口继承（Interface Extension）

```typescript
interface HasId {
    id: number;
}

interface HasTimestamp {
    createdAt: Date;
    updatedAt: Date;
}

// 接口可以继承多个接口（类似 C++ 多重继承但只继承"形状"）
interface Entity extends HasId, HasTimestamp {
    name: string;
}

// Entity 等价于：
// { id: number; createdAt: Date; updatedAt: Date; name: string }

// ——— 接口合并（Declaration Merging）———
// 同名接口会自动合并——这是 type 做不到的
interface Config {
    host: string;
}

interface Config {
    port: number;  // 自动合并到前面的 Config
}

// Config 现在是 { host: string; port: number }
// 这个特性主要用于扩展第三方库的类型定义
```

## 4.6 自动访问器关键字 accessor（TS 4.9+）

TypeScript 4.9 引入了 `accessor` 关键字，自动生成 getter/setter，简化响应式属性的定义。

```typescript
class ReactiveUser {
    // accessor 自动生成私有存储 + getter + setter
    accessor name: string;
    accessor age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
}

// 等价于手动写：
// class ReactiveUser {
//     #name: string;
//     get name() { return this.#name; }
//     set name(v: string) { this.#name = v; }
//     ...
// }

const user = new ReactiveUser("Alice", 30);
user.name = "Bob";  // 调用自动生成的 setter
console.log(user.name);  // 调用自动生成的 getter
```

> **实用场景**：`accessor` 主要用于装饰器生态（如 MobX、Lit 等框架），
> 装饰器可以拦截 accessor 的 get/set 来实现响应式数据、观察者模式等。

## 4.7 资源管理：using 声明（TS 5.2+）

TypeScript 5.2 引入了 `using` 关键字（TC39 Explicit Resource Management 提案），
类似 C++ 的 RAII、Rust 的 `Drop` trait、Python 的 `with` 语句。

```typescript
// ——— 定义可释放资源 ———
class FileHandle {
    constructor(public path: string) {
        console.log(`Opening ${path}`);
    }

    read(): string {
        return `content of ${this.path}`;
    }

    // Symbol.dispose 定义同步清理逻辑
    [Symbol.dispose](): void {
        console.log(`Closing ${this.path}`);
    }
}

// ——— 使用 using 自动释放资源 ———
function processFile() {
    using file = new FileHandle("/tmp/data.txt");
    const content = file.read();
    console.log(content);
    // 作用域结束时自动调用 file[Symbol.dispose]()
    // 类似 C++ 的析构函数、Rust 的 Drop
}

// ——— 异步版本：await using ———
class DatabaseConnection {
    constructor(public url: string) {
        console.log(`Connecting to ${url}`);
    }

    async query(sql: string): Promise<unknown[]> {
        return [{ id: 1 }];
    }

    // Symbol.asyncDispose 定义异步清理逻辑
    async [Symbol.asyncDispose](): Promise<void> {
        console.log(`Disconnecting from ${this.url}`);
    }
}

async function queryDatabase() {
    await using db = new DatabaseConnection("postgres://localhost");
    const results = await db.query("SELECT * FROM users");
    console.log(results);
    // 作用域结束时自动 await db[Symbol.asyncDispose]()
}
```

> **跨语言对比**：
> | 语言 | 资源管理机制 |
> |------|----------------|
> | C++ | RAII（析构函数） |
> | Rust | `Drop` trait（离开作用域时自动调用） |
> | Python | `with` 语句 + `__enter__`/`__exit__` |
> | C# | `using` 语句 + `IDisposable` |
> | TypeScript | `using` + `Symbol.dispose` / `await using` + `Symbol.asyncDispose` |
>
> **注意**：`using` 需要运行时支持 `Symbol.dispose`。
> 截至 2025 年，Node.js v22+ 和现代浏览器已支持，但旧环境可能需要 polyfill。

## 4.8 装饰器（Decorators）

TypeScript 5.0 起正式支持 **TC39 Stage 3 标准装饰器**，**不需要** `experimentalDecorators` 标志。
类似 Python 的 `@decorator`、Rust 的过程宏。

> **新旧装饰器区别**：
> - **旧版**（`experimentalDecorators: true`）：TS 1.5 引入，参数是 `(target, key, descriptor)`，Angular/NestJS 等框架仍在使用
> - **新版**（TS 5.0+ 默认）：TC39 标准，参数是 `(originalMethod, context)`，`context` 提供 `name`、`kind` 等元信息
> - 新项目推荐使用新版语法，旧项目按框架要求选择

```typescript
// ——— TC39 标准方法装饰器（TS 5.0+，无需配置）———
function log(
    originalMethod: Function,
    context: ClassMethodDecoratorContext
) {
    const methodName = String(context.name);
    function replacementMethod(this: unknown, ...args: unknown[]) {
        console.log(`Entering ${methodName}(${args.join(", ")})`);
        const result = (originalMethod as Function).call(this, ...args);
        console.log(`Exiting ${methodName}, returned: ${result}`);
        return result;
    }
    return replacementMethod;
}

class Calculator {
    @log
    add(a: number, b: number): number {
        return a + b;
    }
}

const calc = new Calculator();
calc.add(2, 3);
// 输出：
// Entering add(2, 3)
// Exiting add, returned: 5

// ——— 装饰器工厂（带参数的装饰器）———
function logWithPrefix(prefix: string) {
    return function (
        originalMethod: Function,
        context: ClassMethodDecoratorContext
    ) {
        const methodName = String(context.name);
        function replacementMethod(this: unknown, ...args: unknown[]) {
            console.log(`${prefix} Entering '${methodName}'`);
            const result = (originalMethod as Function).call(this, ...args);
            console.log(`${prefix} Exiting '${methodName}'`);
            return result;
        }
        return replacementMethod;
    };
}

class Greeter {
    @logWithPrefix("⚠️")
    greet(name: string) {
        console.log(`Hello, ${name}!`);
    }
}
```

> **运行时注意**：
> - `tsx` 和 `bun`：完整支持新标准装饰器
> - `node --experimental-strip-types`：**不支持**装饰器（装饰器不是可擦除语法，需要代码生成）
> - 装饰器在实际项目中主要用于框架（Angular、NestJS 等）。了解其原理即可。

## 4.9 `this` 的陷阱

这是从 C++/Rust 转来最需要注意的点——JS/TS 的 `this` 不像 C++ 的 `this` 指针那样总是指向当前对象。

```typescript
class Timer {
    seconds: number = 0;

    // 问题：普通方法的 this 取决于调用方式
    start() {
        setInterval(function () {
            this.seconds++;  // 错误！this 不是 Timer 实例
        }, 1000);
    }

    // 解决方案1：箭头函数（捕获外层 this）
    startFixed() {
        setInterval(() => {
            this.seconds++;  // 正确！箭头函数继承外层 this
        }, 1000);
    }

    // 解决方案2：在方法声明时用箭头函数
    increment = () => {
        this.seconds++;  // 始终绑定到实例
    };
}

// 经验法则：
// - 类方法中的回调，始终用箭头函数 () => {}
// - 如果方法会被当作回调传递，声明为箭头函数属性
```

> **C++ 对比**：C++ 的 `this` 始终指向当前对象，在编译期确定。
> JS/TS 的 `this` 在**运行时**由调用方式决定，这是最常见的 bug 来源之一。
> 记住：**箭头函数没有自己的 this，它捕获定义时的 this**。

## 4.10 实用模式对照

| 模式 | C++ | Rust | TypeScript |
|------|-----|------|------------|
| 构造函数 | `Class()` | `impl Class { fn new() }` | `constructor()` |
| 析构函数 | `~Class()` | `impl Drop` | 无（GC 自动回收）/ `using` |
| 私有成员 | `private:` | 模块级私有 | `private` / `#field` |
| 接口/抽象 | 纯虚函数 | `trait` | `interface` / `abstract class` |
| 多态 | 虚函数+vtable | trait object (`dyn Trait`) | 天然支持（结构化类型） |
| 运算符重载 | `operator+` | `impl Add` | 不支持 |
| 泛型类 | `template<T> class` | `struct<T>` | `class<T>` |

## 4.11 练习

```typescript
// 练习1：实现一个泛型 Stack<T> 类
// - push(item: T): void
// - pop(): T | undefined
// - peek(): T | undefined
// - get size(): number（getter）
// 内部用数组存储

// 练习2：定义接口 Comparable<T>（含 compareTo(other: T): number）
// 让你的 Stack 支持一个 sort() 方法，约束 T extends Comparable<T>

// 练习3：实现一个 EventEmitter 类
// - on(event: string, callback: Function): void
// - emit(event: string, ...args: any[]): void
// - off(event: string, callback: Function): void
// 提示：用 Map<string, Function[]> 存储监听器
```

---
下一章：[Chapter 5 - 高级类型系统](./05-advanced-types.md)
