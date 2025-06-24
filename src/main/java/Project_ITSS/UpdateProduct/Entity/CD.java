package Project_ITSS.UpdateProduct.Entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CD extends Product{
    private long CD_id;
    private String track_list;
    private String genre;
    private String record_label;
    private String artists;
    private String release_date;
}
