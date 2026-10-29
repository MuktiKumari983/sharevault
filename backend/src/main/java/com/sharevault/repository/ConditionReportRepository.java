package com.sharevault.repository;

import com.sharevault.model.ConditionReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConditionReportRepository extends JpaRepository<ConditionReport, Long> {
}
