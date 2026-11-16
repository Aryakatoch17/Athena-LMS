package com.library.management.service;

import com.library.management.dto.request.BookRequestDTO;
import com.library.management.dto.response.BookResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookService {
    Page<BookResponseDTO> getAllBooks(String query, Pageable pageable);
    BookResponseDTO getBookById(Long id);
    BookResponseDTO createBook(BookRequestDTO requestDTO);
    BookResponseDTO updateBook(Long id, BookRequestDTO requestDTO);
    void deleteBook(Long id);
}

