# Terminal operations

## After this lesson you can...

- Finish a pipeline by collecting into a list, a set or a `String`.
- Calculate totals, averages, minimum and maximum, with primitive streams or with `Collectors` and `Comparator`.
- Explain that nothing runs until a terminal operation is called, and that it decides how many elements are processed.

## What to do

1. Open `src/Main.java`.
2. Run it and read the demo methods in the order `main` calls them (the names are in the table below).
3. Read the reference sections after the table. They are for later: nothing in them has to be run.

## What you should see

One block of output per demo method. The sets are sorted before they are printed, see below the table.

## The operations in `Main.java`

| Operation | What it does | Demo |
|---|---|---|
| `collect(Collectors.toList())` | Collects the elements into a `List` | `collectingIntoCollection` |
| `collect(Collectors.toSet())` | Collects into a `Set`, duplicates disappear, no order guaranteed | `collectingIntoCollection` |
| `collect(Collectors.toUnmodifiableList())` / `toUnmodifiableSet()` | Collects into a collection that cannot be changed afterwards | `collectingIntoImmutableCollections` |
| `collect(Collectors.joining("\|"))` | Glues the elements (must be `String`s) into one `String` | `joiningIntoAString` |
| `count()` | Number of elements left in the stream | `countingItems` |
| `mapToDouble(...).sum()` / `average()` / `max()` / `min()` | Totals on a primitive stream; `average`, `max` and `min` return an optional, hence `orElse(0)` | `quickMath` |
| `collect(Collectors.summingDouble(...))` / `averagingDouble(...)` | The same totals, but as a `Collector` | `collectorsAndComparators` |
| `max(Comparator...)` / `min(Comparator...)` | Largest or smallest element according to a `Comparator`, e.g. `Comparator.comparingDouble` | `collectorsAndComparators` |
| `findFirst()` | First element, and stops the stream there | `theTerminalActionCanLimitTheIntermediateActionsExecutedWithinTheStream` |

The sets are sorted before they are printed. A `Set` has no guaranteed order (and `toUnmodifiableSet()` may differ from run to run),
so sorting is what makes the output identical for everyone.

## Three ways to get a `List`

IntelliJ suggests replacing `collect(Collectors.toList())` with `.toList()` (Java 16+). Accepting it is fine, but it is not the same:

| Call | Result list | `null` elements | Typical use |
|---|---|---|---|
| `collect(Collectors.toList())` | mutable in practice (an `ArrayList`), but the spec does not guarantee it | allowed | legacy code |
| `.toList()` (Java 16+) | unmodifiable: `add` throws `UnsupportedOperationException` | allowed | default choice |
| `collect(Collectors.toUnmodifiableList())` | unmodifiable | **rejected**: `NullPointerException` | when `null` must be impossible |

So code that calls `add` on the result of `collect(Collectors.toList())` (as `collectingIntoCollection` does) breaks when you accept the suggestion.

> **Money as `double`:** the demos use `double` for prices because it keeps the code short. In real code use `BigDecimal`
> (`double` cannot represent amounts such as `0.1` exactly, so totals can show rounding errors).

## Collectors cheat sheet

`collect` can do much more than build a list. Results below were produced by running each snippet on the course data
(`Database.orders` has 5 orders, `Database.orderLines` the 18 lines of those orders).

| Collector | What it does | Example on the course data | Result |
|---|---|---|---|
| `groupingBy(key)` | Groups the elements into a `Map<key, List<...>>` | `orders.stream().collect(groupingBy(Order::customerId))` | customer id to the list of their orders |
| `groupingBy(key, counting())` | Groups and counts each group (downstream collector) | `orders.stream().collect(groupingBy(Order::customerId, counting()))` | `{1=2, 2=2, 3=1}` |
| `groupingBy(key, summingDouble(...))` | Groups and sums a value per group | `orders.stream().collect(groupingBy(Order::customerId, summingDouble(Order::total)))` | `{1=20.5, 2=13.0, 3=5.5}` |
| `groupingBy(key, mapping(f, toList()))` | Groups and transforms each element before collecting it | `orders.stream().collect(groupingBy(Order::customerId, mapping(Order::id, toList())))` | `{1=[1, 2], 2=[3, 4], 3=[5]}` |
| `partitioningBy(predicate)` | Splits into exactly two groups, `false` and `true` (a downstream collector is allowed) | `orders.stream().collect(partitioningBy(Order::paid, counting()))` | `{false=2, true=3}` |
| `toMap(key, value, merge)` | Builds a `Map`; the merge function combines values that share a key | `orderLines.stream().collect(toMap(OrderLine::articleId, OrderLine::quantity, Integer::sum))` | total quantity per article id: `{1=5, 2=2, 3=2, 5=1, 7=2, 8=3, 9=2, 10=2}` |
| `summarizingDouble(...)` | Count, sum, min, average and max in one pass (`mapToDouble(...).summaryStatistics()` gives the same) | `orderLines.stream().collect(summarizingDouble(OrderLine::total))` | `count=18, sum=39.0, min=0.6, average=2.1666..., max=6.0` |
| `teeing(c1, c2, merger)` | Runs two collectors over the same stream in one pass and combines their results | `orders.stream().collect(teeing(counting(), summingDouble(Order::total), (count, sum) -> count + " orders, " + sum))` | `5 orders, 39.0` |

