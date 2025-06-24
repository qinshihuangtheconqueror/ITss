package Project_ITSS.AddProduct.Repository;


import Project_ITSS.AddProduct.Entity.DVD;
import Project_ITSS.AddProduct.Entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public class DVDRepository_AddProduct implements DetailProductRepository_AddProduct{
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void insertProductInfo(Product product){
        DVD dvd = (DVD)product;
        String importDateStr = dvd.getReleaseDate(); // ví dụ "2023-05-30"
        LocalDate localDate = LocalDate.parse(importDateStr);
        java.sql.Date sqlDate = java.sql.Date.valueOf(localDate);
        System.out.println(sqlDate);
        jdbcTemplate.update("INSERT INTO DVD " +
                "(Product_id, title, release_Date, DVD_type, genre, studio, director) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)" ,
                dvd.getProduct_id(),
                dvd.getTitle(),
                sqlDate,
                dvd.getDVD_type(),
                dvd.getGenre(),
                dvd.getStudio(),
                dvd.getDirectors());
    }

    @Override
    public String getType() {
        return "dvd";
    }

}
