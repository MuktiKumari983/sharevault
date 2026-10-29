package com.sharevault.repository;

import com.sharevault.model.BookingRequest;
import com.sharevault.model.Resource;
import com.sharevault.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRequestRepository extends JpaRepository<BookingRequest, Long> {
    List<BookingRequest> findByRequester(User requester);
    
    List<BookingRequest> findByResource(Resource resource);
    
    @Query("SELECT b FROM BookingRequest b WHERE b.resource = :resource AND b.status IN ('PENDING', 'APPROVED', 'CHECKED_IN') " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<BookingRequest> findConflictingBookings(@Param("resource") Resource resource, 
                                                @Param("startTime") LocalDateTime startTime, 
                                                @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT SUM(TIMESTAMPDIFF(HOUR, b.startTime, b.endTime)) FROM BookingRequest b WHERE b.requester = :requester " +
           "AND b.status IN ('APPROVED', 'CHECKED_IN', 'RETURNED') AND YEARWEEK(b.startTime) = YEARWEEK(:now)")
    Long getWeeklyHoursUsed(@Param("requester") User requester, @Param("now") LocalDateTime now);
}
