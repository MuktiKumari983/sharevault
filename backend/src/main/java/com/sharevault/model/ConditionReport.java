package com.sharevault.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "condition_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConditionReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private BookingRequest booking;
    
    @Enumerated(EnumType.STRING)
    private ReportType reportType;
    
    @Column(length = 10000)
    private String imageBase64OrUrl;
    
    @Column(length = 2000)
    private String physicalConditionNotes;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_id")
    private User reportedBy;
    
    private LocalDateTime timestamp;
    
    public enum ReportType {
        CHECK_IN, CHECK_OUT
    }
}
