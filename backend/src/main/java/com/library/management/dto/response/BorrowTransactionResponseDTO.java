package com.library.management.dto.response;

import com.library.management.model.enums.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BorrowTransactionResponseDTO {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookIsbn;
    private Long memberId;
    private String memberName;
    private String membershipId;
    private LocalDateTime checkoutDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;
    private TransactionStatus status;
    private BigDecimal fineAmount;
    private boolean isOverdue;
}

