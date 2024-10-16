import domain.articles.Article;

import java.util.Collections;
import java.util.List;
import java.util.stream.IntStream;
import java.util.stream.LongStream;
import java.util.stream.Stream;

public class Main {
    public static void main(String[] args) {
        usingStreamFunctionOnAList();
        canAlsoBeAnEmptyList();
        whyDoesThisNotWork();
        streamOf();
        concatStreams();
        streamBuilder();
        wholeNumberStreamFromRange();
        wholeNumberStreamFromRangeClosed();
    }

    static void usingStreamFunctionOnAList() {
        //make a list
        List<Article> articles = Database.articles;

        //make a stream
        Stream<Article> stream = articles.stream();

        //print the stream
        stream.forEach(System.out::println);
    }

    static void canAlsoBeAnEmptyList() {
        //make a list
        List<Article> articles = Collections.emptyList();

        //make a stream
        Stream<Article> stream = articles.stream();

        //print the stream
        stream.forEach(System.out::println);
    }

    static void whyDoesThisNotWork() {
        //make a list
        List<Article> articles = getArticles();

        //make a stream
        Stream<Article> stream = articles.stream();

        //print the stream
        stream.forEach(System.out::println);
    }

    static void streamOf() {
        //make a stream
        Stream<Article> stream = Stream.of(Database.BEER, Database.COFFEE);

        //print the stream
        stream.forEach(System.out::println);
    }

    static void concatStreams() {
        //make a list
        Stream<Article> importantArticles = Stream.of(Database.BEER, Database.COFFEE);
        Stream<Article> alsoYummy = Stream.of(Database.PIZZA);

        //combine streams
        Stream<Article> stream = Stream.concat(importantArticles, alsoYummy);

        //print the stream
        stream.forEach(System.out::println);
    }

    static void streamBuilder() {
        //make a stream
        Stream<Article> stream = Stream.<Article>builder()
                .add(Database.BEER)
                .add(Database.COFFEE)
                .add(Database.PIZZA)
                .build();

        //print the stream
        stream.forEach(System.out::println);
    }

    static void wholeNumberStreamFromRange() {
        //make the stream
        IntStream intStream = IntStream.range(1, 10);
        LongStream longStream = LongStream.range(1, 10);

        //print the stream
        intStream.forEach(System.out::println);
        longStream.forEach(System.out::println);
    }

    static void wholeNumberStreamFromRangeClosed() {
        //make the stream
        IntStream intStream = IntStream.rangeClosed(1, 10);
        LongStream longStream = LongStream.rangeClosed(1, 10);

        //print the stream
        intStream.forEach(System.out::println);
        longStream.forEach(System.out::println);
    }

    //TODO null safe method receiving a list of articles and returning a stream of articles
    private static List<Article> getArticles() {
        return null;
    }
}