All collectors above live in `java.util.stream.Collectors`; the examples use static imports. A `Map` has no guaranteed order either,
so sort (or use a `TreeMap`) before you compare printed output.

Without a merge function, `toMap` throws `IllegalStateException` on a duplicate key. On the lines above that happens
for article 1: `Duplicate key 1 (attempted merging values 1 and 1)`.

## Beyond what we run

`Main.java` does not demo these, but you will meet them in the exercises and in real code. They are listed here for reference,
nothing to run. Results were produced by running each snippet on the course data of this lesson.

| Operation | What it does | Example on the course data | Result |
|---|---|---|---|
| `sorted()` | Sorts by natural order (the element must be `Comparable`) | `articles.stream().map(Article::name).sorted().toList()` | `[Apple, Beer, Candy, Chicken, Coffee, Donuts, Ice Cream, Pineapple, Pizza, Taco]` |
| `sorted(Comparator)` | Sorts with a `Comparator`; chain with `thenComparing`, flip with `reversed()` | see "Sorting" below | |
| `anyMatch(p)` | Is there at least one element that matches? | `orders.stream().anyMatch(o -> !o.paid())` | `true` |
| `allMatch(p)` | Do all elements match? | `orders.stream().allMatch(Order::paid)` | `false` |
| `noneMatch(p)` | Does no element match? | `orderLines.stream().noneMatch(l -> l.quantity() > 2)` | `true` |
| `findAny()` | Any element, as an `Optional` | `orders.stream().filter(Order::paid).findAny().map(Order::id)` | `Optional[1]` |
| `reduce(identity, accumulator)` | Folds all elements into one value | `orderLines.stream().map(OrderLine::total).reduce(0.0, Double::sum)` | `39.0` |
| `reduce(accumulator)` | Same without identity, so the result is an `Optional` | `orderLines.stream().map(OrderLine::total).reduce(Double::max)` | `Optional[6.0]` |

### Sorting

```java
// natural order on a property, reversed
articles.stream().map(Article::name).sorted(Comparator.reverseOrder()).toList();
// [Taco, Pizza, Pineapple, Ice Cream, Donuts, Coffee, Chicken, Candy, Beer, Apple]

// most expensive line first, ties broken by article id
orderLines.stream()
        .sorted(Comparator.comparingDouble(OrderLine::total).reversed().thenComparing(OrderLine::articleId))
        .limit(4).toList();
// articleId 8 (6.0), articleId 2 (2 x 2.0 = 4.0), articleId 5 (3.5), articleId 1 (3.4)

// shortest name first, then alphabetical
articles.stream().sorted(Comparator.comparing((Article a) -> a.name().length()).thenComparing(Article::name))
        .map(Article::name).toList();
// [Beer, Taco, Apple, Candy, Pizza, Coffee, Donuts, Chicken, Ice Cream, Pineapple]
```

Two things to remember: `reversed()` flips the whole comparator built so far, so put it where you want it (in the second example the
`thenComparing` after it is not reversed). And when the lambda in `Comparator.comparing` needs a type, as in the third example, write it
on the parameter (`(Article a) -> ...`); `Comparator.comparing(a -> a.name().length()).thenComparing(...)` does not compile.

### Match operations are boolean questions

`anyMatch`, `allMatch` and `noneMatch` return a plain `boolean` (no `Optional`) and short-circuit: `anyMatch` stops at the first hit,
`allMatch` and `noneMatch` stop at the first miss. On an empty stream they give `false`, `true` and `true`: "all of nothing" is vacuously true,
so combine `allMatch` with a check that the stream is not empty when that matters.

`findAny()` is `findFirst()` without the promise to return the first element. On a sequential stream like ours you will usually get the
first one anyway; it only pays off on parallel streams, which this course does not use. Prefer `findFirst()`.

