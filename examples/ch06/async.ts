// =====================================================
// Chapter 6 示例：异步编程
// 运行方式：
//   Node.js (v22.18+): node --experimental-strip-types async.ts
//   Node.js (v24+):    node async.ts
//   Node.js (tsx):     npx tsx async.ts
//   Bun:               bun async.ts
// =====================================================

console.log("=== Chapter 6: 异步编程 ===\n");

// ——— 6.1 Promise 基础 ———
console.log("--- Promise 基础 ---");

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function simulateApi<T>(data: T, ms: number = 50): Promise<T> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(data), ms);
    });
}

// ——— 6.2 async/await ———
async function fetchUser(id: number): Promise<{ id: number; name: string }> {
    await delay(10);
    return { id, name: `User_${id}` };
}

// ——— 6.3 错误处理 ———
async function riskyOperation(shouldFail: boolean): Promise<string> {
    await delay(10);
    if (shouldFail) {
        throw new Error("Operation failed");
    }
    return "Success";
}

async function safeOperation(shouldFail: boolean): Promise<string> {
    try {
        const result = await riskyOperation(shouldFail);
        return result;
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return `Caught: ${message}`;
    }
}

// ——— 6.4 并发模式 ———
async function demoConcurrency() {
    console.log("\n--- Promise.all（并行执行）---");
    const start = Date.now();
    const users = await Promise.all([
        fetchUser(1),
        fetchUser(2),
        fetchUser(3),
    ]);
    console.log(`  fetched ${users.length} users in ${Date.now() - start}ms`);
    users.forEach(u => console.log(`  - ${u.name}`));

    console.log("\n--- Promise.allSettled ---");
    const results = await Promise.allSettled([
        riskyOperation(false),
        riskyOperation(true),
        riskyOperation(false),
    ]);

    for (const result of results) {
        if (result.status === "fulfilled") {
            console.log(`  ✓ ${result.value}`);
        } else {
            console.log(`  ✗ ${result.reason.message}`);
        }
    }

    console.log("\n--- Promise.race ---");
    const fastest = await Promise.race([
        simulateApi("slow", 100),
        simulateApi("fast", 10),
        simulateApi("medium", 50),
    ]);
    console.log(`  fastest: "${fastest}"`);
}

// ——— 6.5 常见陷阱：串行 vs 并行 ———
async function demoSerialVsParallel() {
    console.log("\n--- 串行 vs 并行 ---");

    // 串行（慢）
    const startSerial = Date.now();
    const r1 = await simulateApi("a", 30);
    const r2 = await simulateApi("b", 30);
    const r3 = await simulateApi("c", 30);
    console.log(`  串行: ${Date.now() - startSerial}ms → [${r1}, ${r2}, ${r3}]`);

    // 并行（快）
    const startParallel = Date.now();
    const [p1, p2, p3] = await Promise.all([
        simulateApi("a", 30),
        simulateApi("b", 30),
        simulateApi("c", 30),
    ]);
    console.log(`  并行: ${Date.now() - startParallel}ms → [${p1}, ${p2}, ${p3}]`);
}

// ——— 6.6 实用模式 ———
async function retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 50
): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) throw error;
            console.log(`  retry: attempt ${attempt} failed, retrying...`);
            await delay(delayMs);
        }
    }
    throw new Error("Unreachable");
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    );
    return Promise.race([promise, timeout]);
}

async function demoUtilityPatterns() {
    console.log("\n--- retry 模式 ---");
    let callCount = 0;
    const unreliable = () => {
        callCount++;
        if (callCount < 3) throw new Error("Not ready");
        return Promise.resolve("Finally worked!");
    };

    const result = await retry(unreliable, 5, 10);
    console.log(`  result: "${result}" (took ${callCount} attempts)`);

    console.log("\n--- timeout 模式 ---");
    try {
        await withTimeout(delay(200), 50);
    } catch (e) {
        console.log(`  ${(e as Error).message}`);
    }

    const fast = await withTimeout(simulateApi("quick", 10), 100);
    console.log(`  fast result: "${fast}"`);
}

// ——— 6.7 异步生成器 ———
async function* generateNumbers(count: number): AsyncGenerator<number> {
    for (let i = 0; i < count; i++) {
        await delay(5);
        yield i;
    }
}

async function demoAsyncGenerator() {
    console.log("\n--- 异步生成器 ---");
    const nums: number[] = [];
    for await (const n of generateNumbers(5)) {
        nums.push(n);
    }
    console.log(`  async generator: [${nums}]`);
}

// ——— 主函数 ———
async function main() {
    // 基础
    const user = await fetchUser(1);
    console.log(`fetchUser(1) = ${JSON.stringify(user)}`);

    // 错误处理
    console.log("\n--- 错误处理 ---");
    console.log(`safe(false) = "${await safeOperation(false)}"`);
    console.log(`safe(true) = "${await safeOperation(true)}"`);

    // 并发
    await demoConcurrency();

    // 串行vs并行
    await demoSerialVsParallel();

    // 实用模式
    await demoUtilityPatterns();

    // 异步生成器
    await demoAsyncGenerator();

    console.log("\n=== Chapter 6 完成 ===");
}

main().catch(console.error);

export {};
