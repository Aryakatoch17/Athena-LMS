package com.library.management.service.impl;

import com.library.management.dto.request.CheckoutRequestDTO;
import com.library.management.dto.response.BorrowTransactionResponseDTO;
import com.library.management.exception.BookNotAvailableException;
import com.library.management.exception.BusinessValidationException;
import com.library.management.exception.MemberSuspendedException;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.model.entity.Book;
import com.library.management.model.entity.BorrowTransaction;
import com.library.management.model.entity.Member;
import com.library.management.model.enums.MembershipStatus;
import com.library.management.model.enums.TransactionStatus;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowTransactionRepository;
import com.library.management.repository.MemberRepository;
import com.library.management.service.BorrowTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowTransactionServiceImpl implements BorrowTransactionService {

    private static final int MAX_BORROW_LIMIT_PER_MEMBER = 5;
    private static final BigDecimal DAILY_OVERDUE_FINE_RATE = new BigDecimal("1.50"); // $1.50/day

    private final BorrowTransactionRepository transactionRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;

    @Override
    @Transactional
    public BorrowTransactionResponseDTO checkoutBook(CheckoutRequestDTO requestDTO) {
        // 1. Validate Member
        Member member = memberRepository.findById(requestDTO.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with ID: " + requestDTO.getMemberId()));

        if (member.getMembershipStatus() == MembershipStatus.SUSPENDED) {
            throw new MemberSuspendedException("Member '" + member.getFullName() + "' (" + member.getMembershipId() + ") is SUSPENDED and cannot borrow books.");
        }

        // Check active loan limit
        List<BorrowTransaction> activeBorrows = transactionRepository.findByMemberIdAndStatus(member.getId(), TransactionStatus.BORROWED);
        if (activeBorrows.size() >= MAX_BORROW_LIMIT_PER_MEMBER) {
            throw new BusinessValidationException("Member has reached the maximum borrowing limit of " + MAX_BORROW_LIMIT_PER_MEMBER + " books.");
        }

        // 2. Validate Book
        Book book = bookRepository.findById(requestDTO.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + requestDTO.getBookId()));

        if (book.getAvailableCopies() <= 0) {
            throw new BookNotAvailableException("No available copies remaining for book: '" + book.getTitle() + "' (ISBN: " + book.getIsbn() + ")");
        }

        // 3. Deduct available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        // 4. Create Transaction
        int days = (requestDTO.getLoanPeriodDays() != null && requestDTO.getLoanPeriodDays() > 0)
                ? requestDTO.getLoanPeriodDays()
                : 14;

        LocalDateTime checkoutTime = LocalDateTime.now();
        LocalDateTime dueTime = checkoutTime.plusDays(days);

        BorrowTransaction transaction = BorrowTransaction.builder()
                .book(book)
                .member(member)
                .checkoutDate(checkoutTime)
                .dueDate(dueTime)
                .status(TransactionStatus.BORROWED)
                .fineAmount(BigDecimal.ZERO)
                .build();

        BorrowTransaction saved = transactionRepository.save(transaction);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public BorrowTransactionResponseDTO returnBook(Long transactionId) {
        BorrowTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow transaction not found with ID: " + transactionId));

        if (transaction.getStatus() == TransactionStatus.RETURNED) {
            throw new BusinessValidationException("This transaction has already been completed and returned on " + transaction.getReturnDate());
        }

        LocalDateTime returnTime = LocalDateTime.now();
        BigDecimal fine = BigDecimal.ZERO;

        // Calculate fine if returned after due date
        if (returnTime.isAfter(transaction.getDueDate())) {
            long overdueDays = Duration.between(transaction.getDueDate(), returnTime).toDays();
            if (overdueDays == 0) {
                overdueDays = 1; // Any fraction of a day past due is counted as 1 day
            }
            fine = DAILY_OVERDUE_FINE_RATE.multiply(BigDecimal.valueOf(overdueDays));
        }

        transaction.setReturnDate(returnTime);
        transaction.setStatus(TransactionStatus.RETURNED);
        transaction.setFineAmount(fine);

        // Restock available copies
        Book book = transaction.getBook();
        book.setAvailableCopies(Math.min(book.getTotalCopies(), book.getAvailableCopies() + 1));
        bookRepository.save(book);

        BorrowTransaction updated = transactionRepository.save(transaction);
        return mapToDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BorrowTransactionResponseDTO> getTransactions(TransactionStatus status, String query, Pageable pageable) {
        return transactionRepository.searchTransactions(status, query, pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public BorrowTransactionResponseDTO getTransactionById(Long id) {
        BorrowTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));
        return mapToDTO(transaction);
    }

    private BorrowTransactionResponseDTO mapToDTO(BorrowTransaction t) {
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
    }
}

