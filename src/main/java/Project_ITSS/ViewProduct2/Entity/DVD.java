package Project_ITSS.ViewProduct2.Entity;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DVD extends Product{
    private int DVD_id;
    private String title;
    private String release_date;
    private String dvd_type;
    private String genre;
    private String studio;
    private String director;
}
