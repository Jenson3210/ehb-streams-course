# Intermediate operations

## After this lesson you can...

- Transform and select elements with `filter`, `map`, `flatMap`, `distinct`, `skip`, `limit` and `takeWhile`.
- Pass the same step as a lambda, a method reference or a method.
- Chain operations and explain why their order changes the result and the speed.
- Use `peek` to see what flows through a pipeline, for debugging only.

## What to do

1. Open `src/Main.java`.
2. Run it and read the demo methods in the order `main` calls them: `actionCanBeStatementLambda`,
   `actionCanBeExpressionLambda`, `actionCanBeMethodReference`, `actionCanBeMethod`, `actionsCanBeChained` and
   `theOrderOfChainingMatters`.
3. Try the debugging tips below on these demos. There is nothing to implement.

## What you should see

One block of output per demo method. The first four do the same work with a different kind of step (statement lambda,
expression lambda, method reference, method). The last two show a chain of steps and how its order changes the result.

## The operations

An intermediate operation returns a new stream, so you can chain them. Nothing runs until a terminal operation is called.

**Demonstrated in `Main`**

- `filter`: fewer elements, same type (keeps what matches the condition).
- `map`: same number of elements, new type (one output per input).
- `flatMap`: one-to-many, each element becomes a stream that is merged into one (for example order -> its order lines).
- `distinct`: fewer elements, same type (drops duplicates). Its position in the chain changes how much work follows.

**Not demoed in `Main`**

- `skip`: drops the first n elements.
- `limit`: keeps at most the first n elements (makes an infinite stream finite).
- `takeWhile`: keeps elements until the condition is false for the first time, then stops.
- `dropWhile`: drops elements until the condition is false for the first time, then keeps the rest.
- `sorted`: same elements in a new order (needs to see all elements first).
- `peek`: same elements, runs an action on each one on the way past (debugging only, see below).
- `mapToInt` --> `IntStream`: same count, primitive ints.
- `mapToDouble` --> `DoubleStream`: same count, primitive doubles.
- `mapToLong` --> `LongStream`: same count, primitive longs.

> **`peek`**: The `peek` method is useful for debugging. It allows you to perform a stream operation without changing the stream itself. For example, you can use `peek` to print out each element as it is processed by a stream.
> HOWEVER, `peek` is an intermediate operation, so it does not trigger the processing of the stream. In other words, if you have a stream pipeline that consists of only intermediate operations, nothing will happen until you have a terminal operation.
> `peek` should ONLY BE USED FOR DEBUGGING PURPOSES. It is not intended to be used in production code.

## Debugging tips

`peek` is one way to see inside a pipeline. The IDE can show the same without changing your code. The presenter walks through these on the demos that already exist in `Main`, nothing new to write.

**1. `peek`: quick, but it edits the code**

- Put `.peek(System.out::println)` between two stages and read what flows past. Move it one stage further and compare.
- Remember that a stream is lazy: you see the elements one at a time, interleaved with the later stages, not stage by stage.
- It is a debugging aid only. You have to change the code (and remove it again), and a `peek` whose action changes state is a bug waiting to happen. Do not keep it in production code. (The JDK documents `peek` as existing mainly to support debugging.)

**2. Breakpoints inside lambdas and stepping**

- Open `Main` and find the lambda in `filter(order -> order.paid())` (the lambda demo, around line 36). Click in the gutter next to that line to set a breakpoint, then start the program with **Debug**.
- When a lambda is the only meaningful code on a line, IntelliJ puts the breakpoint on the lambda instead of on the whole line. If a line holds more than one candidate, the gutter can show small circles inside the line (a line breakpoint and one per lambda), so you choose which one you mean. The exact look depends on your IntelliJ version.
- The breakpoint is hit once per element. Look at the lambda parameter (`order`) in the Variables view, then **Resume Program** to jump to the next element, or step to follow one element through the chain.
- The chain in `actionsCanBeChained` uses method references only (`Order::paid`, `Order::orderLines`, ...). There is no lambda body to stop in, so use the stream trace (next point) there, or turn a method reference into a lambda while debugging.

**3. Trace Current Stream Chain**

- Set a breakpoint on the line where the stream starts in `actionsCanBeChained` (`Database.orders.stream()`) and run in Debug mode. When the program is suspended there, open the **More** menu in the toolbar of the Debug tool window and choose **Trace Current Stream Chain**.
- A *Stream Trace* dialog opens. It has a tab per stage of the chain showing what that stage received and what it returned, and a **Flat Mode** that shows all transformations in one overview. You can see at which stage an element disappeared (`filter`, `distinct`) or changed (`map`).
- Good to know:
  - The feature comes with the *Java Stream Debugger* plugin (check in the plugin settings that it is installed and enabled).
  - The trace needs the stream to end with a terminal operation, and terminal operations without a result (such as `forEach`) are not drawn in Flat Mode.
  - It only works on your own project code, not on library code.

**4. Reading a stack trace through `java.util.stream`**

- When a lambda throws, the stack trace shows many frames from `java.util.stream` (`ReferencePipeline`, `Sink`, `AbstractPipeline`, ...) between your lambda and the line of the terminal operation. They are the plumbing of the pipeline: ignore them.
- Read from the top for the exception type and message, then find the first frame in **your** code. That is the lambda or method that failed (`Main.lambda$...`). The last frame of your own code lower in the trace is the line with the terminal operation that started the pipeline.
- The stack trace does not tell you which element caused the failure. Use a lambda breakpoint (or a condition on the breakpoint) or `peek` to find it.
- Because of laziness the failure happens at the terminal operation, not at the line where you wrote the faulty `map` or `filter`.

> **Rule of thumb:** `peek` for a quick look, a lambda breakpoint to inspect one element, *Trace Current Stream Chain* to see the whole chain at once.

## Key takeaways

- An intermediate operation returns a new stream and runs nothing by itself. A terminal operation starts the pipeline.
- A step can be a lambda, a method reference or a method.
- The order of the steps changes the result and the amount of work.
- `peek` is for debugging only. A lambda breakpoint or *Trace Current Stream Chain* shows the same without changing the code.
