package com.sharevault.repository;

import com.sharevault.model.Resource;
import com.sharevault.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByOwner(User owner);
}
