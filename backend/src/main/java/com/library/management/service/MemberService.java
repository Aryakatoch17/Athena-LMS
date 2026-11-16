package com.library.management.service;

import com.library.management.dto.request.MemberRequestDTO;
import com.library.management.dto.response.MemberResponseDTO;
import com.library.management.model.enums.MembershipStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MemberService {
    Page<MemberResponseDTO> getAllMembers(String query, Pageable pageable);
    MemberResponseDTO getMemberById(Long id);
    MemberResponseDTO createMember(MemberRequestDTO requestDTO);
    MemberResponseDTO updateMember(Long id, MemberRequestDTO requestDTO);
    void deleteMember(Long id);
    MemberResponseDTO updateStatus(Long id, MembershipStatus status);
}

