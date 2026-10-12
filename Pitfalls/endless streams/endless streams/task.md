# Pitfall: endless streams

## After this lesson you can...

- Explain why an infinite stream needs a short-circuiting operation.
- Explain why the order of `distinct` and `limit` can make a pipeline hang.

**This code is broken on purpose.** Do not fix it, watch it.

## What to do

1. Open `src/Main.java`. It has two methods: `endlessStreamsPt1` and `endlessStreamsPt2`.
2. Run `Main` and watch the console.
3. Press the red **Stop** button in IntelliJ when you have seen enough.

## What you should see
1. A never-ending stream of `0 1 0 1 0 1 …`. After 10 seconds the lesson gives up waiting (timeout), but the pipeline
   keeps running in the background.
2. Then a second pipeline starts. It looks safe because it has `limit(10)`, but it still never finishes. It prints
   `0 1` and then hangs, while the first pipeline is still flooding the console.

> **Warning:** the output is huge and the program does **not** stop by itself. Press the red **Stop** button in IntelliJ.

## Why it goes wrong
- `IntStream.iterate(seed, next)` has no end. A terminal operation like `forEach` keeps asking for the next element forever.
  Only a *short-circuiting* operation (`limit`, `findFirst`, `takeWhile`, `anyMatch`…) can end an infinite stream.
- The timeout does not help: it only stops *waiting* for the task. The `forEach` loop never checks for interruption,
  and the executor threads are never shut down, so the JVM stays alive.
- In the second pipeline `distinct()` comes **before** `limit(10)`. The stream only ever contains two distinct
  values (0 and 1), so after two elements `distinct()` lets nothing more through. `limit(10)` waits for ten elements
  that never arrive.

## How to fix it
- Put `limit` before `distinct`: `iterate(...).limit(10).distinct()` prints `0 1`.
- Or give the stream an end condition: `IntStream.iterate(0, i -> i < 10, i -> i + 1)`.
- Or use `takeWhile(...)`, but only on a sequence that eventually fails the condition. On `0 1 0 1 …` a condition
  like `i < 10` is always true, so it would never stop either.

## Key takeaways

- Infinite streams (`iterate`, `generate`) need a short-circuiting operation, and the **order** of operations decides whether it can do its job.
