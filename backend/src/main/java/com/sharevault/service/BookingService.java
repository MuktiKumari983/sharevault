package com.sharevault.service;

import com.sharevault.exception.ShareVaultException;
import com.sharevault.model.*;
import com.sharevault.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {
    
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRequestRepository bookingRequestRepository;
    private final ConditionReportRepository conditionReportRepository;
    private final AuditLogRepository auditLogRepository;
    private final WaitingListRepository waitingListRepository;
    
    @Transactional
    public BookingRequest createBookingRequest(Long userId, Long resourceId, LocalDateTime start, LocalDateTime end, String qualificationProof) {
        log.info("Creating booking request for user {} on resource {}", userId, resourceId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ShareVaultException("User not found"));
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ShareVaultException("Resource not found"));
        
        // Check if user has exceeded maxWeeklyHoursPerUser
        Long weeklyHoursUsed = bookingRequestRepository.getWeeklyHoursUsed(user, LocalDateTime.now());
        if (weeklyHoursUsed != null && resource.getMaxWeeklyHoursPerUser() != null) {
            long requestedHours = java.time.Duration.between(start, end).toHours();
            if (weeklyHoursUsed + requestedHours > resource.getMaxWeeklyHoursPerUser()) {
                log.warn("User {} exceeded weekly limit for resource {}", userId, resourceId);
                throw new ShareVaultException("Weekly limit reached for fair usage");
            }
        }
        
        // Check for conflicting active bookings
        List<BookingRequest> conflicts = bookingRequestRepository.findConflictingBookings(resource, start, end);
        if (!conflicts.isEmpty()) {
            log.info("Conflict found, adding user {} to waiting list for resource {}", userId, resourceId);
            addToWaitingList(resource, user);
            BookingRequest waitlistedBooking = BookingRequest.builder()
                    .resource(resource)
                    .requester(user)
                    .startTime(start)
                    .endTime(end)
                    .status(BookingRequest.Status.WAITLISTED)
                    .build();
            BookingRequest saved = bookingRequestRepository.save(waitlistedBooking);
            
            auditLogRepository.save(AuditLog.builder()
                    .bookingId(saved.getId())
                    .actorEmail(user.getEmail())
                    .action("ADDED_TO_WAITLIST")
                    .reasoning("Conflicting active bookings exist")
                    .timestamp(LocalDateTime.now())
                    .build());
            
            return saved;
        }
        
        // Otherwise, set status to PENDING and write entry to AuditLog
        BookingRequest bookingRequest = BookingRequest.builder()
                .resource(resource)
                .requester(user)
                .startTime(start)
                .endTime(end)
                .status(BookingRequest.Status.PENDING)
                .build();
        BookingRequest saved = bookingRequestRepository.save(bookingRequest);
        
        auditLogRepository.save(AuditLog.builder()
                .bookingId(saved.getId())
                .actorEmail(user.getEmail())
                .action("BOOKING_REQUEST_CREATED")
                .reasoning("Booking request submitted")
                .timestamp(LocalDateTime.now())
                .build());
        
        log.info("Booking request created with id {}", saved.getId());
        return saved;
    }
    
    private void addToWaitingList(Resource resource, User user) {
        List<WaitingList> existingList = waitingListRepository.findByResourceOrderByPositionAsc(resource);
        int position = existingList.size() + 1;
        WaitingList waitingListEntry = WaitingList.builder()
                .resource(resource)
                .user(user)
                .position(position)
                .requestedAt(LocalDateTime.now())
                .build();
        waitingListRepository.save(waitingListEntry);
    }
    
    @Transactional
    public BookingRequest reviewBookingRequest(Long managerId, Long bookingId, boolean approve, String reason) {
        log.info("Reviewing booking request {} by manager {}", bookingId, managerId);
        
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ShareVaultException("Manager not found"));
        BookingRequest booking = bookingRequestRepository.findById(bookingId)
                .orElseThrow(() -> new ShareVaultException("Booking request not found"));
        
        Resource resource = booking.getResource();
        // Ensure manager owns the resource or is ADMIN
        boolean isOwner = resource.getOwner() != null && resource.getOwner().getId().equals(managerId);
        boolean isAdmin = manager.getRole() == User.Role.ROLE_ADMIN;
        
        if (!isOwner && !isAdmin) {
            throw new ShareVaultException("Unauthorized to review this booking request");
        }
        
        if (approve) {
            booking.setStatus(BookingRequest.Status.APPROVED);
            log.info("Booking request {} approved", bookingId);
        } else {
            booking.setStatus(BookingRequest.Status.REJECTED);
            booking.setRejectionReason(reason);
            log.info("Booking request {} rejected", bookingId);
        }
        
        BookingRequest saved = bookingRequestRepository.save(booking);
        
        // Record decision and reason in AuditLog
        auditLogRepository.save(AuditLog.builder()
                .bookingId(bookingId)
                .actorEmail(manager.getEmail())
                .action(approve ? "BOOKING_APPROVED" : "BOOKING_REJECTED")
                .reasoning(reason)
                .timestamp(LocalDateTime.now())
                .build());
        
        return saved;
    }
    
    @Transactional
    public ConditionReport performCheckIn(Long bookingId, Long userId, String conditionNotes, String imageUrl) {
        log.info("Performing check-in for booking {} by user {}", bookingId, userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ShareVaultException("User not found"));
        BookingRequest booking = bookingRequestRepository.findById(bookingId)
                .orElseThrow(() -> new ShareVaultException("Booking request not found"));
        
        // Update status to CHECKED_IN
        booking.setStatus(BookingRequest.Status.CHECKED_IN);
        bookingRequestRepository.save(booking);
        
        // Save ConditionReport (type: CHECK_IN)
        ConditionReport conditionReport = ConditionReport.builder()
                .booking(booking)
                .reportType(ConditionReport.ReportType.CHECK_IN)
                .imageBase64OrUrl(imageUrl)
                .physicalConditionNotes(conditionNotes)
                .reportedBy(user)
                .timestamp(LocalDateTime.now())
                .build();
        ConditionReport savedReport = conditionReportRepository.save(conditionReport);
        
        // Record in AuditLog
        auditLogRepository.save(AuditLog.builder()
                .bookingId(bookingId)
                .actorEmail(user.getEmail())
                .action("CHECKED_IN")
                .reasoning("Resource checked in")
                .timestamp(LocalDateTime.now())
                .build());
        
        log.info("Check-in completed for booking {}", bookingId);
        return savedReport;
    }
    
    @Transactional
    public ConditionReport performCheckOut(Long bookingId, Long userId, String conditionNotes, String imageUrl, boolean damageReported) {
        log.info("Performing check-out for booking {} by user {}", bookingId, userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ShareVaultException("User not found"));
        BookingRequest booking = bookingRequestRepository.findById(bookingId)
                .orElseThrow(() -> new ShareVaultException("Booking request not found"));
        
        // Update status to RETURNED
        booking.setStatus(BookingRequest.Status.RETURNED);
        bookingRequestRepository.save(booking);
        
        // Save ConditionReport (type: CHECK_OUT)
        ConditionReport conditionReport = ConditionReport.builder()
                .booking(booking)
                .reportType(ConditionReport.ReportType.CHECK_OUT)
                .imageBase64OrUrl(imageUrl)
                .physicalConditionNotes(conditionNotes)
                .reportedBy(user)
                .timestamp(LocalDateTime.now())
                .build();
        ConditionReport savedReport = conditionReportRepository.save(conditionReport);
        
        // If damageReported is true, create an urgency entry in AuditLog and alert owner
        if (damageReported) {
            log.warn("Damage reported for booking {}", bookingId);
            auditLogRepository.save(AuditLog.builder()
                    .bookingId(bookingId)
                    .actorEmail(user.getEmail())
                    .action("DAMAGE_REPORTED_URGENCY")
                    .reasoning("Damage reported during check-out - owner alert required")
                    .timestamp(LocalDateTime.now())
                    .build());
            // Alert owner (logged)
            if (booking.getResource().getOwner() != null) {
                log.error("ALERT: Damage reported on resource {} by owner {} - urgent attention required", 
                         booking.getResource().getTitle(), 
                         booking.getResource().getOwner().getEmail());
            }
        }
        
        // Record in AuditLog
        auditLogRepository.save(AuditLog.builder()
                .bookingId(bookingId)
                .actorEmail(user.getEmail())
                .action("CHECKED_OUT")
                .reasoning("Resource checked out")
                .timestamp(LocalDateTime.now())
                .build());
        
        // Process waiting list: promote next user in WaitingList to PENDING status automatically
        processWaitingList(booking.getResource());
        
        log.info("Check-out completed for booking {}", bookingId);
        return savedReport;
    }
    
    @Transactional
    public void processWaitingList(Resource resource) {
        log.info("Processing waiting list for resource {}", resource.getId());
        var nextInLine = waitingListRepository.findFirstByResourceOrderByPositionAsc(resource);
        if (nextInLine.isPresent()) {
            WaitingList waitingEntry = nextInLine.get();
            User nextUser = waitingEntry.getUser();
            
            // Promote next user to PENDING status automatically
            BookingRequest promotedBooking = BookingRequest.builder()
                    .resource(resource)
                    .requester(nextUser)
                    .status(BookingRequest.Status.PENDING)
                    .startTime(LocalDateTime.now()) // Default times, should be set by nextUser
                    .endTime(LocalDateTime.now().plusHours(1))
                    .build();
            BookingRequest saved = bookingRequestRepository.save(promotedBooking);
            
            // Remove from waiting list
            waitingListRepository.delete(waitingEntry);
            // Reorder remaining positions
            reorderWaitingListPositions(resource);
            
            auditLogRepository.save(AuditLog.builder()
                    .bookingId(saved.getId())
                    .actorEmail(nextUser.getEmail())
                    .action("PROMOTED_FROM_WAITLIST")
                    .reasoning("Promoted from waiting list due to resource availability")
                    .timestamp(LocalDateTime.now())
                    .build());
            
            log.info("User {} promoted from waiting list for resource {}", nextUser.getId(), resource.getId());
        }
    }
    
    private void reorderWaitingListPositions(Resource resource) {
        List<WaitingList> waitingList = waitingListRepository.findByResourceOrderByPositionAsc(resource);
        for (int i = 0; i < waitingList.size(); i++) {
            waitingList.get(i).setPosition(i + 1);
        }
        waitingListRepository.saveAll(waitingList);
    }
}
