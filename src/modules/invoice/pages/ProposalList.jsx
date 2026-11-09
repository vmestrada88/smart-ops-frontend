/**
 * ProposalList - List all proposals with status filters
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProposals, updateProposalStatus } from '../../../services/invoiceService';
import toast from 'react-hot-toast';

const STATUS_LABELS = {
  created: 'Created',
  sent: 'Sent',
  archived: 'Archived',
  cancelled: 'Cancelled'
};

const statusBadgeClass = (status) => {
  if (status === 'sent') return 'bg-blue-100 text-blue-800';
  if (status === 'archived') return 'bg-gray-200 text-gray-700';
  if (status === 'cancelled') return 'bg-red-100 text-red-700';
  return 'bg-green-100 text-green-800';
};

export default function ProposalList() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      const data = await fetchProposals();
      setProposals(Array.isArray(data) ? data : []);
    } catch (error) {
      if (String(error?.message || '').toLowerCase().includes('session expired')) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }
      toast.error('Error loading proposals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProposals = proposals.filter((proposal) => {
    if (filter === 'all') return true;
    return proposal.status === filter;
  });

  const handleStatusChange = async (proposalId, nextStatus) => {
    const current = proposals.find((p) => p.id === proposalId);
    if (!current || current.status === nextStatus) return;

    setUpdatingStatusId(proposalId);

    try {
      await updateProposalStatus(proposalId, nextStatus);
      setProposals((prev) => prev.map((p) => (p.id === proposalId ? { ...p, status: nextStatus } : p)));
      toast.success('Proposal status updated');
    } catch (error) {
      console.error(error);
      toast.error('Error updating proposal status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Proposals</h1>
          <p className="text-gray-600 mt-1">Manage and track your proposals</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/invoices"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            View Invoices
          </Link>
          <Link
            to="/invoice"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md"
          >
            + Create Proposal
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({proposals.length})
        </button>
        {Object.keys(STATUS_LABELS).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {STATUS_LABELS[status]} ({proposals.filter((p) => p.status === status).length})
          </button>
        ))}
      </div>

      {filteredProposals.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No proposals found</h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' ? 'Get started by creating your first proposal' : `No ${filter} proposals at the moment`}
          </p>
          {filter === 'all' && (
            <Link
              to="/invoice"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Create Proposal
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{proposal.proposalNumber || `#${proposal.id}`}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{proposal.clientInfoName || proposal.client?.companyName || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">${Number(proposal.total || 0).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass(proposal.status)}`}>
                        {STATUS_LABELS[proposal.status] || 'Created'}
                      </span>
                      <select
                        value={proposal.status || 'created'}
                        onChange={(e) => handleStatusChange(proposal.id, e.target.value)}
                        disabled={updatingStatusId === proposal.id}
                        className="border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
                      >
                        {Object.entries(STATUS_LABELS).map(([statusKey, label]) => (
                          <option key={statusKey} value={statusKey}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/proposals/${proposal.id}/edit`}
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
