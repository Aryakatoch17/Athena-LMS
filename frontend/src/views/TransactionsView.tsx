import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  BookOpen, 
  User, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { transactionApi } from '../api/transactions';
import { bookApi } from '../api/books';
import { memberApi } from '../api/members';
import { 
  BorrowTransaction, 
  Book, 
  Member, 
  TransactionStatus, 
  PageResponse, 
  CheckoutRequest 
} from '../types';
import { formatDate, formatCurrency } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import { extractErrorMessage } from '../api/client';

interface TransactionsViewProps {
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  isCheckoutModalOpen,
  setIsCheckoutModalOpen,
}) => {
  const [txPage, setTxPage] = useState<PageResponse<BorrowTransaction> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Return Book Modal State
  const [returningTx, setReturningTx] = useState<BorrowTransaction | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  // Checkout Form State
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [activeMembers, setActiveMembers] = useState<Member[]>([]);
  const [isLoadingPrerequisites, setIsLoadingPrerequisites] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutRequest>({
    bookId: 0,
    memberId: 0,
    loanPeriodDays: 14,
  });
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  const { success, error } = useToast();

  const fetchTransactions = useCallback(async (page = 0, status = statusFilter, query = searchQuery) => {
    try {
      setIsLoading(true);
      const data = await transactionApi.getAll({
        page,
        size: 8,
        status: status === 'ALL' ? undefined : status,
        query: query.trim() || undefined,
        sort: 'checkoutDate,desc',
      });
      setTxPage(data);
      setCurrentPage(data.number);
    } catch (err) {
      error('Failed to load transaction logs', extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [error, statusFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions(0, statusFilter, searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [statusFilter, searchQuery, fetchTransactions]);

  // Load books and members whenever checkout modal opens
  const loadCheckoutPrerequisites = useCallback(async () => {
    try {
      setIsLoadingPrerequisites(true);
      const [booksRes, membersRes] = await Promise.all([
        bookApi.getAll({ size: 100 }),
        memberApi.getAll({ size: 100 }),
      ]);
      const available = booksRes.content.filter((b) => b.availableCopies > 0);
      setAvailableBooks(available);
      setActiveMembers(membersRes.content);

      const firstActiveMember = membersRes.content.find((m) => m.membershipStatus !== 'SUSPENDED') || membersRes.content[0];
      if (available.length > 0 && firstActiveMember) {
        setCheckoutData((prev) => ({
          ...prev,
          bookId: prev.bookId && available.some((b) => b.id === prev.bookId) ? prev.bookId : available[0].id,
          memberId: prev.memberId && membersRes.content.some((m) => m.id === prev.memberId) ? prev.memberId : firstActiveMember.id,
          loanPeriodDays: prev.loanPeriodDays || 14,
        }));
      }
    } catch (err) {
      error('Failed to initialize checkout desk', extractErrorMessage(err));
    } finally {
      setIsLoadingPrerequisites(false);
    }
  }, [error]);

  useEffect(() => {
    if (isCheckoutModalOpen) {
      loadCheckoutPrerequisites();
    }
  }, [isCheckoutModalOpen, loadCheckoutPrerequisites]);

  const handleOpenCheckoutModal = () => {
    setIsCheckoutModalOpen(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutData.bookId || !checkoutData.memberId) {
      error('Selection required', 'Please select both an available book and an active member.');
      return;
    }

    try {
      setIsSubmittingCheckout(true);
      const res = await transactionApi.checkout(checkoutData);
      success(
        'Checkout Processed Successfully',
        `Book "${res.bookTitle}" loaned to ${res.memberName}. Due: ${formatDate(res.dueDate)}`
      );
      setIsCheckoutModalOpen(false);
      fetchTransactions(0, statusFilter, searchQuery);
    } catch (err) {
      error('Checkout failed', extractErrorMessage(err));
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  const handleOpenReturnModal = (tx: BorrowTransaction) => {
    setReturningTx(tx);
    setIsReturnModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!returningTx) return;

    try {
      setIsReturning(true);
      const res = await transactionApi.returnBook(returningTx.id);
      const fineNotice = res.fineAmount > 0 ? ` (Overdue fine assessed: ${formatCurrency(res.fineAmount)})` : '';
      success(
        'Book Successfully Returned',
        `"${res.bookTitle}" returned by ${res.memberName} and restocked into inventory.${fineNotice}`
      );
      setIsReturnModalOpen(false);
      setReturningTx(null);
      fetchTransactions(currentPage, statusFilter, searchQuery);
    } catch (err) {
      error('Return processing failed', extractErrorMessage(err));
    } finally {
      setIsReturning(false);
    }
  };

  // Helper to preview overdue fine before confirming return
  const calculateEstimatedFine = (dueDateString: string) => {
    const due = new Date(dueDateString);
    const now = new Date();
    if (now <= due) return 0;
    const diffTime = Math.abs(now.getTime() - due.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * 1.5; // $1.50 per day
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
          {(['ALL', 'BORROWED', 'OVERDUE', 'RETURNED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {status === 'ALL' ? 'All Loans' : status}
            </button>
          ))}
        </div>

        {/* Search & Checkout Button */}
        <div className="flex items-center gap-3 flex-1 lg:max-w-md justify-end">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search loans by book, ISBN, member..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <Button onClick={handleOpenCheckoutModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            New Checkout
          </Button>
        </div>
      </div>

      {/* Main Circulation Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Book Item</th>
                <th className="py-3.5 px-4">Borrowing Member</th>
                <th className="py-3.5 px-4">Loan Timeline</th>
                <th className="py-3.5 px-4">Status & Fine</th>
                <th className="py-3.5 px-6 text-right">Circulation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && !txPage ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    Loading circulation records...
                  </td>
                </tr>
              ) : !txPage || txPage.content.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <ArrowLeftRight className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No circulation records found</p>
                    <p className="text-xs text-slate-400 mt-1">Process a new checkout loan to begin tracking.</p>
                  </td>
                </tr>
              ) : (
                txPage.content.map((tx) => {
                  const isReturned = tx.status === 'RETURNED';
                  const isOverdue = tx.status === 'OVERDUE' || tx.overdue;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isReturned ? 'bg-slate-100 text-slate-500' : isOverdue ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug">{tx.bookTitle}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">ISBN: {tx.bookIsbn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-2.5">
                          <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-800">{tx.memberName}</p>
                            <p className="text-xs text-slate-400 font-mono">{tx.membershipId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Out: {formatDate(tx.checkoutDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                          <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                            Due: {formatDate(tx.dueDate)}
                          </span>
                        </div>
                        {tx.returnDate && (
                          <p className="text-[11px] text-emerald-600 font-medium">
                            Returned: {formatDate(tx.returnDate)}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <Badge
                            variant={
                              isReturned ? 'success' : isOverdue ? 'destructive' : 'info'
                            }
                          >
                            {isOverdue && !isReturned ? 'OVERDUE' : tx.status}
                          </Badge>
                          {tx.fineAmount > 0 && (
                            <p className="text-xs font-mono font-semibold text-rose-600">
                              Fine: {formatCurrency(tx.fineAmount)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant={isOverdue ? 'destructive' : 'outline'}
                            onClick={() => handleOpenReturnModal(tx)}
                            className="font-semibold"
                          >
                            Return Book
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {txPage && txPage.totalPages > 1 && (
          <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-800">{txPage.content.length}</span> of{' '}
              <span className="font-semibold text-slate-800">{txPage.totalElements}</span> records
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={txPage.first || isLoading}
                onClick={() => fetchTransactions(currentPage - 1, statusFilter, searchQuery)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="px-2 font-medium">
                Page {currentPage + 1} of {txPage.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={txPage.last || isLoading}
                onClick={() => fetchTransactions(currentPage + 1, statusFilter, searchQuery)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Issue New Book Loan"
        description="Verify member credentials and assign an available catalog title."
        maxWidth="lg"
      >
        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
          {/* Member Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Borrowing Cardholder <span className="text-rose-500">*</span>
            </label>
            <select
              value={checkoutData.memberId}
              onChange={(e) => setCheckoutData({ ...checkoutData, memberId: Number(e.target.value) })}
              className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
              disabled={isLoadingPrerequisites}
            >
              {isLoadingPrerequisites ? (
                <option value={0}>Loading cardholders...</option>
              ) : activeMembers.length === 0 ? (
                <option value={0}>No cardholders registered</option>
              ) : (
                activeMembers.map((m) => {
                  const isSuspended = m.membershipStatus === 'SUSPENDED';
                  return (
                    <option key={m.id} value={m.id} disabled={isSuspended}>
                      {m.fullName} ({m.membershipId}) {isSuspended ? '[SUSPENDED]' : ''}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Book Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Catalog Book Title <span className="text-rose-500">*</span>
            </label>
            <select
              value={checkoutData.bookId}
              onChange={(e) => setCheckoutData({ ...checkoutData, bookId: Number(e.target.value) })}
              className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
              disabled={isLoadingPrerequisites}
            >
              {isLoadingPrerequisites ? (
                <option value={0}>Loading available titles...</option>
              ) : availableBooks.length === 0 ? (
                <option value={0}>No titles with available copies</option>
              ) : (
                availableBooks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} (Available: {b.availableCopies} of {b.totalCopies}) - ISBN: {b.isbn}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Loan Period */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Loan Duration (Days)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[7, 14, 21, 30].map((days) => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setCheckoutData({ ...checkoutData, loanPeriodDays: days })}
                  className={`h-9 rounded-lg border text-xs font-semibold transition-all ${
                    checkoutData.loanPeriodDays === days
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsCheckoutModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmittingCheckout}
              disabled={availableBooks.length === 0}
              className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
            >
              Authorize Checkout
            </Button>
          </div>
        </form>
      </Modal>

      {/* Return Book Modal with Fine Preview */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Process Book Return"
        description="Verify item condition and assess any outstanding overdue penalties."
        maxWidth="md"
      >
        {returningTx && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Title</p>
                <p className="font-bold text-slate-900 text-sm">{returningTx.bookTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Borrower</p>
                  <p className="font-medium text-slate-800">{returningTx.memberName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Due Date</p>
                  <p className="font-medium text-slate-800">{formatDate(returningTx.dueDate)}</p>
                </div>
              </div>
            </div>

            {/* Overdue Penalty Calculation Box */}
            {(() => {
              const estimatedFine = calculateEstimatedFine(returningTx.dueDate);
              if (estimatedFine > 0) {
                return (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Overdue Penalty Calculated</span>
                    </div>
                    <p className="text-rose-800 leading-relaxed">
                      This item is returned past the due date. A fine of{' '}
                      <strong className="text-sm font-bold text-rose-950">
                        {formatCurrency(estimatedFine)}
                      </strong>{' '}
                      ($1.50/day) has been applied to this transaction.
                    </p>
                  </div>
                );
              }
              return (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Returned on time. Zero penalty fine incurred.</span>
                </div>
              );
            })()}

            <div className="pt-2 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsReturnModalOpen(false)}>
                Cancel
              </Button>
              <Button
                isLoading={isReturning}
                onClick={handleConfirmReturn}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Confirm Return & Restock
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

