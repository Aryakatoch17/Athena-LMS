package com.library.management.controller;

import com.library.management.dto.request.CheckoutRequestDTO;
import com.library.management.dto.response.BorrowTransactionResponseDTO;
import com.library.management.model.enums.TransactionStatus;
import com.library.management.service.BorrowTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class BorrowTransactionController {

    private final BorrowTransactionService transactionService;

    @GetMapping
    public ResponseEntity<Page<BorrowTransactionResponseDTO>> getTransactions(
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) String query,
            @PageableDefault(size = 10, sort = "checkoutDate", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<BorrowTransactionResponseDTO> transactions = transactionService.getTransactions(status, query, pageable);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BorrowTransactionResponseDTO> getTransactionById(@PathVariable Long id) {
        BorrowTransactionResponseDTO transaction = transactionService.getTransactionById(id);
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/checkout")
    public ResponseEntity<BorrowTransactionResponseDTO> checkoutBook(@Valid @RequestBody CheckoutRequestDTO requestDTO) {
        BorrowTransactionResponseDTO response = transactionService.checkoutBook(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/return/{transactionId}")
    public ResponseEntity<BorrowTransactionResponseDTO> returnBook(@PathVariable Long transactionId) {
        BorrowTransactionResponseDTO response = transactionService.returnBook(transactionId);
        return ResponseEntity.ok(response);
    }
}

