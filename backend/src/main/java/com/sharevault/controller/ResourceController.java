package com.sharevault.controller;

import com.sharevault.model.Resource;
import com.sharevault.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ResourceController {
    
    private final ResourceRepository resourceRepository;
    
    @GetMapping
    public ResponseEntity<List<Resource>> searchResources(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Boolean availability) {
        
        List<Resource> resources = resourceRepository.findAll();
        
        List<Resource> filtered = resources.stream()
                .filter(r -> category == null || (r.getCategory() != null && r.getCategory().equalsIgnoreCase(category)))
                .filter(r -> location == null || (r.getLocation() != null && r.getLocation().equalsIgnoreCase(location)))
                .filter(r -> availability == null || (r.getIsAvailable() != null && r.getIsAvailable().equals(availability)))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(filtered);
    }
    
    @PostMapping
    public ResponseEntity<Resource> createResource(@RequestBody Resource resource) {
        Resource savedResource = resourceRepository.save(resource);
        return new ResponseEntity<>(savedResource, HttpStatus.CREATED);
    }
}
