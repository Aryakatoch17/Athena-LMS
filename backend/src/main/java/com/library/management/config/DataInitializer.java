package com.library.management.config;

import com.library.management.model.entity.Book;
import com.library.management.model.entity.BorrowTransaction;
import com.library.management.model.entity.Member;
import com.library.management.model.enums.MembershipStatus;
import com.library.management.model.enums.TransactionStatus;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowTransactionRepository;
import com.library.management.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final BorrowTransactionRepository transactionRepository;

    @Override
    public void run(String... args) {
        if (bookRepository.count() > 0) {
            log.info("Database already seeded with demo data.");
            return;
        }

        log.info("Seeding initial enterprise demo data for Library Management System...");

        // 1. Seed Books
        List<Book> books = List.of(
                Book.builder()
                        .isbn("9780132350884")
                        .title("Clean Code: A Handbook of Agile Software Craftsmanship")
                        .author("Robert C. Martin")
                        .publisher("Prentice Hall")
                        .publishedYear(2008)
                        .totalCopies(5)
                        .availableCopies(3)
                        .build(),
                Book.builder()
                        .isbn("9780134685991")
                        .title("Effective Java (3rd Edition)")
                        .author("Joshua Bloch")
                        .publisher("Addison-Wesley")
                        .publishedYear(2018)
                        .totalCopies(4)
                        .availableCopies(2)
                        .build(),
                Book.builder()
                        .isbn("9780201633610")
                        .title("Design Patterns: Elements of Reusable Object-Oriented Software")
                        .author("Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides")
                        .publisher("Addison-Wesley")
                        .publishedYear(1994)
                        .totalCopies(3)
                        .availableCopies(2)
                        .build(),
                Book.builder()
                        .isbn("9781491950357")
                        .title("Designing Data-Intensive Applications")
                        .author("Martin Kleppmann")
                        .publisher("O'Reilly Media")
                        .publishedYear(2017)
                        .totalCopies(6)
                        .availableCopies(4)
                        .build(),
                Book.builder()
                        .isbn("9780321125217")
                        .title("Domain-Driven Design: Tackling Complexity in the Heart of Software")
                        .author("Eric Evans")
                        .publisher("Addison-Wesley")
                        .publishedYear(2003)
                        .totalCopies(4)
                        .availableCopies(4)
                        .build(),
                Book.builder()
                        .isbn("9781617294945")
                        .title("Spring in Action, Sixth Edition")
                        .author("Craig Walls")
                        .publisher("Manning Publications")
                        .publishedYear(2022)
                        .totalCopies(5)
                        .availableCopies(5)
                        .build()
        );
        List<Book> savedBooks = bookRepository.saveAll(books);

        // 2. Seed Members
        List<Member> members = List.of(
                Member.builder()
                        .membershipId("LIB-2024-001")
                        .fullName("Dr. Alexander Hayes")
                        .email("alexander.hayes@enterprise.io")
                        .phoneNumber("+1-555-019-2831")
                        .membershipStatus(MembershipStatus.ACTIVE)
                        .build(),
                Member.builder()
                        .membershipId("LIB-2024-002")
                        .fullName("Sophia Montgomery")
                        .email("sophia.montgomery@techlab.org")
                        .phoneNumber("+1-555-014-9923")
                        .membershipStatus(MembershipStatus.ACTIVE)
                        .build(),
                Member.builder()
                        .membershipId("LIB-2024-003")
                        .fullName("Marcus Vance")
                        .email("marcus.vance@engineering.com")
                        .phoneNumber("+1-555-018-7712")
                        .membershipStatus(MembershipStatus.ACTIVE)
                        .build(),
                Member.builder()
                        .membershipId("LIB-2024-004")
                        .fullName("Eleanor Sterling")
                        .email("eleanor.sterling@academics.edu")
                        .phoneNumber("+1-555-012-3456")
                        .membershipStatus(MembershipStatus.SUSPENDED)
                        .build()
        );
        List<Member> savedMembers = memberRepository.saveAll(members);

        // 3. Seed Borrow Transactions
        LocalDateTime now = LocalDateTime.now();
        List<BorrowTransaction> transactions = List.of(
                BorrowTransaction.builder()
                        .book(savedBooks.get(0))
                        .member(savedMembers.get(0))
                        .checkoutDate(now.minusDays(5))
                        .dueDate(now.plusDays(9))
                        .status(TransactionStatus.BORROWED)
                        .fineAmount(BigDecimal.ZERO)
                        .build(),
                BorrowTransaction.builder()
                        .book(savedBooks.get(1))
                        .member(savedMembers.get(1))
                        .checkoutDate(now.minusDays(18))
                        .dueDate(now.minusDays(4)) // overdue by 4 days
                        .status(TransactionStatus.BORROWED)
                        .fineAmount(BigDecimal.ZERO)
                        .build(),
                BorrowTransaction.builder()
                        .book(savedBooks.get(3))
                        .member(savedMembers.get(2))
                        .checkoutDate(now.minusDays(20))
                        .dueDate(now.minusDays(6))
                        .returnDate(now.minusDays(2))
                        .status(TransactionStatus.RETURNED)
                        .fineAmount(new BigDecimal("6.00"))
                        .build()
        );
        transactionRepository.saveAll(transactions);

        log.info("Database successfully seeded with {} books, {} members, and {} transactions.",
                savedBooks.size(), savedMembers.size(), transactions.size());
    }
}

