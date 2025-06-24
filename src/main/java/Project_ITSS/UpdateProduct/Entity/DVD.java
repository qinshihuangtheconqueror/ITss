package Project_ITSS.UpdateProduct.Entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DVD extends Product{
    private long DVD_id;
    private String title;
    private String release_date;
    private String DVD_type;
    private String genre;
    private String studio;
    private String director;
}
