package com.library.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalBooks;
    private long availableCopies;
    private long activeMembers;
    private long booksCurrentlyBorrowed;
    private long overdueBooks;
    private List<BorrowTransactionResponseDTO> recentTransactions;
}

