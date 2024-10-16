import domain.articles.Article;
import domain.orders.Order;
import domain.orders.OrderLine;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        collectingIntoCollection();
        collectingIntoImmutableCollections();
        joiningIntoAString();
        countingItems();
        quickMath();
        comparators();
        theTerminalActionCanLimitTheIntermediateActionsExecutedWithinTheStream();
    }

    static void collectingIntoCollection() {
        List<Order> paidOrders = Database.orders.stream()
                .filter(Order::paid)
                .collect(Collectors.toList());
        paidOrders.add(Database.UNPAID_ORDER);

        Set<Article> articles = Database.orderLines.stream()
                .map(OrderLine::articleId)
                .map(Database::getArticle)
                .collect(Collectors.toSet());
        articles.add(Database.CHICKEN);

        System.out.println("Paid Orders: " + paidOrders);
        System.out.println("Articles: " + articles);
    }

    static void collectingIntoImmutableCollections() {
        List<Order> paidOrders = Database.orders.stream()
                .filter(Order::paid)
                .collect(Collectors.toUnmodifiableList());

        Set<Article> articles = Database.orderLines.stream()
                .map(OrderLine::articleId)
                .map(Database::getArticle)
                .collect(Collectors.toUnmodifiableSet());

        System.out.println("Paid Orders: " + paidOrders);
        System.out.println("Articles: " + articles);
    }

    static void joiningIntoAString() {
        String pipeSeparatedNames = Database.articles.stream()
                .map(Article::name)
                .collect(Collectors.joining("|"));

        System.out.println("customers: [" + pipeSeparatedNames + "]");
    }

    static void countingItems() {
        long cArticles = Database.articles.stream()
                .filter(article -> article.name().startsWith("C"))
                .count();

        System.out.println("count: " + cArticles);
    }

    static void quickMath() {
        List<OrderLine> orderLines = Database.orderLines;

        double totalRevenue = orderLines.stream()
                .mapToDouble(OrderLine::total)
                .sum();

        double averageSalesPrice = orderLines.stream()
                .mapToDouble(OrderLine::total)
                .average().orElse(0);

        double maxOrderLinePrice = orderLines.stream()
                .mapToDouble(OrderLine::total)
                .max().orElse(0);

        double minOrderLinePrice = orderLines.stream()
                .mapToDouble(OrderLine::total)
                .min().orElse(0);

        System.out.println("total: " + totalRevenue);
        System.out.println("average: " + averageSalesPrice);
        System.out.println("max: " + maxOrderLinePrice);
        System.out.println("min: " + minOrderLinePrice);
    }

    static void comparators() {
        List<OrderLine> orderLines = Database.orderLines;

        double totalRevenue = orderLines.stream()
                .collect(Collectors.summingDouble(OrderLine::total));

        double averageSalesPrice = orderLines.stream()
                .collect(Collectors.averagingDouble(OrderLine::total));

        OrderLine maxOrderLineByPrice = orderLines.stream()
                .max(Comparator.comparingDouble(OrderLine::total))
                .orElse(null);

        OrderLine minOrderLineByPrice = orderLines.stream()
                .min(Comparator.comparingDouble(OrderLine::total))
                .orElse(null);

        System.out.println("total: " + totalRevenue);
        System.out.println("average: " + averageSalesPrice);
        System.out.println("max: " + maxOrderLineByPrice);
        System.out.println("min: " + minOrderLineByPrice);
    }

    static void theTerminalActionCanLimitTheIntermediateActionsExecutedWithinTheStream() {
        Integer orderId = Database.orders.stream()
                .peek(order -> System.out.println("Before filtering: " + order))
                .filter(order -> !order.paid())
                .peek(order -> System.out.println("After filtering: " + order))
                .map(Order::id)
                .findFirst()
                .orElse(-1);

        System.out.println("orderId: " + orderId);
    }
}