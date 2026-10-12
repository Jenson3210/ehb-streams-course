package domain.orders;

import java.util.List;

public record Order(int id, int customerId, boolean paid, List<OrderLine> orderLines) {
    public double totalUnstreamed() {
        double price = 0d;
        for (OrderLine orderLine : orderLines) {
            price += orderLine.total();
        }
        return price;
    }

    public double total() {
        return orderLines.stream()
                .mapToDouble(OrderLine::total)
                .sum();

    }
}
