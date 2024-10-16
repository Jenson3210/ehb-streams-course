package domain.orders;

import java.util.List;

public record Order(int id, int customerId, boolean paid, List<OrderLine> orderLines) {}
