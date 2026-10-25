package in.tcet.lablending.rental;

import in.tcet.lablending.equipment.Equipment;
import in.tcet.lablending.equipment.EquipmentAsset;
import in.tcet.lablending.request.RentalRequest;
import in.tcet.lablending.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "rentals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private RentalRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrower_id", nullable = false)
    private User borrower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private EquipmentAsset asset;

    @Column(name = "quantity_issued", nullable = false)
    @Builder.Default
    private Integer quantityIssued = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by", nullable = false)
    private User issuedBy;

    @CreationTimestamp
    @Column(name = "issued_at", nullable = false, updatable = false)
    private Instant issuedAt;

    @Column(name = "expected_return_at", nullable = false)
    private Instant expectedReturnAt;

    @Column(name = "actual_return_at")
    private Instant actualReturnAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private RentalStatus status = RentalStatus.ACTIVE;
}
