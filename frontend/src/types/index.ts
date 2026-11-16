export type MembershipStatus = 'ACTIVE' | 'SUSPENDED';

export type TransactionStatus = 'BORROWED' | 'RETURNED' | 'OVERDUE';

export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  publishedYear?: number;
  totalCopies: number;
  availableCopies: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookRequest {
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  publishedYear?: number;
  totalCopies: number;
}

export interface Member {
  id: number;
  membershipId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  membershipStatus: MembershipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MemberRequest {
  membershipId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  membershipStatus?: MembershipStatus;
}

export interface BorrowTransaction {
  id: number;
  bookId: number;
  bookTitle: string;
  bookIsbn: string;
  memberId: number;
  memberName: string;
  membershipId: string;
  checkoutDate: string;
  dueDate: string;
  returnDate?: string;
  status: TransactionStatus;
  fineAmount: number;
  overdue: boolean;
}

export interface CheckoutRequest {
  bookId: number;
  memberId: number;
  loanPeriodDays?: number;
}

export interface DashboardStats {
  totalBooks: number;
  availableCopies: number;
  activeMembers: number;
  booksCurrentlyBorrowed: number;
  overdueBooks: number;
  recentTransactions: BorrowTransaction[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  validationErrors?: Record<string, string>;
}

