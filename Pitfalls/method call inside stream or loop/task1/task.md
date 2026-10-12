# Pitfall: calling a service inside a loop or stream

## After this lesson you can...

- Recognise the N+1 problem when a slow call hides in a lambda.
- Fetch data in bulk once, then work in memory inside the stream.

**This code is slow on purpose.** Do not fix it, measure it.

## What to do

1. Open `src/Main.java`.
2. Run `Main` and be patient: it takes about 40 seconds and prints 700+ lines.
3. Compare the four timings at the end.

## What you should see

Four timings (each variant runs the same work 10 times). Measured on JDK 25, Apple silicon:

    fetchArticleInForLoop:  ~18 700 ms     fetchArticleFirst: ~3 050 ms
    fetchArticleInStream:   ~18 700 ms     fetchArticleFirst: ~3 050 ms

(The absolute numbers vary per machine, the ratio (about 6x) does not.)

## Why
`Database.getArticle(id)` pretends to be a remote call (100 ms). There are 18 order lines, so the "call per line"
variants make 18 calls per run. The other variants make **one** bulk call (300 ms) and look articles up in a `Map`.
This is the *N+1 problem*: one call to get the lines, plus N calls to get the details.

## The loop is not the problem, the call is
A `for` loop and a stream behave the same here: both are sequential and make the same 18 calls per run, so they take
the same time. A stream can make the problem harder to *notice*, because the call hides inside a lambda such as
`.map(line -> new OrderLineDTO(Database.getArticle(line.articleId()), ...))`.

## How to fix it
Fetch what you need **once**, before the loop or stream, then do pure in-memory work inside it:

    Map<Integer, Article> articles = Database.getArticles();
    ... .map(line -> new OrderLineDTO(articles.get(line.articleId()), line.total()))

## Key takeaways

- Never call a database, REST service or any slow method per element inside `map`, `filter` or a loop body if you can fetch in bulk first.
