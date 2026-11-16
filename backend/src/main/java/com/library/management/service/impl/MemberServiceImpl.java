package com.library.management.service.impl;

import com.library.management.dto.request.MemberRequestDTO;
import com.library.management.dto.response.MemberResponseDTO;
import com.library.management.exception.BusinessValidationException;
import com.library.management.exception.DuplicateResourceException;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.model.entity.BorrowTransaction;
import com.library.management.model.entity.Member;
import com.library.management.model.enums.MembershipStatus;
import com.library.management.model.enums.TransactionStatus;
import com.library.management.repository.BorrowTransactionRepository;
import com.library.management.repository.MemberRepository;
import com.library.management.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final BorrowTransactionRepository transactionRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<MemberResponseDTO> getAllMembers(String query, Pageable pageable) {
        return memberRepository.searchMembers(query, pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public MemberResponseDTO getMemberById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with ID: " + id));
        return mapToDTO(member);
    }

    @Override
    @Transactional
    public MemberResponseDTO createMember(MemberRequestDTO requestDTO) {
        if (memberRepository.existsByMembershipId(requestDTO.getMembershipId())) {
            throw new DuplicateResourceException("Member with ID '" + requestDTO.getMembershipId() + "' already exists.");
        }
        if (memberRepository.existsByEmail(requestDTO.getEmail())) {
            throw new DuplicateResourceException("Email '" + requestDTO.getEmail() + "' is already registered to another member.");
        }

        Member member = Member.builder()
                .membershipId(requestDTO.getMembershipId().trim().toUpperCase())
                .fullName(requestDTO.getFullName().trim())
                .email(requestDTO.getEmail().trim().toLowerCase())
                .phoneNumber(requestDTO.getPhoneNumber() != null ? requestDTO.getPhoneNumber().trim() : null)
                .membershipStatus(requestDTO.getMembershipStatus() != null ? requestDTO.getMembershipStatus() : MembershipStatus.ACTIVE)
                .build();

        Member saved = memberRepository.save(member);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public MemberResponseDTO updateMember(Long id, MemberRequestDTO requestDTO) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with ID: " + id));

        if (memberRepository.existsByEmailAndIdNot(requestDTO.getEmail(), id)) {
            throw new DuplicateResourceException("Email '" + requestDTO.getEmail() + "' is already registered to another member.");
        }

        member.setFullName(requestDTO.getFullName().trim());
        member.setEmail(requestDTO.getEmail().trim().toLowerCase());
        member.setPhoneNumber(requestDTO.getPhoneNumber() != null ? requestDTO.getPhoneNumber().trim() : null);
        if (requestDTO.getMembershipStatus() != null) {
            member.setMembershipStatus(requestDTO.getMembershipStatus());
        }

        Member updated = memberRepository.save(member);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with ID: " + id));

        List<BorrowTransaction> activeBorrows = transactionRepository.findByMemberIdAndStatus(id, TransactionStatus.BORROWED);
        if (!activeBorrows.isEmpty()) {
            throw new BusinessValidationException("Cannot delete member. Member currently has " + activeBorrows.size() + " active borrowed book(s).");
        }

        memberRepository.delete(member);
    }

    @Override
    @Transactional
    public MemberResponseDTO updateStatus(Long id, MembershipStatus status) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with ID: " + id));

        member.setMembershipStatus(status);
        Member updated = memberRepository.save(member);
        return mapToDTO(updated);
    }

    private MemberResponseDTO mapToDTO(Member member) {
        return MemberResponseDTO.builder()
                .id(member.getId())
                .membershipId(member.getMembershipId())
                .fullName(member.getFullName())
                .email(member.getEmail())
                .phoneNumber(member.getPhoneNumber())
                .membershipStatus(member.getMembershipStatus())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }
}

