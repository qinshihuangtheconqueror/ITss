package Project_ITSS.ViewProduct2.Repository;

import Project_ITSS.ViewProduct2.Entity.DVD;
import Project_ITSS.ViewProduct2.Entity.Product;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class DVDRowMapper implements RowMapper<Product> {
    @Override
    public Product mapRow(ResultSet rs, int rowNum) throws SQLException {
        DVD product = new DVD();
        product.setProduct_id(rs.getInt("product_id"));
        product.setTitle(rs.getString("title"));
        product.setPrice(rs.getInt("price"));
        product.setWeight(rs.getFloat("weight"));
        product.setRush_order_supported(rs.getBoolean("rush_order_supported"));
        product.setImage_url(rs.getString("image_url"));
        product.setBarcode(rs.getString("barcode"));
        product.setImport_date(rs.getString("import_date"));
        product.setIntroduction(rs.getString("introduction"));
        product.setQuantity(rs.getInt("quantity"));
        product.setType(rs.getString("type"));
        product.setDVD_id(rs.getInt("dvd_id"));
        product.setProduct_id(rs.getInt("product_id"));
        product.setDirector(rs.getString("director"));
        product.setStudio(rs.getString("studio"));
        product.setRelease_date(rs.getString("release_date"));
        product.setDvd_type(rs.getString("dvd_type"));
        product.setGenre(rs.getString("genre"));
        return product;
    }
}
