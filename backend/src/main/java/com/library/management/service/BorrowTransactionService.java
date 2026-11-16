package com.library.management.service;

import com.library.management.dto.request.CheckoutRequestDTO;
import com.library.management.dto.response.BorrowTransactionResponseDTO;
import com.library.management.model.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BorrowTransactionService {
    BorrowTransactionResponseDTO checkoutBook(CheckoutRequestDTO requestDTO);
    BorrowTransactionResponseDTO returnBook(Long transactionId);
    Page<BorrowTransactionResponseDTO> getTransactions(TransactionStatus status, String query, Pageable pageable);
    BorrowTransactionResponseDTO getTransactionById(Long id);
}

