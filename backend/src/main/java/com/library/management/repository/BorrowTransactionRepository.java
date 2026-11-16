package com.library.management.repository;

import com.library.management.model.entity.BorrowTransaction;
import com.library.management.model.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BorrowTransactionRepository extends JpaRepository<BorrowTransaction, Long> {

    List<BorrowTransaction> findByMemberIdAndStatus(Long memberId, TransactionStatus status);

    long countByStatus(TransactionStatus status);

    @Query("SELECT COUNT(t) FROM BorrowTransaction t WHERE t.status = 'BORROWED' AND t.dueDate < :now")
    long countOverdueBooks(@Param("now") LocalDateTime now);

    @Query("SELECT t FROM BorrowTransaction t " +
           "JOIN FETCH t.book b " +
           "JOIN FETCH t.member m " +
           "WHERE (:status IS NULL OR t.status = :status) AND " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.membershipId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<BorrowTransaction> searchTransactions(@Param("status") TransactionStatus status,
                                               @Param("query") String query,
                                               Pageable pageable);

    @Query("SELECT t FROM BorrowTransaction t JOIN FETCH t.book JOIN FETCH t.member ORDER BY t.checkoutDate DESC")
    List<BorrowTransaction> findTop5RecentTransactions(Pageable pageable);
}

