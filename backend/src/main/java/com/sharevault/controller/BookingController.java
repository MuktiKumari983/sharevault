package com.sharevault.controller;

import com.sharevault.dto.BookingRequestDto;
import com.sharevault.dto.CheckInRequest;
import com.sharevault.dto.CheckOutRequest;
import com.sharevault.dto.ReviewRequest;
import com.sharevault.model.BookingRequest;
import com.sharevault.model.ConditionReport;
import com.sharevault.repository.BookingRequestRepository;
import com.sharevault.repository.UserRepository;
import com.sharevault.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {
    
    private final BookingService bookingService;
    private final BookingRequestRepository bookingRequestRepository;
    private final UserRepository userRepository;
    
    @PostMapping
    public ResponseEntity<BookingRequest> createBooking(@RequestBody BookingRequestDto requestDto) {
        BookingRequest booking = bookingService.createBookingRequest(
                requestDto.getUserId(),
                requestDto.getResourceId(),
                requestDto.getStartTime(),
                requestDto.getEndTime(),
                requestDto.getQualificationProof()
        );
        return new ResponseEntity<>(booking, HttpStatus.CREATED);
    }
    
    @PostMapping("/{id}/review")
    public ResponseEntity<BookingRequest> reviewBooking(@PathVariable Long id, @RequestBody ReviewRequest reviewRequest) {
        BookingRequest booking = bookingService.reviewBookingRequest(
                reviewRequest.getManagerId(),
                id,
                reviewRequest.getApprove(),
                reviewRequest.getReason()
        );
        return ResponseEntity.ok(booking);
    }
    
    @PostMapping("/{id}/check-in")
    public ResponseEntity<ConditionReport> checkIn(@PathVariable Long id, @RequestBody CheckInRequest checkInRequest) {
        ConditionReport report = bookingService.performCheckIn(
                id,
                checkInRequest.getUserId(),
                checkInRequest.getConditionNotes(),
                checkInRequest.getImageUrl()
        );
        return ResponseEntity.ok(report);
    }
    
    @PostMapping("/{id}/check-out")
    public ResponseEntity<ConditionReport> checkOut(@PathVariable Long id, @RequestBody CheckOutRequest checkOutRequest) {
        ConditionReport report = bookingService.performCheckOut(
                id,
                checkOutRequest.getUserId(),
                checkOutRequest.getConditionNotes(),
                checkOutRequest.getImageUrl(),
                Boolean.TRUE.equals(checkOutRequest.getDamageReported())
        );
        return ResponseEntity.ok(report);
    }
    
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<BookingRequest>> getBookingHistory(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    List<BookingRequest> history = bookingRequestRepository.findByRequester(user);
                    return ResponseEntity.ok(history);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
