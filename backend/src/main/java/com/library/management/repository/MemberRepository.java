package com.library.management.repository;

import com.library.management.model.entity.Member;
import com.library.management.model.enums.MembershipStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByMembershipId(String membershipId);

    Optional<Member> findByEmail(String email);

    boolean existsByMembershipId(String membershipId);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    long countByMembershipStatus(MembershipStatus status);

    @Query("SELECT m FROM Member m WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(m.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.membershipId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.phoneNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Member> searchMembers(@Param("query") String query, Pageable pageable);
}

