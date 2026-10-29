package com.sharevault.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:3000")
public class AiAssistantController {

    @PostMapping("/verify-eligibility")
    public ResponseEntity<Map<String, Object>> verifyEligibility(@RequestBody Map<String, String> request) {
        String userQualification = request.getOrDefault("userQualification", "");
        String resourceRequirement = request.getOrDefault("resourceRequirement", "");
        
        // Heuristic check for eligibility simulation
        boolean isEligible = userQualification.toLowerCase().contains("certified") || 
                             userQualification.toLowerCase().contains("trained") ||
                             userQualification.toLowerCase().contains("b.tech") ||
                             userQualification.toLowerCase().contains("cse");
                             
        Map<String, Object> response = Map.of(
            "isEligible", isEligible,
            "confidence", 0.95,
            "matchedSkills", List.of("Lab Safety", "Technical Competency"),
            "recommendation", isEligible ? "Approved by AI verification engine." : "Additional safety training required before access."
        );
        
        return ResponseEntity.ok(response);
    }
}