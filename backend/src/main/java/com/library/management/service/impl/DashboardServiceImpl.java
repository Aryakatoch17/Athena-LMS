package com.library.management.service.impl;

import com.library.management.dto.response.BorrowTransactionResponseDTO;
import com.library.management.dto.response.DashboardStatsDTO;
import com.library.management.model.entity.Book;
import com.library.management.model.entity.BorrowTransaction;
import com.library.management.model.enums.MembershipStatus;
import com.library.management.model.enums.TransactionStatus;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowTransactionRepository;
import com.library.management.repository.MemberRepository;
import com.library.management.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final BorrowTransactionRepository transactionRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        long totalBooks = bookRepository.count();
        long activeMembers = memberRepository.countByMembershipStatus(MembershipStatus.ACTIVE);
        long borrowedCount = transactionRepository.countByStatus(TransactionStatus.BORROWED);
        long overdueCount = transactionRepository.countOverdueBooks(LocalDateTime.now());

        long totalAvailableCopies = bookRepository.findAll().stream()
                .mapToLong(Book::getAvailableCopies)
                .sum();

        List<BorrowTransaction> recent = transactionRepository.findTop5RecentTransactions(PageRequest.of(0, 5));
        List<BorrowTransactionResponseDTO> recentDTOs = recent.stream()
                .map(t -> {
                    boolean overdue = t.getStatus() == TransactionStatus.BORROWED && LocalDateTime.now().isAfter(t.getDueDate());
                    TransactionStatus effectiveStatus = overdue ? TransactionStatus.OVERDUE : t.getStatus();
                    return BorrowTransactionResponseDTO.builder()
                            .id(t.getId())
                            .bookId(t.getBook().getId())
                            .bookTitle(t.getBook().getTitle())
                            .bookIsbn(t.getBook().getIsbn())
                            .memberId(t.getMember().getId())
                            .memberName(t.getMember().getFullName())
                            .membershipId(t.getMember().getMembershipId())
                            .checkoutDate(t.getCheckoutDate())
                            .dueDate(t.getDueDate())
                            .returnDate(t.getReturnDate())
                            .status(effectiveStatus)
                            .fineAmount(t.getFineAmount())
                            .isOverdue(overdue)
                            .build();
                })
                .collect(Collectors.toList());

        return DashboardStatsDTO.builder()
                .totalBooks(totalBooks)
                .availableCopies(totalAvailableCopies)
                .activeMembers(activeMembers)
                .booksCurrentlyBorrowed(borrowedCount)
                .overdueBooks(overdueCount)
                .recentTransactions(recentDTOs)
                .build();
    }
}

