// =====================================================
// Chapter 4 示例：面向对象——类、继承与装饰器
// 运行方式：
//   Node.js (v22.18+): node --experimental-strip-types classes.ts
//   Node.js (v24+):    node classes.ts
//   Node.js (tsx):     npx tsx classes.ts
//   Bun:               bun classes.ts
// =====================================================

console.log("=== Chapter 4: 面向对象 ===\n");

// ——— 4.1 类的基础 ———
console.log("--- 类的基础 ---");

class Animal {
    name: string;
    private _age: number;
    protected species: string;
    readonly id: number;
    static count: number = 0;

    constructor(name: string, age: number, species: string) {
        this.name = name;
        this._age = age;
        this.species = species;
        this.id = ++Animal.count;
    }

    greet(): string {
        return `I'm ${this.name}, a ${this.species}`;
    }

    get age(): number {
        return this._age;
    }

    set age(value: number) {
        if (value < 0) throw new Error("Age cannot be negative");
        this._age = value;
    }
}

const cat = new Animal("Kitty", 3, "Cat");
console.log(cat.greet());
console.log(`age = ${cat.age}`);
cat.age = 4;
console.log(`age after set = ${cat.age}`);

// ——— 参数属性简写 ———
class Point {
    constructor(
        public x: number,
        public y: number,
        private _label: string = "point"
    ) {}

    toString(): string {
        return `${this._label}(${this.x}, ${this.y})`;
    }
}

const p = new Point(10, 20);
console.log(`Point: ${p.toString()}`);

// ——— 4.2 继承 ———
console.log("\n--- 继承 ---");

class Dog extends Animal {
    breed: string;

    constructor(name: string, age: number, breed: string) {
        super(name, age, "Dog");
        this.breed = breed;
    }

    greet(): string {
        return `Woof! ${super.greet()}, breed: ${this.breed}`;
    }

    fetch(item: string): string {
        return `${this.name} fetches ${item}`;
    }
}

const dog = new Dog("Rex", 5, "Labrador");
console.log(dog.greet());
console.log(dog.fetch("ball"));

// ——— 4.3 抽象类 ———
console.log("\n--- 抽象类 ---");

abstract class Shape {
    abstract area(): number;
    abstract perimeter(): number;

    describe(): string {
        return `Area: ${this.area().toFixed(2)}, Perimeter: ${this.perimeter().toFixed(2)}`;
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

class Rectangle extends Shape {
    constructor(public width: number, public height: number) {
        super();
    }

    area(): number {
        return this.width * this.height;
    }

    perimeter(): number {
        return 2 * (this.width + this.height);
    }
}

const circle = new Circle(5);
const rect = new Rectangle(4, 6);
console.log(`Circle(r=5): ${circle.describe()}`);
console.log(`Rectangle(4×6): ${rect.describe()}`);

// ——— 4.4 接口与类 ———
console.log("\n--- 接口与类 ---");

interface Serializable {
    serialize(): string;
}

interface Printable {
    print(): void;
}

class Document implements Serializable, Printable {
    constructor(public content: string) {}

    serialize(): string {
        return JSON.stringify({ content: this.content });
    }

    print(): void {
        console.log(`  [Document] ${this.content}`);
    }
}

const doc = new Document("Hello World");
console.log(`serialize: ${doc.serialize()}`);
doc.print();

// 结构化类型：不写 implements 也能当接口用
class SimpleDoc {
    constructor(public content: string) {}
    serialize(): string { return this.content; }
    print(): void { console.log(`  [SimpleDoc] ${this.content}`); }
}

function save(item: Serializable) {
    console.log(`  Saving: ${item.serialize()}`);
}
save(new SimpleDoc("test"));  // OK！结构匹配

// ——— 4.5 TC39 标准装饰器（TS 5.0+）———
// 注意：这是新标准装饰器语法，不需要 experimentalDecorators 标志
// Node.js --experimental-strip-types 不支持装饰器（非可擦除语法）
// 需要用 tsx 或 bun 运行
console.log("\n--- TC39 标准装饰器（TS 5.0+）---");

// 方法装饰器：新语法使用 ClassMethodDecoratorContext
function log(
    originalMethod: Function,
    context: ClassMethodDecoratorContext
) {
    const methodName = String(context.name);
    function replacementMethod(this: unknown, ...args: unknown[]) {
        console.log(`  → Entering ${methodName}(${args.join(", ")})`);
        const result = (originalMethod as Function).call(this, ...args);
        console.log(`  ← Exiting ${methodName}, returned: ${result}`);
        return result;
    }
    return replacementMethod;
}

// 装饰器工厂
function logWithPrefix(prefix: string) {
    return function (
        originalMethod: Function,
        context: ClassMethodDecoratorContext
    ) {
        const methodName = String(context.name);
        function replacementMethod(this: unknown, ...args: unknown[]) {
            console.log(`  ${prefix} Entering '${methodName}'`);
            const result = (originalMethod as Function).call(this, ...args);
            console.log(`  ${prefix} Exiting '${methodName}'`);
            return result;
        }
        return replacementMethod;
    };
}

class Calculator {
    @log
    add(a: number, b: number): number {
        return a + b;
    }

    @logWithPrefix("⚠️")
    multiply(a: number, b: number): number {
        return a * b;
    }
}

const calc = new Calculator();
calc.add(2, 3);
calc.multiply(4, 5);

// ——— 4.6 this 的陷阱 ———
console.log("\n--- this 的陷阱 ---");

class Timer {
    seconds: number = 0;

    // 箭头函数属性：始终绑定到实例
    increment = () => {
        this.seconds++;
    };

    getSeconds(): number {
        return this.seconds;
    }
}

const timer = new Timer();
const incFn = timer.increment;  // 即使提取出来也能正确工作
incFn();
incFn();
console.log(`timer.seconds = ${timer.seconds}`);  // 2

// ——— 练习示例：泛型 Stack ———
console.log("\n--- 练习: 泛型 Stack ---");

class Stack<T> {
    private items: T[] = [];

    push(item: T): void {
        this.items.push(item);
    }

    pop(): T | undefined {
        return this.items.pop();
    }

    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }

    get size(): number {
        return this.items.length;
    }
}

const stack = new Stack<number>();
stack.push(1);
stack.push(2);
stack.push(3);
console.log(`peek = ${stack.peek()}, size = ${stack.size}`);
console.log(`pop = ${stack.pop()}`);
console.log(`size after pop = ${stack.size}`);

console.log("\n=== Chapter 4 完成 ===");

export {};
