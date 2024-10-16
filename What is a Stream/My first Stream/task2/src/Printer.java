import domain.articles.Article;

import java.util.Comparator;
import java.util.Map;
import java.util.SortedSet;
import java.util.TreeSet;

public class Printer {
    public static void printReplenishment(Map<Integer, Integer> replenishment) {
        SortedSet<Article> articlesToReplenish = new TreeSet<>(Comparator.comparing(Article::name));
        for (Integer i : replenishment.keySet()) {
            articlesToReplenish.add(Database.findArticle(i));
        }
        articlesToReplenish.forEach(a -> System.out.printf("%s: %d%n", a.name(), replenishment.get(a.id())));
    }

}
