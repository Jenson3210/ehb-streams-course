import java.util.Collections;
import java.util.concurrent.*;
import java.util.stream.IntStream;

public class Main {
   public static void main(String[] args) {
      endlessStreamsPt1();
      endlessStreamsPt2();
   }

   static void endlessStreamsPt1() {
      ExecutorService executor = Executors.newSingleThreadExecutor();
      Callable<Void> callable = () -> {
         IntStream.iterate(0, i -> (i + 1) % 2)
                 .forEach(System.out::println);
         return null;
      };

      boolean timedOut = false;
      try {
         executor.invokeAny(Collections.singleton(callable), 10, java.util.concurrent.TimeUnit.SECONDS);
      } catch (ExecutionException | InterruptedException e) {
         throw new RuntimeException(e);
      } catch (TimeoutException e) {
         timedOut = true;
      }

      if (!timedOut) {
         throw new RuntimeException("This should not happen");
      }
   }

   static void endlessStreamsPt2() {
      ExecutorService executor = Executors.newSingleThreadExecutor();
      Callable<Void> callable = () -> {
         IntStream.iterate(0, i -> (i + 1) % 2)
                 .distinct()
                 .limit(10)
                 .forEach(System.out::println);
         return null;
      };

      boolean timedOut = false;
      try {
         executor.invokeAny(Collections.singleton(callable), 10, java.util.concurrent.TimeUnit.SECONDS);
      } catch (ExecutionException | InterruptedException e) {
         throw new RuntimeException(e);
      } catch (TimeoutException e) {
         timedOut = true;
      }

      if (!timedOut) {
         throw new RuntimeException("This should not happen");
      }
   }
}