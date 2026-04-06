# Chapter 6: 异步编程

> 目标：理解 JS/TS 的异步模型，掌握 Promise 和 async/await，对比 Python asyncio。
> 示例代码：[examples/ch06/async.ts](./examples/ch06/async.ts) — 运行：`npx tsx examples/ch06/async.ts` | `bun examples/ch06/async.ts` | `node examples/ch06/async.ts`(v24+)

## 6.1 JS 异步模型：事件循环

JS/TS 是**单线程**的，通过事件循环（Event Loop）处理并发——与 Python 的 asyncio 模型几乎一样。

```
┌─────────────────────────────┐
│         Call Stack           │ ← 当前执行的同步代码
└──────────┬──────────────────┘
           │ 同步代码执行完毕
           ▼
┌─────────────────────────────┐
│    Microtask Queue           │ ← Promise 回调、await 恢复
└──────────┬──────────────────┘
           │ 微任务清空后
           ▼
┌─────────────────────────────┐
│    Macrotask Queue           │ ← setTimeout、I/O 回调、事件
└─────────────────────────────┘
```

> **与 Python asyncio 的关系**：
> - Python: `asyncio.get_event_loop().run_forever()` → JS: 事件循环自动运行
> - Python: 需要 `asyncio.run()` 启动 → JS: 天然在事件循环中
> - Python: `await asyncio.sleep(1)` → JS: `await new Promise(r => setTimeout(r, 1000))`
>
> **与 C/C++/Rust 的关系**：
> - C/C++: 多线程 + 互斥锁 → JS: 单线程，无需锁
> - Rust: tokio 运行时 + async/await → JS: 内置事件循环 + async/await

## 6.2 回调（Callback）——历史遗留

```typescript
// 回调是最原始的异步模式，现在应该用 Promise/async 代替
// 但很多旧 API 仍使用回调，你需要能读懂

// Node.js 风格回调：第一个参数是错误
import { readFile } from "fs";

readFile("/path/to/file", "utf-8", (err, data) => {
    if (err) {
        console.error("Failed:", err);
        return;
    }
    console.log(data);
});

// "回调地狱"（Callback Hell）——嵌套回调导致代码难以维护
// 这正是 Promise 被发明出来解决的问题
```

## 6.3 Promise

```typescript
// Promise 代表一个异步操作的最终结果
// 三种状态：pending（进行中）、fulfilled（成功）、rejected（失败）

// ——— 创建 Promise ———
const promise = new Promise<string>((resolve, reject) => {
    // 异步操作
    setTimeout(() => {
        const success = true;
        if (success) {
            resolve("data loaded");   // 成功，传递结果
        } else {
            reject(new Error("failed"));  // 失败，传递错误
        }
    }, 1000);
});

// ——— 消费 Promise ———
promise
    .then(data => {
        console.log(data);         // "data loaded"
        return data.toUpperCase(); // 可以链式返回新 Promise
    })
    .then(upper => {
        console.log(upper);        // "DATA LOADED"
    })
    .catch(err => {
        console.error(err);        // 处理错误
    })
    .finally(() => {
        console.log("done");       // 无论成功失败都执行
    });
```

### Python 对比

```python
# Python asyncio 等价代码
import asyncio

async def load_data() -> str:
    await asyncio.sleep(1)
    return "data loaded"

# Python 没有 .then() 链，直接用 await
```

## 6.4 async/await

`async/await` 是 Promise 的语法糖，让异步代码看起来像同步代码。

```typescript
// ——— async 函数自动返回 Promise ———
async function fetchUser(id: number): Promise<{ name: string }> {
    // await 暂停执行，等待 Promise 完成
    const response = await fetch(`/api/users/${id}`);

    // response.json() 也返回 Promise
    const data = await response.json();

    return data;  // 自动包装为 Promise<{ name: string }>
}

// ——— 错误处理：try/catch ———
async function loadData(): Promise<string> {
    try {
        const response = await fetch("/api/data");
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to load:", error);
        throw error;  // 重新抛出，类似 Rust 的 ? 传播
    }
}
```

### 完整对比：Python asyncio vs TypeScript

```typescript
// ——— TypeScript ———
async function processItems(urls: string[]): Promise<string[]> {
    const results: string[] = [];
    for (const url of urls) {
        const response = await fetch(url);
        const text = await response.text();
        results.push(text);
    }
    return results;
}
```

```python
# ——— Python 等价 ———
import aiohttp

async def process_items(urls: list[str]) -> list[str]:
    results = []
    async with aiohttp.ClientSession() as session:
        for url in urls:
            async with session.get(url) as response:
                text = await response.text()
                results.append(text)
    return results
```

> **关键差异**：
> - Python 需要 `asyncio.run()` 启动，TS 的顶层可以直接 `await`（ESM 模块中）
> - Python 有 `async with`（异步上下文管理器），TS 没有等价语法
> - 两者的 `async/await` 语义几乎完全一致

