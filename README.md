# Athena | Enterprise SaaS Library Management System

A production-grade, full-stack enterprise Library Management System built with **Spring Boot 3 (Java 17+)**, **PostgreSQL**, and **React (Vite) + TypeScript** styled with **Tailwind CSS** and **Shadcn UI** patterns.

---

## 🏛 System Architecture & Highlights

- **Backend Architecture:**
  - **Spring Boot 3.2.5** on **Java 17+**
  - **Spring Data JPA** with PostgreSQL indexing & constraints
  - **Enterprise Layering:** Controller &rarr; Service &rarr; Repository &rarr; Database
  - **DTO Pattern:** Strict separation of domain entities and API schemas
  - **Robust Exception Handling:** `@RestControllerAdvice` delivering standardized JSON error schemas (`ErrorResponseDTO`)
  - **Pagination & Sorting:** Built-in Spring Data `Pageable` on all collection endpoints
  - **Automated Data Seeding:** Real-world demo catalog, patrons, and circulation loans initialized via `DataInitializer`

- **Frontend Architecture:**
  - **React 18** with **TypeScript** & **Vite**
  - **Shadcn UI & Tailwind CSS:** Clean SaaS design system with modals, KPI metric cards, badges, and responsive tables
  - **Lucide React:** Modern consistent iconography
  - **Interactive Circulation Desk:** Quick loan checkouts, return confirmations with real-time overdue fine calculations ($1.50/day)
  - **Global Toast Notification System:** Automatic feedback for all API operations and error states

---

## 🚀 Getting Started

### 1. Database Setup (PostgreSQL)

You can spin up PostgreSQL using Docker Compose:

```bash
docker-compose up -d
```

Or connect to your local PostgreSQL instance on port `5432` with:
- **Database:** `library_db`
- **Username:** `postgres`
- **Password:** `postgres`

The schema is automatically managed by Hibernate (`ddl-auto: update`) and can also be initialized using `backend/src/main/resources/schema.sql`.

---

### 2. Backend Startup (Spring Boot)

Navigate to the `backend` folder and run with Maven:

```bash
cd backend
mvn clean spring-boot:run
```

The REST API will be available at: `http://localhost:8080`

#### Key Endpoints:
- `GET /api/dashboard/stats` - Central KPI metrics and recent loans
- `GET /api/books` - Paginated book catalog with search (`?query=clean&page=0&size=10`)
- `POST /api/books` - Register new book
- `PUT /api/books/{id}` - Update book details
- `DELETE /api/books/{id}` - Remove book (blocked if copies are currently borrowed)
- `GET /api/members` - Paginated member list
- `POST /api/members` - Register cardholder
- `PATCH /api/members/{id}/status?status=ACTIVE|SUSPENDED` - Toggle privileges
- `POST /api/transactions/checkout` - Issue loan (`bookId`, `memberId`, `loanPeriodDays`)
- `POST /api/transactions/return/{transactionId}` - Process return and assess overdue fines

---

### 3. Frontend Startup (React + Vite)

In a new terminal, navigate to the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.
All requests to `/api` are automatically proxied to the Spring Boot backend at `http://localhost:8080`.

---

## 📂 Project Directory Structure

```text
full_stack_mini_project/
├── docker-compose.yml                  # PostgreSQL container definition
├── backend/
│   ├── pom.xml                         # Spring Boot 3 & Maven dependencies
│   └── src/main/
│       ├── resources/
│       │   ├── application.yml         # HikariCP, PostgreSQL & JPA config
│       │   └── schema.sql              # Production PostgreSQL DDL & indexes
│       └── java/com/library/management/
│           ├── LibraryManagementApplication.java
│           ├── config/
│           │   ├── WebConfig.java       # CORS configuration
│           │   └── DataInitializer.java # Demo data seeder
│           ├── controller/
│           │   ├── BookController.java
│           │   ├── MemberController.java
│           │   ├── BorrowTransactionController.java
│           │   └── DashboardController.java
│           ├── dto/
│           │   ├── request/ (BookRequestDTO, MemberRequestDTO, CheckoutRequestDTO)
│           │   └── response/ (BookResponseDTO, MemberResponseDTO, BorrowTransactionResponseDTO, DashboardStatsDTO, ApiResponse)
│           ├── exception/
│           │   ├── GlobalExceptionHandler.java
│           │   └── Custom Exceptions (ResourceNotFound, MemberSuspended, BookNotAvailable, DuplicateResource)
│           ├── model/
│           │   ├── entity/ (Book, Member, BorrowTransaction)
│           │   └── enums/ (MembershipStatus, TransactionStatus)
│           ├── repository/ (BookRepository, MemberRepository, BorrowTransactionRepository)
│           └── service/ & impl/ (BookService, MemberService, BorrowTransactionService, DashboardService)
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── api/ (client, books, members, transactions, dashboard)
        ├── components/
        │   ├── layout/ (Sidebar, Header, MainLayout)
        │   └── ui/ (Button, Badge, Card, Input, Modal)
        ├── context/ (ToastContext)
        ├── views/ (DashboardView, BooksView, MembersView, TransactionsView)
        └── types/index.ts
```