### `reduce`

`reduce` is the general form of `sum`, `max` and `count`: start from an **identity**, then apply the **accumulator** to the running result
and the next element.

```java
double total = orderLines.stream().map(OrderLine::total).reduce(0.0, Double::sum);   // 39.0
```

The identity must be neutral for the accumulator (`0.0` for a sum), because it is also what you get for an empty stream. The accumulator
must be associative and free of side effects. In practice `mapToDouble(OrderLine::total).sum()` (also `39.0`, see `quickMath`) is
usually better: it is shorter, says what you mean, and works on primitives without boxing every `double`. Use `reduce` when no
ready-made operation exists.

### Handling an `Optional`

`min`, `max`, `findFirst`, `findAny`, `average` and `reduce(accumulator)` return an `Optional` because the stream may be empty.
It forces you to decide what "nothing" means. Examples on an order lookup that finds nothing (`customerId == 99`):

| Call | Present value | Empty |
|---|---|---|
| `orElse(-1)` | the value | `-1` (the argument is always evaluated) |
| `orElseGet(() -> -1)` | the value | `-1` (the supplier only runs when empty, use it when the fallback is expensive) |
| `orElseThrow(() -> new IllegalStateException("no order for customer 99"))` | the value | throws that exception |
| `orElseThrow()` | the value | throws `NoSuchElementException: No value present` |
| `ifPresent(consumer)` | runs the consumer | does nothing |
| `map(f)` | `Optional` of the mapped value | stays empty |

```java
orderLines.stream().max(Comparator.comparingDouble(OrderLine::total))
        .map(OrderLine::articleId).map(Database::getArticle).map(Article::name);   // Optional[Taco]
```

`Main.java` ends `max`, `min` and `findFirst` with `.orElse(null)` and `.orElse(-1)`. On the course data that fallback never fires: the list has
18 lines, so `max` and `min` always find one, and `findFirst` finds the unpaid order 3. The fallbacks only keep the demo short and
the code compiling. In real code `orElse(null)` is a smell: it turns the explicit "maybe" of the `Optional` back into a `null` that the
next reader may forget to check (a filter that matches nothing, such as `quantity() > 5`, would silently give `null`).
Choose on purpose instead: a meaningful default (`orElse(0)`), `orElseThrow` when absence is a bug, or `ifPresent` / `map` to
keep working inside the `Optional`.

## What is new since Java 8

