package Project_ITSS.AddProduct.Entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo.As;
import com.fasterxml.jackson.annotation.JsonTypeInfo.Id;

@Getter
@Setter
@NoArgsConstructor
@JsonTypeInfo(use = Id.NAME, include = As.PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = Book.class, name = "book"),
    @JsonSubTypes.Type(value = CD.class, name = "cd"),
    @JsonSubTypes.Type(value = DVD.class, name = "dvd")
})
public class Product {
    private long Product_id;
    private String title;
    private int price;
    private float weight;
    private boolean rush_order_supported;
    private String image_url;
    private String barcode;
    private String import_date;
    private String introduction;
    private int quantity;
    private String type;
}
