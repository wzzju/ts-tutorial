// =====================================================
// ch07/math.ts — 演示命名导出（Named Export）和默认导出（Default Export）
// 类比 Rust: pub fn / pub struct（命名导出）vs 无直接对应（默认导出）
// =====================================================

// 命名导出：可以导出多个
export function add(a: number, b: number): number {
    return a + b;
}

export function multiply(a: number, b: number): number {
    return a * b;
}

export const PI = 3.14159;

// 默认导出：每个模块只能有一个
// 导入时可以用任意名字：import Calc from "./math"
export default class Calculator {
    private history: string[] = [];

    run(operation: string, a: number, b: number): number {
        let result: number;
        switch (operation) {
            case "add":      result = add(a, b); break;
            case "multiply": result = multiply(a, b); break;
            default: throw new Error(`Unknown operation: ${operation}`);
        }
        this.history.push(`${operation}(${a}, ${b}) = ${result}`);
        return result;
    }

    getHistory(): string[] {
        return [...this.history];
    }
}
