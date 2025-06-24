package Project_ITSS.ViewProduct2.Entity;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class Book extends Product {
    private int Book_id;
    private String genre;
    private int page_count;
    private String publication_date;
    private String authors;
    private String publishers;
    private String cover_type;
}


