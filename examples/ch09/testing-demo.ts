// =====================================================
// Chapter 9 示例：测试演示（无需测试框架的简易测试）
// 运行方式：
//   Node.js (v22.18+): node --experimental-strip-types testing-demo.ts
//   Node.js (v24+):    node testing-demo.ts
//   Node.js (tsx):     npx tsx testing-demo.ts
//   Bun:               bun testing-demo.ts
// =====================================================

console.log("=== Chapter 9: 测试演示 ===\n");

// ——— 被测代码 ———

function add(a: number, b: number): number {
    return a + b;
}

function divide(a: number, b: number): number {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
}

function capitalize(str: string): string {
    if (str.length === 0) return str;
    return str[0].toUpperCase() + str.slice(1);
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

// ——— 极简测试框架 ———
// 实际项目使用 Vitest 或 Jest

let passed = 0;
let failed = 0;
let currentGroup = "";

function describe(name: string, fn: () => void): void {
    currentGroup = name;
    console.log(`  ${name}`);
    fn();
    currentGroup = "";
}

function it(name: string, fn: () => void): void {
    try {
        fn();
        console.log(`    ✓ ${name}`);
        passed++;
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.log(`    ✗ ${name} — ${msg}`);
        failed++;
    }
}

function expect<T>(actual: T) {
    return {
        toBe(expected: T): void {
            if (actual !== expected) {
                throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
            }
        },
        toThrow(expectedMessage?: string): void {
            // This is for function calls
            throw new Error("Use expectThrow for functions");
        },
    };
}

function expectThrow(fn: () => void, expectedMessage?: string): void {
    try {
        fn();
        throw new Error("Expected function to throw, but it didn't");
    } catch (e) {
        if (e instanceof Error && e.message === "Expected function to throw, but it didn't") {
            throw e;
        }
        if (expectedMessage && e instanceof Error && !e.message.includes(expectedMessage)) {
            throw new Error(`Expected error "${expectedMessage}", got "${e.message}"`);
        }
    }
}

// ——— 测试 ———

console.log("--- 运行测试 ---\n");

describe("add", () => {
    it("adds two positive numbers", () => {
        expect(add(1, 2)).toBe(3);
    });

    it("adds negative numbers", () => {
        expect(add(-1, -2)).toBe(-3);
    });

    it("adds zero", () => {
        expect(add(0, 0)).toBe(0);
    });
});

describe("divide", () => {
    it("divides two numbers", () => {
        expect(divide(10, 2)).toBe(5);
    });

    it("returns float result", () => {
        expect(divide(1, 3)).toBe(1 / 3);
    });

    it("throws on division by zero", () => {
        expectThrow(() => divide(10, 0), "Division by zero");
    });
});

describe("capitalize", () => {
    it("capitalizes first letter", () => {
        expect(capitalize("hello")).toBe("Hello");
    });

    it("handles empty string", () => {
        expect(capitalize("")).toBe("");
    });

    it("handles single character", () => {
        expect(capitalize("a")).toBe("A");
    });
});

describe("clamp", () => {
    it("returns value within range", () => {
        expect(clamp(5, 0, 10)).toBe(5);
    });

    it("clamps to min", () => {
        expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("clamps to max", () => {
        expect(clamp(15, 0, 10)).toBe(10);
    });
});

// ——— 结果 ———
console.log(`\n--- 结果: ${passed} passed, ${failed} failed ---`);

// ——— 工具链说明 ———
console.log(`
--- 实际项目推荐的测试工具 ---

# 安装 Vitest（推荐，与 Vite 集成）
npm install -D vitest

# 运行测试
npx vitest          # 监听模式
npx vitest run      # 运行一次
npx vitest --coverage  # 带覆盖率

# Vitest 测试文件示例 (math.test.ts):
# import { describe, it, expect } from "vitest";
# import { add, divide } from "./math";
#
# describe("add", () => {
#     it("adds two numbers", () => {
#         expect(add(1, 2)).toBe(3);
#     });
# });
`);

console.log("=== Chapter 9 完成 ===");

if (failed > 0) {
    process.exit(1);
}

export {};
