import domain.articles.Article;
import domain.orders.Order;
import domain.orders.OrderLine;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class Database {

    static final Article COFFEE = new Article(1, "Coffee");
    static final Article PIZZA = new Article(2, "Pizza");
    static final Article CANDY = new Article(3, "Candy");
    static final Article PINEAPPLE = new Article(4, "Pineapple");
    static final Article DONUTS = new Article(5, "Donuts");
    static final Article BEER = new Article(6, "Beer");
    static final Article APPLE = new Article(7, "Apple");
    static final Article TACO = new Article(8, "Taco");
    static final Article CHICKEN = new Article(9, "Chicken");
    static final Article ICE_CREAM = new Article(10, "Ice Cream");

    static final List<Article> articles = List.of(COFFEE, PIZZA, CANDY, PINEAPPLE, DONUTS, BEER, APPLE, TACO, CHICKEN, ICE_CREAM);

    static final Order UNPAID_ORDER = new Order(3, 2, false, List.of(
            new OrderLine(ICE_CREAM.id(), 1, 3.1),
            new OrderLine(CHICKEN.id(), 1, 1.5),
            new OrderLine(COFFEE.id(), 1, 2.0)
    ));

    static final List<Order> orders = List.of(
            new Order(1, 1, true, List.of(
                    new OrderLine(COFFEE.id(), 1, 1.5),
                    new OrderLine(PIZZA.id(), 2, 2.0),
                    new OrderLine(CANDY.id(), 1, 1.2)
            )),
            new Order(2, 1, true, List.of(
                    new OrderLine(DONUTS.id(), 1, 3.5),
                    new OrderLine(COFFEE.id(), 1, 2.0),
                    new OrderLine(APPLE.id(), 1, 2.3),
                    new OrderLine(TACO.id(), 1, 6.0)
            )),
            UNPAID_ORDER,
            new Order(4, 2, false, List.of(
                    new OrderLine(TACO.id(), 1, 1.1),
                    new OrderLine(COFFEE.id(), 1, 3.4),
                    new OrderLine(ICE_CREAM.id(), 1, 0.6),
                    new OrderLine(CHICKEN.id(), 1, 1.3)
            )),
            new Order(5, 3, true, List.of(
                    new OrderLine(APPLE.id(), 1, 0.8),
                    new OrderLine(CANDY.id(), 1, 1.2),
                    new OrderLine(COFFEE.id(), 1, 1.5),
                    new OrderLine(TACO.id(), 1, 2.0)
            ))
    );

    public static List<OrderLine> orderLines = orders.stream()
            .map(Order::orderLines)
            .flatMap(List::stream)
            .toList();

    public static Article getArticle(int id) {
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return articles.stream()
                .filter(article -> article.id() == id)
                .findFirst()
                .orElseThrow();
    }

    public static Map<Integer, Article> getArticles() {
        try {
            Thread.sleep(300);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return articles.stream().collect(Collectors.toMap(Article::id, article -> article));
    }
}