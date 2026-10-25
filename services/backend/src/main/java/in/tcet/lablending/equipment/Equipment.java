package in.tcet.lablending.equipment;

import in.tcet.lablending.department.Department;
import in.tcet.lablending.room.Room;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "equipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "model_number", length = 100)
    private String modelNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Enumerated(EnumType.STRING)
    @Column(name = "tracking_mode", nullable = false, length = 30)
    @Builder.Default
    private TrackingMode trackingMode = TrackingMode.QUANTITY;

    @Column(name = "total_quantity", nullable = false)
    @Builder.Default
    private Integer totalQuantity = 1;

    @Column(name = "available_quantity", nullable = false)
    @Builder.Default
    private Integer availableQuantity = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "equipment_condition", nullable = false, length = 50)
    @Builder.Default
    private EquipmentCondition condition = EquipmentCondition.EXCELLENT;

    @Enumerated(EnumType.STRING)
    @Column(name = "maintenance_status", nullable = false, length = 50)
    @Builder.Default
    private MaintenanceStatus maintenanceStatus = MaintenanceStatus.OPERATIONAL;

    @OneToMany(mappedBy = "equipment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<EquipmentAsset> assets = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
