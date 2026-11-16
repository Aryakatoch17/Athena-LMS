package com.library.management.dto.response;

import com.library.management.model.enums.MembershipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponseDTO {
    private Long id;
    private String membershipId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private MembershipStatus membershipStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

