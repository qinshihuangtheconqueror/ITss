package Project_ITSS.ViewProduct2.Repository;

import Project_ITSS.ViewProduct2.Entity.Book;
import Project_ITSS.ViewProduct2.Entity.Product;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class BookRowMapper implements RowMapper<Product> {
    @Override
    public Product mapRow(ResultSet rs, int rowNum) throws SQLException {
        Book book = new Book();
        book.setProduct_id(rs.getInt("product_id"));
        book.setTitle(rs.getString("title"));
        book.setPrice(rs.getInt("price"));
        book.setWeight(rs.getFloat("weight"));
        book.setRush_order_supported(rs.getBoolean("rush_order_supported"));
        book.setImage_url(rs.getString("image_url"));
        book.setBarcode(rs.getString("barcode"));
        book.setImport_date(rs.getString("import_date"));
        book.setIntroduction(rs.getString("introduction"));
        book.setQuantity(rs.getInt("quantity"));
        book.setType(rs.getString("type"));
        book.setBook_id(rs.getInt("book_id"));
        book.setAuthors(rs.getString("authors"));
        book.setGenre(rs.getString("genre"));
        book.setPublishers(rs.getString("publishers"));
        book.setCover_type(rs.getString("cover_type"));
        book.setPage_count(rs.getInt("page_count"));
        book.setPublication_date(rs.getString("publication_date"));
        return book;
    }
}
