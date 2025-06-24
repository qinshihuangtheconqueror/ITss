package Project_ITSS.ViewProduct2.Repository;

import Project_ITSS.ViewProduct2.Entity.CD;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;


public class CDRowMapper implements RowMapper<CD>{

    @Override
    public CD mapRow(ResultSet rs, int rowNum) throws SQLException {
        CD cd = new CD();
        cd.setProduct_id(rs.getInt("product_id"));
        cd.setTitle(rs.getString("title"));
        cd.setPrice(rs.getInt("price"));
        cd.setWeight(rs.getFloat("weight"));
        cd.setRush_order_supported(rs.getBoolean("rush_order_supported"));
        cd.setImage_url(rs.getString("image_url"));
        cd.setBarcode(rs.getString("barcode"));
        cd.setImport_date(rs.getString("import_date"));
        cd.setIntroduction(rs.getString("introduction"));
        cd.setQuantity(rs.getInt("quantity"));
        cd.setType(rs.getString("type"));
        cd.setCD_id(rs.getInt("cd_id"));
        cd.setProduct_id(rs.getInt("product_id"));
        cd.setGenre(rs.getString("genre"));
        cd.setArtists(rs.getString("artists"));
        cd.setTrack_list(rs.getString("track_list"));
        cd.setRelease_date(rs.getString("release_date"));
        cd.setRecord_label(rs.getString("record_label"));
        return cd;
    }
}
