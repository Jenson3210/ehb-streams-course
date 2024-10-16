import domain.articles.Article;
import domain.orders.Order;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class CourseTests {

  @Test
  void returnAllArticleNamesInUnpaidOrders() {
    List<Order> orders = Database.orders;
    List<Article> articles = Database.articles;

    assertThat(Task.returnAllArticleNamesInUnpaidOrders(orders, articles))
            .containsExactlyInAnyOrder(Database.CHICKEN.name(), Database.ICE_CREAM.name(), Database.COFFEE.name(), Database.TACO.name());
  }
}