# Stream initialization

## After this lesson you can...

- Create a stream from a collection, from values, from other streams and from number ranges.
- Choose between `range` and `rangeClosed`.
- Handle an empty source, and recognise what goes wrong with a `null` one.

## What to do

1. Open `src/Main.java`.
2. Run it and read each demo method in the order `main` calls it.
3. One demo fails on purpose: we will find out why together.

## What you should see

One labelled block of output per way to create a stream:

- `collection.stream()` (also for an empty list)
- `Stream.of(…)`
- `Stream.concat(…)`
- `Stream.builder()`
- `IntStream.range/rangeClosed(…)`
- `LongStream.range/rangeClosed(…)`

## Also good to know (not in `Main`)

- `Stream.empty()`: a stream without elements
- `Arrays.stream(array)`: a stream from an array
- `Stream.generate(supplier)` and `Stream.iterate(seed, next)` are **infinite**: always combine them with `limit`
- `Stream.iterate(seed, hasNext, next)`: the finite, `for`-like variant
- `"text".chars()`: an `IntStream` of the characters
- `map.entrySet().stream()`: a stream over a `Map`
- `Files.lines(path)`: a stream of the lines of a file

## Key takeaways

- A stream always starts from a source: a collection, values, other streams or a number range.
- `range` excludes the end value, `rangeClosed` includes it.
- `generate` and `iterate` are infinite: always combine them with `limit`.
