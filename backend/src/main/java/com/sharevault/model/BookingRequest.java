package com.sharevault.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "booking_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id")
    private Resource resource;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id")
    private User requester;
    
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;
    
    @Enumerated(EnumType.STRING)
    private Status status;
    
    @Column(length = 1000)
    private String rejectionReason;
    
    private Double priorityScore;
    
    public enum Status {
        PENDING, APPROVED, REJECTED, WAITLISTED, CHECKED_IN, RETURNED, CANCELLED
    }
}
