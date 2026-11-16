package com.library.management.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookRequestDTO {

    @NotBlank(message = "ISBN is required")
    @Pattern(regexp = "^(97(8|9))?\\d{9}(\\d|X)$", message = "Invalid ISBN format (ISBN-10 or ISBN-13 expected)")
    private String isbn;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    @NotBlank(message = "Author is required")
    @Size(max = 255, message = "Author name cannot exceed 255 characters")
    private String author;

    @Size(max = 255, message = "Publisher name cannot exceed 255 characters")
    private String publisher;

    @Min(value = 1000, message = "Published year must be a valid 4-digit year")
    @Max(value = 2100, message = "Published year cannot be in the distant future")
    private Integer publishedYear;

    @NotNull(message = "Total copies count is required")
    @Min(value = 1, message = "Total copies must be at least 1")
    private Integer totalCopies;
}

