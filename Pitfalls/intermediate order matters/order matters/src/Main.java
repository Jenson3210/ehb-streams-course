import java.util.stream.IntStream;

public class Main {
   public static void main(String[] args) {
      IntStream.iterate(0, i -> i + 1)
              .limit(10)
              .skip(5)
              .forEach(System.out::println);
   }
}