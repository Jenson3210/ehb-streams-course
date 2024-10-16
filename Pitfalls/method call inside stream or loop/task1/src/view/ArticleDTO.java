package view;

import domain.articles.Article;

public record ArticleDTO(String name) {
    ArticleDTO(Article article) {
        this(article.name());
    }

    @Override
    public String toString() {
        return name;
    }
}
