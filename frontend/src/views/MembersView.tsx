import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  UserX, 
  ShieldAlert,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { memberApi } from '../api/members';
import { Member, MemberRequest, MembershipStatus, PageResponse } from '../types';
import { formatDate } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import { extractErrorMessage } from '../api/client';

export const MembersView: React.FC = () => {
  const [membersPage, setMembersPage] = useState<PageResponse<Member> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form
  const [formData, setFormData] = useState<MemberRequest>({
    membershipId: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    membershipStatus: 'ACTIVE',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();

  const fetchMembers = useCallback(async (page = 0, query = '') => {
    try {
      setIsLoading(true);
      const data = await memberApi.getAll({
        page,
        size: 8,
        query: query.trim() || undefined,
        sort: 'id,desc',
      });
      setMembersPage(data);
      setCurrentPage(data.number);
    } catch (err) {
      error('Failed to load members', extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers(0, searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchMembers]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.membershipId.trim()) errors.membershipId = 'Membership ID is required';
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddModal = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      membershipId: `LIB-2024-${randomSuffix}`,
      fullName: '',
      email: '',
      phoneNumber: '',
      membershipStatus: 'ACTIVE',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (member: Member) => {
    setEditingMember(member);
    setFormData({
      membershipId: member.membershipId,
      fullName: member.fullName,
      email: member.email,
      phoneNumber: member.phoneNumber || '',
      membershipStatus: member.membershipStatus,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      if (editingMember) {
        await memberApi.update(editingMember.id, formData);
        success('Member updated', `"${formData.fullName}" was successfully updated.`);
        setIsEditModalOpen(false);
      } else {
        await memberApi.create(formData);
        success('Member registered', `"${formData.fullName}" is now an active cardholder.`);
        setIsAddModalOpen(false);
      }
      fetchMembers(currentPage, searchQuery);
    } catch (err) {
      error('Failed to save member', extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (member: Member) => {
    const nextStatus: MembershipStatus = member.membershipStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await memberApi.updateStatus(member.id, nextStatus);
      success(
        `Membership ${nextStatus.toLowerCase()}`,
        `${member.fullName}'s status is now ${nextStatus}.`
      );
      fetchMembers(currentPage, searchQuery);
    } catch (err) {
      error('Could not update status', extractErrorMessage(err));
    }
  };

  const handleDeleteMember = async () => {
    if (!deletingMember) return;
    try {
      setIsSubmitting(true);
      await memberApi.delete(deletingMember.id);
      success('Member deleted', `Member profile for ${deletingMember.fullName} was deleted.`);
      setIsDeleteModalOpen(false);
      setDeletingMember(null);
      fetchMembers(currentPage, searchQuery);
    } catch (err) {
      error('Failed to delete member', extractErrorMessage(err));
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
            placeholder="Search by name, email, member ID, phone..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Add Member Button */}
        <Button onClick={handleOpenAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
          <Plus className="w-4 h-4 mr-1.5" />
          Register Member
        </Button>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Member Profile</th>
                <th className="py-3.5 px-4">Contact Information</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && !membersPage ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    Loading member registry...
                  </td>
                </tr>
              ) : !membersPage || membersPage.content.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <UserX className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No members found</p>
                    <p className="text-xs text-slate-400 mt-1">Try another search keyword or enroll a new cardholder.</p>
                  </td>
                </tr>
              ) : (
                membersPage.content.map((member) => {
                  const isActive = member.membershipStatus === 'ACTIVE';
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {member.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{member.fullName}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{member.membershipId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{member.email}</span>
                        </div>
                        {member.phoneNumber && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{member.phoneNumber}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={isActive ? 'success' : 'destructive'}>
                          {member.membershipStatus}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-medium text-xs">
                        {formatDate(member.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title={isActive ? 'Suspend Membership' : 'Activate Membership'}
                            onClick={() => handleToggleStatus(member)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            title="Edit Member"
                            onClick={() => handleOpenEditModal(member)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete Member"
                            onClick={() => {
                              setDeletingMember(member);
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
        {membersPage && membersPage.totalPages > 1 && (
          <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-800">{membersPage.content.length}</span> of{' '}
              <span className="font-semibold text-slate-800">{membersPage.totalElements}</span> members
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={membersPage.first || isLoading}
                onClick={() => fetchMembers(currentPage - 1, searchQuery)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="px-2 font-medium">
                Page {currentPage + 1} of {membersPage.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={membersPage.last || isLoading}
                onClick={() => fetchMembers(currentPage + 1, searchQuery)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Member Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={editingMember ? 'Edit Member Information' : 'Enroll New Cardholder'}
        description={
          editingMember
            ? 'Update patron contact credentials or membership status.'
            : 'Register a patron for borrowing privileges in the library system.'
        }
        maxWidth="md"
      >
        <form onSubmit={handleSaveMember} className="space-y-4">
          <Input
            label="Membership Card ID"
            placeholder="e.g. LIB-2024-001"
            required
            disabled={!!editingMember}
            value={formData.membershipId}
            onChange={(e) => setFormData({ ...formData, membershipId: e.target.value })}
            error={formErrors.membershipId}
          />

          <Input
            label="Full Name"
            placeholder="e.g. Dr. Eleanor Vance"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={formErrors.fullName}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. eleanor.vance@university.edu"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
          />

          <Input
            label="Phone Number"
            placeholder="e.g. +1-555-019-2831"
            value={formData.phoneNumber || ''}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />

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
              {editingMember ? 'Update Profile' : 'Enroll Cardholder'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Member De-registration"
        description="Are you sure you want to delete this member account?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Restricted Operation</span>
            </div>
            <p className="mt-1">
              Member: <strong>{deletingMember?.fullName}</strong> ({deletingMember?.membershipId})
            </p>
            <p className="mt-1">
              Members with currently active or unreturned loans cannot be deleted until all loans are settled.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              isLoading={isSubmitting}
              onClick={handleDeleteMember}
            >
              Delete Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

