import domain.articles.Article;
import domain.orders.Order;
import domain.orders.OrderLine;

import java.util.Collection;
import java.util.List;
import java.util.function.Function;
import java.util.stream.LongStream;

public class Main {
    public static void main(String[] args) {
        actionCanBeStatementLambda();
        actionCanBeExpressionLambda();
        actionCanBeMethodReference();
        actionCanBeMethod();
        actionsCanBeChained();
        theOrderOfChainingMatters();
    }

    static void actionCanBeStatementLambda() {
        List<Order> orders = Database.orders;

        orders.stream()
                .filter(order -> {
                    if (order.orderLines().size() > 3)
                        return true;
                    else {
                        return false;
                    }
                })
                .forEach(System.out::println);
    }

    static void actionCanBeExpressionLambda() {
        Database.orders.stream()
                .filter(order -> order.paid())
                .forEach(System.out::println);
    }

    static void actionCanBeMethodReference() {
        Database.orders.stream()
                .filter(Order::paid)
                .forEach(System.out::println);
    }

    static void actionCanBeMethod() {
        Database.orders.stream()
                .map(getFirstArticleId())
                .forEach(System.out::println);
    }

    static private Function<Order, Integer> getFirstArticleId() {
        return order -> order.orderLines().get(0).articleId();
    }

    static void actionsCanBeChained() {
        Database.orders.stream()
                .filter(Order::paid)
                .map(Order::orderLines)
                .flatMap(Collection::stream)
                .map(OrderLine::articleId)
                .map(Database::getArticle)
                .map(Article::name)
                .distinct()
                .forEach(System.out::println);
    }

    static void theOrderOfChainingMatters() {
        Runnable distinctLast = () -> Database.orders.stream()
                .filter(Order::paid)
                .map(Order::orderLines)
                .flatMap(Collection::stream)
                .map(OrderLine::articleId)
                .map(Database::getArticle)
                .map(Article::name)
                .distinct()
                .reduce((s, s2) -> "");

        Runnable distinctFirst = () -> Database.orders.stream()
                .filter(Order::paid)
                .map(Order::orderLines)
                .flatMap(Collection::stream)
                .map(OrderLine::articleId)
                .distinct()
                .map(Database::getArticle)
                .map(Article::name)
                .reduce((s, s2) -> "");

        System.out.println("distinctLast: " + timeMethodExecution(distinctLast, 10000) + " ms");
        System.out.println("distinctFirst: " + timeMethodExecution(distinctFirst, 10000) + " ms");
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