import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  BookMarked,
  Layers
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { bookApi } from '../api/books';
import { Book, BookRequest, PageResponse } from '../types';
import { useToast } from '../context/ToastContext';
import { extractErrorMessage } from '../api/client';

interface BooksViewProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const BooksView: React.FC<BooksViewProps> = ({ isAddModalOpen, setIsAddModalOpen }) => {
  const [booksPage, setBooksPage] = useState<PageResponse<Book> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Edit State
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Delete State
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<BookRequest>({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    publishedYear: 2024,
    totalCopies: 3,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();

  const fetchBooks = useCallback(async (page = 0, query = '') => {
    try {
      setIsLoading(true);
      const data = await bookApi.getAll({
        page,
        size: 8,
        query: query.trim() || undefined,
        sort: 'id,desc',
      });
      setBooksPage(data);
      setCurrentPage(data.number);
    } catch (err) {
      error('Failed to load books catalog', extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks(0, searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchBooks]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.isbn.trim()) errors.isbn = 'ISBN is required';
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.author.trim()) errors.author = 'Author name is required';
    if (!formData.totalCopies || formData.totalCopies < 1) errors.totalCopies = 'Must have at least 1 copy';
    if (formData.publishedYear && (formData.publishedYear < 1000 || formData.publishedYear > 2100)) {
      errors.publishedYear = 'Enter a valid 4-digit year';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddModal = () => {
    setFormData({
      isbn: '',
      title: '',
      author: '',
      publisher: '',
      publishedYear: new Date().getFullYear(),
      totalCopies: 3,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher || '',
      publishedYear: book.publishedYear || new Date().getFullYear(),
      totalCopies: book.totalCopies,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      if (editingBook) {
        await bookApi.update(editingBook.id, formData);
        success('Book updated', `"${formData.title}" was successfully updated.`);
        setIsEditModalOpen(false);
      } else {
        await bookApi.create(formData);
        success('Book cataloged', `"${formData.title}" added to the library collection.`);
        setIsAddModalOpen(false);
      }
      fetchBooks(currentPage, searchQuery);
    } catch (err) {
      error('Could not save book', extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!deletingBook) return;

    try {
      setIsSubmitting(true);
      await bookApi.delete(deletingBook.id);
      success('Book removed', `"${deletingBook.title}" was deleted from catalog.`);
      setIsDeleteModalOpen(false);
      setDeletingBook(null);
      fetchBooks(currentPage, searchQuery);
    } catch (err) {
      error('Failed to delete book', extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, ISBN, or publisher..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Add Book Button */}
        <div className="flex items-center gap-3">
          <Button onClick={handleOpenAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Book
          </Button>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Book Details</th>
                <th className="py-3.5 px-4">Author & Publisher</th>
                <th className="py-3.5 px-4">Publication</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && !booksPage ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    Loading book records...
                  </td>
                </tr>
              ) : !booksPage || booksPage.content.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No books found</p>
                    <p className="text-xs text-slate-400 mt-1">Try refining your search query or add a new title.</p>
                  </td>
                </tr>
              ) : (
                booksPage.content.map((book) => {
                  const hasCopies = book.availableCopies > 0;
                  return (
                    <tr key={book.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                            <BookMarked className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug">{book.title}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">ISBN: {book.isbn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-800">{book.author}</p>
                        <p className="text-xs text-slate-400">{book.publisher || 'Unknown Publisher'}</p>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium">
                        {book.publishedYear || 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <Badge variant={hasCopies ? 'success' : 'destructive'}>
                            {hasCopies ? `${book.availableCopies} Available` : 'All Checked Out'}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Layers className="w-3 h-3" />
                            <span>{book.totalCopies} Total Copies</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Edit Book"
                            onClick={() => handleOpenEditModal(book)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete Book"
                            onClick={() => {
                              setDeletingBook(book);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {booksPage && booksPage.totalPages > 1 && (
          <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-800">{booksPage.content.length}</span> of{' '}
              <span className="font-semibold text-slate-800">{booksPage.totalElements}</span> books
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={booksPage.first || isLoading}
                onClick={() => fetchBooks(currentPage - 1, searchQuery)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="px-2 font-medium">
                Page {currentPage + 1} of {booksPage.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={booksPage.last || isLoading}
                onClick={() => fetchBooks(currentPage + 1, searchQuery)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal Form */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={editingBook ? 'Edit Book Details' : 'Catalog New Book'}
        description={
          editingBook
            ? 'Update the bibliographic and inventory data for this title.'
            : 'Fill in the details to register a new book in the library management system.'
        }
        maxWidth="lg"
      >
        <form onSubmit={handleSaveBook} className="space-y-4">
          <Input
            label="ISBN Number"
            placeholder="e.g. 9780132350884"
            required
            value={formData.isbn}
            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
            error={formErrors.isbn}
          />

          <Input
            label="Book Title"
            placeholder="e.g. Clean Architecture"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={formErrors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Author Name"
              placeholder="e.g. Robert C. Martin"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              error={formErrors.author}
            />

            <Input
              label="Publisher"
              placeholder="e.g. Prentice Hall"
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Published Year"
              type="number"
              placeholder="e.g. 2017"
              value={formData.publishedYear || ''}
              onChange={(e) => setFormData({ ...formData, publishedYear: parseInt(e.target.value) || undefined })}
              error={formErrors.publishedYear}
            />

            <Input
              label="Total Physical Copies"
              type="number"
              min={1}
              required
              value={formData.totalCopies}
              onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })}
              error={formErrors.totalCopies}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
              {editingBook ? 'Update Book' : 'Register Book'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Book Removal"
        description="Are you sure you want to permanently remove this title from the library inventory?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <p className="font-semibold">Warning: Destructive Operation</p>
            <p className="mt-1">
              Title: <strong>{deletingBook?.title}</strong>
            </p>
            <p className="mt-1">
              This action cannot be undone. Books with active loans cannot be deleted.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              isLoading={isSubmitting}
              onClick={handleDeleteBook}
            >
              Delete Book
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

