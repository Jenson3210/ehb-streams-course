import domain.articles.Article;
import domain.customer.Customer;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

public class CourseTests {

  private static final List<Customer> customers = List.of(
          //Replace the constants with the actual objects
          new Customer(1, "John", "Doe"),
          new Customer(2, "Jane", "Doe"),
          new Customer(3, "Jente", "Sondervorst"),
          new Customer(4, "Jef", "Colruyt"),
          new Customer(101, "Wilfred", "Barnett"),
          new Customer(102, "Hugo", "Schneider"),
          new Customer(103, "Jazmine", "Burch"),
          new Customer(104, "Danny", "Snow"),
          new Customer(105, "Diane", "Hewitt"),
          new Customer(106, "Daniella", "Woodward"),
          new Customer(107, "Autumn", "Bowman"),
          new Customer(108, "Tori", "Golden"),
          new Customer(109, "Dawson", "Sherman"),
          new Customer(110, "Solomon", "Calhoun"),
          new Customer(111, "Zaynah", "Melendez"),
          new Customer(112, "Danyal", "Ibarra"),
          new Customer(113, "Roosevelt", "Wall"),
          new Customer(114, "Lexie", "Oneill"),
          new Customer(115, "Kenny", "Snow"),
          new Customer(116, "Loui", "Lindsey"),
          new Customer(117, "Chaya", "Curtis"),
          new Customer(118, "Sumayyah", "Garrett"),
          new Customer(119, "Ricardo", "Mcconnell"),
          new Customer(120, "Maliha", "Wheeler"),
          new Customer(121, "Carla", "Blackburn"),
          new Customer(122, "Charis", "Rios"),
          new Customer(123, "Roman", "Chavez"),
          new Customer(124, "Yousuf", "Shelton"),
          new Customer(125, "Trystan", "Bonilla"),
          new Customer(126, "Colin", "Fowler"),
          new Customer(127, "Owen", "Black"),
          new Customer(128, "Elinor", "O'Quinn"),
          new Customer(129, "Bronte", "Holloway"),
          new Customer(130, "Kaleb", "Walker")
  );

  private static final Article COFFEE = new Article(1, "Coffee");
  private static final Article PIZZA = new Article(2, "Pizza");
  private static final Article CANDY = new Article(3, "Candy");
  private static final Article PINEAPPLE = new Article(4, "Pineapple");
  private static final Article DONUTS = new Article(5, "Donuts");
  private static final Article BEER = new Article(6, "Beer");
  private static final Article APPLE = new Article(7, "Apple");
  private static final Article TACO = new Article(8, "Taco");
  private static final Article CHICKEN = new Article(9, "Chicken");
  private static final Article ICE_CREAM = new Article(10, "Ice Cream");

  private static final List<Article> articles = List.of(COFFEE, PIZZA, CANDY, PINEAPPLE, DONUTS, BEER, APPLE, TACO, CHICKEN, ICE_CREAM);

  @Test
  public void testSolution() {
    List<String> result = Stream.concat(customers.stream().map(customer -> "%s %s".formatted(customer.name(), customer.lastName())), articles.stream().map(Article::name)).toList();
    assertThat(Task.returnAllCustomerNamesAndArticlesNames(customers, articles)).containsExactlyInAnyOrderElementsOf(result);
  }
}