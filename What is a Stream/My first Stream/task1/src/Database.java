import domain.articles.Article;
import domain.orders.Order;
import domain.orders.OrderLine;

import java.util.List;

public class Database {

    static final List<Article> articles = List.of(
            new Article(1, "Coffee"),
            new Article(2, "Pizza"),
            new Article(3, "Candy"),
            new Article(4, "Pineapple"),
            new Article(5, "Donuts"),
            new Article(6, "Beer"),
            new Article(7, "Apple"),
            new Article(8, "Taco"),
            new Article(9, "Chicken"),
            new Article(10, "Ice Cream")
    );

    static final List<Order> orders = List.of(
            new Order(1, 1, true, List.of(
                    new OrderLine(1, 1, 1.5),
                    new OrderLine(2, 2, 2.0),
                    new OrderLine(3, 1, 1.2)
            )),
            new Order(2, 1, true, List.of(
                    new OrderLine(4, 1, 3.5),
                    new OrderLine(1, 1, 2.0),
                    new OrderLine(5, 1, 2.3),
                    new OrderLine(6, 1, 6.0)
            )),
            new Order(3, 2, false, List.of(
                    new OrderLine(9, 1, 3.1),
                    new OrderLine(7, 1, 1.5),
                    new OrderLine(1, 1, 2.0)
            )),
            new Order(4, 2, false, List.of(
                    new OrderLine(8, 1, 1.1),
                    new OrderLine(1, 1, 3.4),
                    new OrderLine(9, 1, 0.6),
                    new OrderLine(7, 1, 1.3)
            )),
            new Order(5, 3, true, List.of(
                    new OrderLine(10,1, 0.8),
                    new OrderLine(3,1, 1.2),
                    new OrderLine(2,1, 1.5),
                    new OrderLine(8,1, 2.0)
            ))
    );

    static final List<OrderLine> orderLines = orders.stream().map(Order::orderLines).flatMap(List::stream).toList();
}