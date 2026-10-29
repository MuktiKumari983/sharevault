package com.sharevault.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @Column(unique = true)
    private String email;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    private Double creditBalance;
    
    private String institutionName;
    
    public enum Role {
        ROLE_ADMIN, ROLE_OWNER, ROLE_REQUESTER
    }
}
