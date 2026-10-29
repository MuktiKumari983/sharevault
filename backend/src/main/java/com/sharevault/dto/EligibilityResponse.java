package com.sharevault.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EligibilityResponse {
    private Boolean isEligible;
    private Double confidence;
    private List<String> matchedSkills;
    private String recommendation;
}
