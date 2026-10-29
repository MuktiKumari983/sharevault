package com.sharevault.repository;

import com.sharevault.model.Resource;
import com.sharevault.model.WaitingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaitingListRepository extends JpaRepository<WaitingList, Long> {
    List<WaitingList> findByResourceOrderByPositionAsc(Resource resource);
    Optional<WaitingList> findFirstByResourceOrderByPositionAsc(Resource resource);
    void deleteByResourceAndUser(Resource resource, com.sharevault.model.User user);
}
