package com.sharevault.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckOutRequest {
    private Long userId;
    private String conditionNotes;
    private String imageUrl;
    private Boolean damageReported;
}
