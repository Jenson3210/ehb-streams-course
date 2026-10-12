# Mastering Java Streams API

An educational course (Java 25, Gradle, JUnit, AssertJ) taught to EhB students. Open it in IntelliJ IDEA with the
[Learn and Teach](https://www.jetbrains.com/help/idea/product-educational-tools.html) plugin.

Lessons: Introduction, What is a Stream, Stream Initialization, Intermediate operations, Terminal operations, Pitfalls, Exercises.

---

# Streams cheat sheet

```
 SOURCE (init)          INTERMEDIATE (0..n, lazy)            TERMINAL (exactly 1, starts it)
 list.stream()    -->   filter -> map -> sorted -> ...  -->  toList() / sum() / collect(...)
```

- A stream is **lazy**: nothing runs until the terminal operation.
- A stream can be consumed **once**.
- Intermediate operations return a new stream, terminal operations return a result (or `void`).
- The **order of the steps** changes the result and the amount of work.

## 1. Init: creating a stream

| Source | Code | Notes |
|---|---|---|
| Collection | `list.stream()` | also works on an empty list |
| Values | `Stream.of(a, b, c)` | |
| Array | `Arrays.stream(array)` | |
| Empty | `Stream.empty()` | |
| Null-safe single value | `Stream.ofNullable(x)` | empty when `x` is `null` (Java 9) |
| Join two streams | `Stream.concat(s1, s2)` | |
| Builder | `Stream.builder().add(a).add(b).build()` | |
| Int range | `IntStream.range(0, 5)` / `rangeClosed(0, 5)` | `range` excludes the end, `rangeClosed` includes it |
| Long range | `LongStream.range(...)` / `rangeClosed(...)` | |
| Characters | `"text".chars()` | an `IntStream` |
| Map | `map.entrySet().stream()` | a `Map` itself has no `stream()` |
| File lines | `Files.lines(path)` | close it (try-with-resources) |
| Endless, generated | `Stream.generate(supplier)` | **infinite**: always combine with `limit` |
| Endless, iterated | `Stream.iterate(seed, next)` | **infinite**: always combine with `limit` |
| Finite, `for`-like | `Stream.iterate(seed, hasNext, next)` | ends by itself (Java 9) |

## 2. Intermediate operations

Each returns a new stream, so you can chain them.

| Operation | Elements | What it does | Example |
|---|---|---|---|
| `filter(p)` | fewer, same type | keeps what matches | `.filter(Order::paid)` |
| `map(f)` | same count, new type | one output per input | `.map(Article::name)` |
| `flatMap(f)` | one-to-many | each element becomes a stream, merged into one | `.flatMap(o -> o.orderLines().stream())` |
| `mapMulti(f)` | zero, one or many | like `flatMap` without a temporary stream (Java 16) | `.<Integer>mapMulti((n, sink) -> ...)` |
| `mapToInt` / `mapToLong` / `mapToDouble` | same count, primitives | gives an `IntStream` / `LongStream` / `DoubleStream` | `.mapToDouble(OrderLine::total)` |
| `boxed()` | same count | primitive stream back to `Stream<Integer>` etc. | `.boxed()` |
| `distinct()` | fewer | drops duplicates (`equals`) | `.distinct()` |
| `sorted()` | same, new order | natural order, needs to see all elements first | `.sorted()` |
| `sorted(cmp)` | same, new order | with a `Comparator` | `.sorted(Comparator.comparingDouble(OrderLine::total).reversed())` |
| `limit(n)` | at most n | keeps the first n, makes an infinite stream finite | `.limit(10)` |
| `skip(n)` | fewer | drops the first n | `.skip(5)` |
| `takeWhile(p)` | prefix | keeps elements until `p` first fails, then stops (Java 9) | `.takeWhile(n -> n < 10)` |
| `dropWhile(p)` | rest | drops elements until `p` first fails, keeps the rest (Java 9) | `.dropWhile(n -> n < 10)` |
| `peek(c)` | same | runs an action on each element, **debugging only** | `.peek(System.out::println)` |
| `gather(g)` | custom | custom intermediate operation (Java 24) | `.gather(Gatherers.windowFixed(3))` |

### Gatherers (Java 24, final)

| Gatherer | What it does | Result for `1,2,3,4` |
|---|---|---|
| `windowFixed(n)` | consecutive lists of `n` (last may be shorter) | `windowFixed(3)`: `[[1,2,3],[4]]` |
| `windowSliding(n)` | overlapping windows, one step at a time | `windowSliding(2)`: `[[1,2],[2,3],[3,4]]` |
| `scan(init, f)` | running result after every element | `scan(() -> 0, Integer::sum)`: `[1,3,6,10]` |
| `fold(init, f)` | like `reduce`, emits one final element | `fold(() -> 0, Integer::sum)`: `[10]` |

## 3. Terminal operations

Exactly one, at the end. It starts the pipeline and decides how many elements are processed.

### Collect into something

| Operation | Result | Notes |
|---|---|---|
| `toList()` | unmodifiable `List` | default choice (Java 16), allows `null` |
| `collect(Collectors.toList())` | `List` | legacy, in practice an `ArrayList` but not guaranteed |
| `collect(Collectors.toUnmodifiableList())` | unmodifiable `List` | rejects `null` (`NullPointerException`) |
| `collect(Collectors.toSet())` | `Set` | duplicates disappear, no order guaranteed |
| `collect(Collectors.toUnmodifiableSet())` | unmodifiable `Set` | |
| `collect(Collectors.joining(", "))` | `String` | elements must be `String`s |
| `toArray()` | `Object[]` | |
| `collect(Collectors.toMap(k, v, merge))` | `Map` | without a merge function a duplicate key throws `IllegalStateException` |

### Reduce to one value

| Operation | Returns | Notes |
|---|---|---|
| `count()` | `long` | |
| `sum()` | number | primitive streams only |
| `average()` | `OptionalDouble` | primitive streams only |
| `min()` / `max()` | `OptionalInt` etc. | primitive streams |
| `min(cmp)` / `max(cmp)` | `Optional<T>` | `Comparator.comparingDouble(OrderLine::total)` |
| `summaryStatistics()` | count, sum, min, average, max | primitive streams, one pass |
| `reduce(identity, f)` | `T` | general fold, e.g. `reduce(0.0, Double::sum)` |
| `reduce(f)` | `Optional<T>` | no identity, so maybe empty |

### Ask a question (short-circuiting)

| Operation | Returns | Stops at | Empty stream |
|---|---|---|---|
| `anyMatch(p)` | `boolean` | first hit | `false` |
| `allMatch(p)` | `boolean` | first miss | `true` |
| `noneMatch(p)` | `boolean` | first hit | `true` |
| `findFirst()` | `Optional<T>` | first element | empty |
| `findAny()` | `Optional<T>` | any element | empty (prefer `findFirst()`) |

### Do something per element

| Operation | Notes |
|---|---|
| `forEach(c)` | side effects, returns `void`. Prefer a collector when you build a result |
| `forEachOrdered(c)` | same, keeps encounter order |

## 4. Collectors

All live in `java.util.stream.Collectors`, used with `collect(...)`.

| Collector | What it does | Example result on the course data |
|---|---|---|
| `groupingBy(key)` | `Map<key, List<T>>` | customer id to their orders |
| `groupingBy(key, counting())` | group and count | `{1=2, 2=2, 3=1}` |
| `groupingBy(key, summingDouble(f))` | group and sum | `{1=20.5, 2=13.0, 3=5.5}` |
| `groupingBy(key, mapping(f, toList()))` | group and transform | `{1=[1, 2], 2=[3, 4], 3=[5]}` |
| `partitioningBy(p)` | exactly two groups, `false` and `true` | `{false=2, true=3}` (with `counting()`) |
| `toMap(k, v, merge)` | build a `Map` | quantity per article id with `Integer::sum` |
| `counting()` | number of elements | |
| `summingInt` / `summingDouble` | sum | |
| `averagingDouble(f)` | average | |
| `summarizingDouble(f)` | count, sum, min, average, max in one pass | `count=18, sum=39.0, ...` |
| `filtering(p, downstream)` | filter inside a group (Java 9) | |
| `flatMapping(f, downstream)` | flatMap inside a group (Java 9) | |
| `teeing(c1, c2, merger)` | two collectors, one pass (Java 12) | `5 orders, 39.0` |

## 5. Optional: handling "maybe nothing"

`min`, `max`, `findFirst`, `findAny`, `average` and `reduce(f)` return an `Optional`.

| Call | Present | Empty |
|---|---|---|
| `orElse(x)` | the value | `x` (always evaluated) |
| `orElseGet(supplier)` | the value | supplier result (only evaluated when empty) |
| `orElseThrow()` | the value | `NoSuchElementException` |
| `orElseThrow(supplier)` | the value | your exception |
| `ifPresent(c)` | runs `c` | nothing |
| `map(f)` | `Optional` of mapped value | stays empty |

Avoid `orElse(null)`: it turns the explicit "maybe" back into a `null`.

## 6. Pitfalls in one line each

- **Endless stream**: `iterate`/`generate` need `limit`, `findFirst`, `takeWhile` or `anyMatch`. `distinct()` before `limit(10)` on `0 1 0 1 ...` hangs.
- **Order matters**: `limit(10).skip(5)` gives 5 numbers, `skip(5).limit(10)` gives 10.
- **N+1**: never call a database or REST service per element inside `map`/`filter`. Fetch in bulk first, then look up in a `Map`.
- **Sets and maps have no order**: sort before you compare or print.
- **`double` for money**: use `BigDecimal` in real code.

## 7. Functional interfaces

| Interface | Method | Typical use |
|---|---|---|
| `Predicate<T>` | `boolean test(T)` | `filter`, `anyMatch`, `takeWhile` |
| `Function<T,R>` | `R apply(T)` | `map`, `flatMap` |
| `Consumer<T>` | `void accept(T)` | `forEach`, `peek` |
| `Supplier<T>` | `T get()` | `generate`, `orElseGet` |
| `BinaryOperator<T>` | `T apply(T, T)` | `reduce`, merge function of `toMap` |
| `Comparator<T>` | `int compare(T, T)` | `sorted`, `min`, `max` |

## 8. Debugging a pipeline

| Tool | Use it for |
|---|---|
| `peek(System.out::println)` | quick look, but you edit the code |
| Breakpoint inside a lambda | inspect one element at a time |
| **Trace Current Stream Chain** (Debug window, More menu) | see every stage of the chain at once |
| Stack trace | ignore the `java.util.stream` frames, find the first frame in your code |

Failures surface at the terminal operation, because streams are lazy.
