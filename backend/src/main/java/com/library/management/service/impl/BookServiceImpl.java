package com.library.management.service.impl;

import com.library.management.dto.request.BookRequestDTO;
import com.library.management.dto.response.BookResponseDTO;
import com.library.management.exception.BusinessValidationException;
import com.library.management.exception.DuplicateResourceException;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.model.entity.Book;
import com.library.management.model.enums.TransactionStatus;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowTransactionRepository;
import com.library.management.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final BorrowTransactionRepository transactionRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<BookResponseDTO> getAllBooks(String query, Pageable pageable) {
        return bookRepository.searchBooks(query, pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public BookResponseDTO getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + id));
        return mapToDTO(book);
    }

    @Override
    @Transactional
    public BookResponseDTO createBook(BookRequestDTO requestDTO) {
        if (bookRepository.existsByIsbn(requestDTO.getIsbn())) {
            throw new DuplicateResourceException("A book with ISBN '" + requestDTO.getIsbn() + "' already exists.");
        }

        Book book = Book.builder()
                .isbn(requestDTO.getIsbn().trim())
                .title(requestDTO.getTitle().trim())
                .author(requestDTO.getAuthor().trim())
                .publisher(requestDTO.getPublisher() != null ? requestDTO.getPublisher().trim() : null)
                .publishedYear(requestDTO.getPublishedYear())
                .totalCopies(requestDTO.getTotalCopies())
                .availableCopies(requestDTO.getTotalCopies())
                .build();

        Book saved = bookRepository.save(book);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public BookResponseDTO updateBook(Long id, BookRequestDTO requestDTO) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + id));

        if (bookRepository.existsByIsbnAndIdNot(requestDTO.getIsbn(), id)) {
            throw new DuplicateResourceException("Another book with ISBN '" + requestDTO.getIsbn() + "' already exists.");
        }

        int borrowedCopies = book.getTotalCopies() - book.getAvailableCopies();
        if (requestDTO.getTotalCopies() < borrowedCopies) {
            throw new BusinessValidationException("Cannot reduce total copies below currently borrowed count (" + borrowedCopies + ").");
        }

        int difference = requestDTO.getTotalCopies() - book.getTotalCopies();
        book.setIsbn(requestDTO.getIsbn().trim());
        book.setTitle(requestDTO.getTitle().trim());
        book.setAuthor(requestDTO.getAuthor().trim());
        book.setPublisher(requestDTO.getPublisher() != null ? requestDTO.getPublisher().trim() : null);
        book.setPublishedYear(requestDTO.getPublishedYear());
        book.setTotalCopies(requestDTO.getTotalCopies());
        book.setAvailableCopies(book.getAvailableCopies() + difference);

        Book updated = bookRepository.save(book);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + id));

        int borrowedCopies = book.getTotalCopies() - book.getAvailableCopies();
        if (borrowedCopies > 0) {
            throw new BusinessValidationException("Cannot delete book. " + borrowedCopies + " copies are currently checked out.");
        }

        bookRepository.delete(book);
    }

    private BookResponseDTO mapToDTO(Book book) {
        return BookResponseDTO.builder()
                .id(book.getId())
                .isbn(book.getIsbn())
                .title(book.getTitle())
                .author(book.getAuthor())
                .publisher(book.getPublisher())
                .publishedYear(book.getPublishedYear())
                .totalCopies(book.getTotalCopies())
                .availableCopies(book.getAvailableCopies())
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .build();
    }
}

