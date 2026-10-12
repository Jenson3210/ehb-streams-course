# My first Stream: warehouse replenishment

## After this lesson you can...

- Turn nested `for` loops with `if` conditions and a `Map` accumulator into a stream pipeline.
- Use a stream to group values and add them up per key.

## The problem

At our warehouse we automatically ship goods to replenish the stock of the stores.

Every order that is **paid** must be replenished with the same quantity of each article.
Several orders are shipped in one delivery, so the quantities per article are added up.
Unpaid orders are ignored.

Example:
- Order 1 (paid): 2 Pizza and 1 Candy
- Order 2 (paid): 1 Pizza and 1 Beer
- Order 3 (not paid): 5 Coffee

The delivery will be 3 Pizza, 1 Candy and 1 Beer.

> This task intentionally goes beyond what you have seen so far. This is the moment to let an AI assistant
> (for example Copilot or Claude) help you.

## What to do

1. Open `src/Main.java`.
2. Implement `calculateReplenishmentUsingStream()`. It must return the same result as the existing
   loop version `calculateReplenishment()`: a `Map<Integer, Integer>` from article id to total quantity.

## What you should see

Running `Main` prints the replenishment twice, once for the loop version and once for the stream version.
Both blocks must be identical:

```
Beer: 1
Candy: 2
Coffee: 3
Donuts: 1
Ice Cream: 1
Pineapple: 1
Pizza: 2
Taco: 1
```

## Key takeaways

- A pipeline can replace nested loops: `filter` for the `if`, `flatMap` for the inner loop, a collector for the `Map`.
- A collector can group values and add them up per key.

## Hints

- Keep only the paid orders with `filter`.
- Turn every order into its order lines and flatten them into one stream:
  `flatMap(order -> order.orderLines().stream())`
- Add up the quantities per article id, with one of these collectors:
  - `Collectors.toMap(keyMapper, valueMapper, mergeFunction)`: the merge function decides what to do when the same key
    appears twice (hint: add the two quantities).
  - `Collectors.groupingBy(classifier, Collectors.summingInt(mapper))`
