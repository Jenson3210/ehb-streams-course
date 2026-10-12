# My first Stream

## After this lesson you can...

- Recognise a `for` loop that sums values and rewrite it as a stream pipeline.
- Read a simple pipeline as source, steps and result.

## What to do

1. Open `src/Main.java`. There is a `Database` class that contains all the static variables to mock the demo database.
2. `getPrice()` sums the total of every order line in `Database.orderLines` with a `for` loop and `main` prints it.
3. Implement `getPriceUsingStream()` so it returns the same number using a stream.

## What you should see

Both lines print the same value:

```
The sum of all the order lines prices is: EUR39.00
The sum of all the order lines prices is: EUR39.00
```

While the stub is unsolved, the second line prints `EUR0.00`.

## Key takeaways

A stream pipeline has three parts:

| Part | What it does | In this task |
|------|--------------|--------------|
| **Source** | Where the elements come from | `Database.orderLines.stream()` |
| **Intermediate operations** | Zero or more steps that transform the stream | e.g. turn each element into something else |
| **Terminal operation** | Exactly one, produces the result and starts the pipeline | e.g. combine all elements into one value |

## Hints

`OrderLine` has a `total()` method. Look for a way to turn the stream into a stream of `double`s,
then add them up.
