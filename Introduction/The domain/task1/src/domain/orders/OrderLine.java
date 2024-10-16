package domain.orders;

public record OrderLine(int articleId, int quantity, double price) {}
