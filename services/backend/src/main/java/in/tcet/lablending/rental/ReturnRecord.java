package in.tcet.lablending.rental;

import in.tcet.lablending.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "returns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_id", nullable = false)
    private Rental rental;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by", nullable = false)
    private User recordedBy;

    @CreationTimestamp
    @Column(name = "returned_at", nullable = false, updatable = false)
    private Instant returnedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "return_condition", nullable = false, length = 50)
    @Builder.Default
    private ReturnCondition returnCondition = ReturnCondition.WORKING;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
