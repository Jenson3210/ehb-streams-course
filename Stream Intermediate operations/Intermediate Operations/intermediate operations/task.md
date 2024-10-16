- filter
- map
- flatMap
- skip
- takeWhile
- limit
- mapToInt --> IntStream
- mapToDouble --> DoubleStream
- mapToLong --> LongStream

> `**peek**`: The `peek` method is useful for debugging. It allows you to perform a stream operation without changing the stream itself. For example, you can use `peek` to print out each element as it is processed by a stream.
> HOWEVER, `peek` is an intermediate operation, so it does not trigger the processing of the stream. In other words, if you have a stream pipeline that consists of only intermediate operations, nothing will happen until you have a terminal operation.
> `peek` should ONLY BE USED FOR DEBUGGING PURPOSES. It is not intended to be used in production code.