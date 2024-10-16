import domain.orders.Order;
import domain.orders.OrderLine;

import java.util.*;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        Printer.printReplenishment(calculateReplenishment());
        Printer.printReplenishment(calculateReplenishmentUsingStream());
    }

    private static Map<Integer, Integer> calculateReplenishment() {
        Map<Integer, Integer> replenishment = new HashMap<>();
        for (Order o : Database.orders) {
            if (o.paid()) {
                for (OrderLine orderLine : o.orderLines()) {
                    int articleId = orderLine.articleId();
                    int quantity = orderLine.quantity();
                    replenishment.put(articleId, replenishment.getOrDefault(articleId, 0) + quantity);
                }
            }
        }
        return replenishment;
    }

    private static Map<Integer, Integer> calculateReplenishmentUsingStream() {
        //TODO: Use a stream to calculate the replenishment
        return Collections.emptyMap();
    }
}