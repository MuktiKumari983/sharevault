package com.sharevault.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    
    private String category;
    
    @Column(length = 1000)
    private String description;
    
    private String location;
    
    private Double hourlyRate;
    
    private Boolean isAvailable;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;
    
    private String mandatoryQualification;
    
    private Integer maxWeeklyHoursPerUser;
}
