import PropTypes from 'prop-types';

/**
 * ProposalFormModal component displays a modal form for requesting service proposals.
 * Allows users to enter their contact information and submit a proposal request.
 *
 * @param {boolean} showProposalForm - Whether to show the modal
 * @param {Function} setShowProposalForm - Function to toggle modal visibility
 * @param {Object} proposalData - Form data object containing name, contact, address, notes
 * @param {Function} setProposalData - Function to update form data
 * @param {Function} onSubmitProposal - Submit handler for sending proposal request
 * @param {boolean} isSubmitting - Indicates submit is in progress
 */
const ProposalFormModal = ({ showProposalForm, setShowProposalForm, proposalData, setProposalData, onSubmitProposal, isSubmitting }) => {
  if (!showProposalForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">Request Service</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmitProposal();
          }}
          className="space-y-3"
        >
          <input
            type="text"
            placeholder="Name"
            value={proposalData.name}
            onChange={e => setProposalData({ ...proposalData, name: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Phone or Email"
            value={proposalData.contact}
            onChange={e => setProposalData({ ...proposalData, contact: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Address (optional)"
            value={proposalData.address}
            onChange={e => setProposalData({ ...proposalData, address: e.target.value })}
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Notes (optional)"
            value={proposalData.notes}
            onChange={e => setProposalData({ ...proposalData, notes: e.target.value })}
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowProposalForm(false)}
              disabled={isSubmitting}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ProposalFormModal.propTypes = {
  showProposalForm: PropTypes.bool.isRequired,
  setShowProposalForm: PropTypes.func.isRequired,
  proposalData: PropTypes.shape({
    name: PropTypes.string,
    contact: PropTypes.string,
    address: PropTypes.string,
    notes: PropTypes.string
  }).isRequired,
  setProposalData: PropTypes.func.isRequired,
  onSubmitProposal: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

export default ProposalFormModal;