package org.example.repository;

import org.example.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    
    @Query("SELECT a FROM Article a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.tags) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Article> searchArticles(String query);
}
