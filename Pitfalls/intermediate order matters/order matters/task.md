# Pitfall: the order of operations matters

## After this lesson you can...

- Predict the output of `limit` and `skip` in either order.
- Explain that each step only sees what the previous step passes on.

This lesson is not broken, but the result surprises most people.

## What to do

1. Open `src/Main.java`. The pipeline is `IntStream.iterate(0, i -> i + 1).limit(10).skip(5)`.
2. Before you run it, guess how many numbers it prints.
3. Run `Main`.
4. Swap `limit(10)` and `skip(5)`, and run it again.

## What you should see

The first run prints `5 6 7 8 9`: only **five** numbers, although you may have expected ten. After the swap it prints
ten numbers, `5` to `14`.

## Why it works like this
Operations run in the order you write them. Each step only sees what the previous step passes on.

| Pipeline | What happens | Output |
|---|---|---|
| `limit(10).skip(5)` | take the first 10 (0..9), then drop the first 5 | `5 6 7 8 9` (5 numbers) |
| `skip(5).limit(10)` | drop the first 5, then take 10 (5..14) | `5 6 7 8 9 10 11 12 13 14` (10 numbers) |

## Key takeaways

- Reading a pipeline top to bottom tells you what each step receives. When you change the order of `filter`, `map`,
`distinct`, `limit` and `skip`, you can change the result, not only the speed.
