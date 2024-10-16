import domain.articles.Article;
import domain.orders.OrderLine;
import view.OrderLineDTO;

import java.util.Map;
import java.util.Objects;
import java.util.stream.LongStream;

public class Main {
    public static void main(String[] args) {
        serviceCallsOrDatabaseTransactionsInAForLoopCanImpactPerformance();
        serviceCallsOrDatabaseTransactionsInAStreamCanImpactPerformance();
    }

    static void serviceCallsOrDatabaseTransactionsInAForLoopCanImpactPerformance() {
        Runnable fetchArticleInForLoop = () -> {
            for (OrderLine orderLine : Database.orderLines) {
                OrderLineDTO ol = new OrderLineDTO(Database.getArticle(orderLine.articleId()), orderLine.total());
                System.out.println(ol);
            }
        };

        Runnable fetchArticleFirst = () -> {
            Map<Integer, Article> articles = Database.getArticles();
            for (OrderLine orderLine : Database.orderLines) {
                OrderLineDTO ol = new OrderLineDTO(articles.get(orderLine.articleId()), orderLine.total());
                System.out.println(ol);
            }
        };

        System.out.println("fetchArticleInForLoop: " + timeMethodExecution(fetchArticleInForLoop, 10) + " ms");
        System.out.println("fetchArticleFirst: " + timeMethodExecution(fetchArticleFirst, 10) + " ms");
    }

    static void serviceCallsOrDatabaseTransactionsInAStreamCanImpactPerformance() {
        Runnable fetchArticleInStream = () -> Database.orderLines.stream()
                .map(orderLine -> new OrderLineDTO(Database.getArticle(orderLine.articleId()), orderLine.total()))
                .map(Objects::toString)
                .forEach(System.out::println);

        Runnable fetchArticleFirst = () -> {
            Map<Integer, Article> articles = Database.getArticles();
            Database.orderLines.stream()
                    .map(orderLine -> new OrderLineDTO(articles.get(orderLine.articleId()), orderLine.total()))
                    .map(Objects::toString)
                    .forEach(System.out::println);
        };

        System.out.println("fetchArticleInStream: " + timeMethodExecution(fetchArticleInStream, 10) + " ms");
        System.out.println("fetchArticleFirst: " + timeMethodExecution(fetchArticleFirst, 10) + " ms");
    }

    public static long timeMethodExecution(Runnable runnable, int runXTimes) {
        if (runXTimes < 1) {
            throw new IllegalArgumentException("runXTimes must be greater than 0");
        }
        long start = System.currentTimeMillis();
        LongStream.range(0, runXTimes).forEach(i -> runnable.run());
        long end = System.currentTimeMillis();
        return end - start;
    }
}