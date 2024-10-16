import domain.orders.OrderLine;

public class Main {

    public static void main(String[] args) {
        System.out.printf("The sum of all the order lines prices is: €%.2f%n", getPrice());

        System.out.printf("The sum of all the order lines prices is: €%.2f%n", getPriceUsingStream());
    }

    private static Double getPrice() {
        double price = 0d;
        for (OrderLine orderLine : Database.orderLines) {
            price += orderLine.total();
        }

        return price;
    }

    private static Double getPriceUsingStream() {
        //TODO: Use a stream to calculate the sum of all the order lines prices
        return 0.0;
    }
}