The course code is written in the Java 8 style on purpose (that is what IntelliJ's suggestions start from), but the baseline is Java 25.
These are the stream features added since, for reference, nothing to run. Results were produced by running each snippet on JDK 25 with
this lesson's data; `names` is the sorted list of the 10 article names
(`articles.stream().map(Article::name).sorted().toList()`). None of these needs a preview flag on JDK 25.

| Feature | Since | What it does | Example | Result |
|---|---|---|---|---|
| `Stream.toList()` | 16 | Terminal shortcut for a list. It is what IntelliJ suggests instead of `collect(Collectors.toList())`; see "Three ways to get a `List`" above for the differences (unmodifiable, `null` allowed) | `Stream.of("a", null, "b").toList()` | `[a, null, b]`; `add` throws `UnsupportedOperationException` |
| `Stream.ofNullable(x)` | 9 | One element, or an empty stream when `x` is `null`; no `if` needed | `Stream.ofNullable(maybeNull).toList()` | `[]` for `null`, `[x]` for `"x"` |
| `iterate(seed, hasNext, next)` | 9 | A finite, `for`-like stream; the three-argument form ends by itself (compare the endless `iterate(seed, next)` in Pitfalls) | `Stream.iterate(1, n -> n <= 16, n -> n * 2).toList()` | `[1, 2, 4, 8, 16]` |
| `takeWhile(p)` / `dropWhile(p)` | 9 | Keep or skip the prefix of the stream while `p` holds, then stop checking (most useful on ordered data) | `names.stream().takeWhile(n -> n.compareTo("D") < 0)` | `[Apple, Beer, Candy, Chicken, Coffee]` |
| | | | `names.stream().dropWhile(n -> n.compareTo("D") < 0)` | `[Donuts, Ice Cream, Pineapple, Pizza, Taco]` |
| `Collectors.teeing` | 12 | Two collectors over one pass; already in the Collectors cheat sheet above | `orders.stream().collect(teeing(filtering(Order::paid, counting()), filtering(o -> !o.paid(), counting()), (paid, unpaid) -> paid + " paid / " + unpaid + " unpaid"))` | `3 paid / 2 unpaid` |
| `mapMulti` | 16 | Each element sends zero, one or many elements downstream, without building a temporary stream as `flatMap` does | `Stream.of(1, 2, 3).<Integer>mapMulti((n, sink) -> { if (n % 2 == 1) { sink.accept(n); sink.accept(n * 10); } })` | `[1, 10, 3, 30]` |
| Unnamed lambda parameter `_` | 22 | Name for a parameter you do not use | `Stream.of(1, 2).map(_ -> "x").toList()` | `[x, x]` |
| Gatherers | 24 | Custom *intermediate* operations, see below | `names.stream().gather(Gatherers.windowFixed(3))` | see below |

`takeWhile` and `dropWhile` are not the same as `filter`: they stop looking at the first element that fails. With `filter` every element is tested.
Use them only when the order of the stream means something (sorted data, a log in time order).

`mapMulti` is mostly a performance tool for small fan-outs; `flatMap` stays the readable default.
The `<Integer>` before `mapMulti` is a type witness: the compiler cannot infer the element type from the lambda.

The unnamed variable `_` is final since Java 22. It works in lambdas, `catch` blocks and pattern matching; here it replaces a parameter
you must declare but never read. IntelliJ does not suggest it, you choose it.

### Gatherers (Java 24)

> **Modern:** `Stream.gather(...)` takes a `Gatherer` from `java.util.stream.Gatherers`. A collector can only end a pipeline;
> a gatherer is an **intermediate** operation, so the stream goes on after it. Gatherers were a preview feature in Java 22 and 23
> and are final since Java 24, so on JDK 25 they need no `--enable-preview`. They are the way to write operations that
> look at more than one element at a time, such as windows or running totals.

| Gatherer | What it does | Example on the course data | Result |
|---|---|---|---|
| `windowFixed(n)` | Groups the elements in consecutive lists of `n`; the last list may be shorter | `names.stream().gather(Gatherers.windowFixed(3)).toList()` | `[[Apple, Beer, Candy], [Chicken, Coffee, Donuts], [Ice Cream, Pineapple, Pizza], [Taco]]` |
| `windowSliding(n)` | Overlapping windows of `n`, moving one element at a time | `names.stream().limit(4).gather(Gatherers.windowSliding(2)).toList()` | `[[Apple, Beer], [Beer, Candy], [Candy, Chicken]]` |
| `scan(initial, f)` | Running result: emits the accumulated value after every element | `Stream.of(1, 2, 3, 4).gather(Gatherers.scan(() -> 0, Integer::sum)).toList()` | `[1, 3, 6, 10]` |
| `fold(initial, f)` | Like `reduce`, but as a gatherer: emits one element, the final result | `Stream.of(1, 2, 3, 4).gather(Gatherers.fold(() -> 0, Integer::sum)).toList()` | `[10]` |

`scan` on the order totals gives the running revenue: `orders.stream().map(Order::total).gather(Gatherers.scan(() -> 0.0, Double::sum)).toList()`
is `[6.7, 20.5, 27.1, 33.5, 39.0]`, and the last value is the `39.0` that `sum()` returns. You can also write your own gatherer
with `Gatherer.of(...)` or `Gatherer.ofSequential(...)`, but the built-in ones cover most needs.

## Key takeaways

- A terminal operation starts the pipeline; without one nothing runs.
- Prefer `.toList()` unless you really need a mutable list or want `null` to be rejected.
- Never rely on the order of a `Set` when printing or comparing output: sort first.
- `findFirst()` (and other short-circuiting operations) can stop the pipeline before all elements are processed.
- `groupingBy` makes a `Map<key, List>`; add a downstream collector (`counting`, `summingDouble`, `mapping`) to count, sum or transform each group instead.
- `partitioningBy` always has exactly two keys: `true` and `false`.
- `toMap` fails on duplicate keys unless you pass a merge function.
- `anyMatch` / `allMatch` / `noneMatch` answer yes/no questions; `reduce` is the general fold, but `sum()` is usually better.
- An `Optional` says "maybe nothing": choose a default, throw, or keep mapping; `orElse(null)` hides the problem again.
- Since Java 8 streams gained `toList()`, `ofNullable`, finite `iterate`, `takeWhile`/`dropWhile`, `teeing`, `mapMulti` and the unnamed parameter `_`; the course code stays old-style on purpose so IntelliJ's suggestions kick in.
- Gatherers (final in Java 24) are custom intermediate operations: windows, running totals (`scan`) and folds that collectors cannot express.