## 6.5 并发模式

```typescript
// ——— Promise.all：并行执行所有，全部成功才成功 ———
// 类似 Python 的 asyncio.gather()，Rust 的 tokio::join!()
async function fetchMultiple(ids: number[]) {
    const promises = ids.map(id => fetch(`/api/users/${id}`));
    const responses = await Promise.all(promises);
    // 所有请求并行发出，等待全部完成
    return Promise.all(responses.map(r => r.json()));
}

// ——— Promise.allSettled：并行执行所有，不论成败 ———
// 类似 Python 的 asyncio.gather(return_exceptions=True)
async function fetchBestEffort(urls: string[]) {
    const results = await Promise.allSettled(
        urls.map(url => fetch(url))
    );

    for (const result of results) {
        if (result.status === "fulfilled") {
            console.log("Success:", result.value);
        } else {
            console.log("Failed:", result.reason);
        }
    }
}

// ——— Promise.race：第一个完成的就返回 ———
// 类似 Python 的 asyncio.wait(return_when=FIRST_COMPLETED)
async function fetchWithTimeout(url: string, ms: number) {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), ms)
    );
    return Promise.race([fetch(url), timeout]);
}

// ——— Promise.any：第一个成功的就返回（忽略失败） ———
async function fetchFromMirrors(mirrors: string[]) {
    return Promise.any(mirrors.map(url => fetch(url)));
    // 任一成功即返回，全部失败才报 AggregateError
}
```

## 6.6 常见异步陷阱

```typescript
// ❌ 陷阱1：循环中的 await 串行化
// 以下代码是顺序执行的，不是并行！
async function slow(ids: number[]) {
    const results = [];
    for (const id of ids) {
        results.push(await fetchUser(id));  // 一个接一个
    }
    return results;
}

// ✅ 修复：用 Promise.all 并行执行
async function fast(ids: number[]) {
    return Promise.all(ids.map(id => fetchUser(id)));
}

// ❌ 陷阱2：忘记 await
async function buggy() {
    const data = fetchData();  // 忘记 await！data 是 Promise，不是结果
    console.log(data);         // 输出 Promise { <pending> }
}

// ❌ 陷阱3：async 函数中的错误被吞掉
async function fireAndForget() {
    dangerousOperation();  // 如果这是 async 函数，错误会被静默吞掉
}
// ✅ 修复：总是 await 或 .catch()
async function proper() {
    await dangerousOperation();  // 错误会被 catch
    // 或
    dangerousOperation().catch(console.error);
}
```

## 6.7 异步迭代器

```typescript
// 类似 Python 的 async for ... in ...

// 异步生成器
async function* paginate(url: string): AsyncGenerator<any[]> {
    let page = 1;
    while (true) {
        const response = await fetch(`${url}?page=${page}`);
        const data = await response.json();
        if (data.length === 0) break;
        yield data;
        page++;
    }
}

// 异步 for...of
async function processAllPages() {
    for await (const page of paginate("/api/items")) {
        console.log(`Got ${page.length} items`);
    }
}
```

```python
# Python 等价：
async def paginate(url: str):
    page = 1
    while True:
        data = await fetch_page(url, page)
        if not data:
            break
        yield data
        page += 1

async def process_all_pages():
    async for page in paginate("/api/items"):
        print(f"Got {len(page)} items")
```

## 6.8 实用模式

```typescript
// ——— 延迟函数 ———
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

await sleep(1000);  // 等待 1 秒

// ——— 重试逻辑 ———
async function retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) throw error;
            await sleep(delayMs * attempt);
        }
    }
    throw new Error("Unreachable");
}

// ——— 信号量/并发限制 ———
async function mapWithConcurrency<T, R>(
    items: T[],
    limit: number,
    fn: (item: T) => Promise<R>
): Promise<R[]> {
    const results: R[] = [];
    const executing = new Set<Promise<void>>();

    for (const item of items) {
        const p = fn(item).then(result => {
            results.push(result);
            executing.delete(p);
        });
        executing.add(p);

        if (executing.size >= limit) {
            await Promise.race(executing);
        }
    }
    await Promise.all(executing);
    return results;
}
```

## 6.9 练习

```typescript
// 练习1：实现一个 fetchWithRetry 函数
// 如果 fetch 失败，重试最多 3 次，每次间隔翻倍（1s, 2s, 4s）
// 返回 Promise<Response>

// 练习2：实现一个 timeout 包装器
// function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T>
// 如果超时，reject 一个 TimeoutError

// 练习3：实现一个简单的异步任务队列
// class AsyncQueue {
//   constructor(concurrency: number)
//   add(task: () => Promise<void>): Promise<void>
// }
// 限制同时执行的任务数不超过 concurrency
```

---
下一章：[Chapter 7 - 模块系统与项目配置](./07-modules-config.md)
