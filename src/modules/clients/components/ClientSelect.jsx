/* ClientSelect component for selecting a client from a dropdown list.
 *
 * Fetches clients from the API and displays them in a select input.
 * When a client is selected, calls the onSelectClient callback with the selected client object.
 *
 * @component
 * @param {Object} props
 * @param {function} props.onSelectClient - Callback function called with the selected client object.
 * @returns {JSX.Element} The rendered client select dropdown.
 */
import { useEffect, useState } from 'react';
import { api } from '../../../services';
import CreateClientForm from './CreateClientForm';

const ClientSelect = ({ onSelectClient, selectedClientId: initialSelectedClientId = '' }) => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCreateClient, setShowCreateClient] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      const data = Array.isArray(res.data) ? res.data : [];
      const normalized = data.map((c) => ({ ...c, _id: c._id ?? c.id }));
      setClients(normalized);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  useEffect(() => {
    setSelectedClientId(initialSelectedClientId ? String(initialSelectedClientId) : '');
  }, [initialSelectedClientId]);

  useEffect(() => {
    if (!selectedClientId) {
      setSearchTerm('');
      return;
    }

    const selectedClient = clients.find(c => String(c._id ?? c.id) === String(selectedClientId));
    if (selectedClient) {
      setSearchTerm(selectedClient.companyName || selectedClient.name || selectedClient.address || '');
    }
  }, [selectedClientId, clients]);

  useEffect(() => {
    fetchClients();
  }, []);

  const selectClient = (client) => {
    if (!client) return;
    const clientId = String(client._id ?? client.id);
    setSelectedClientId(clientId);
    setSearchTerm(client.companyName || client.name || client.address || '');
    setShowSuggestions(false);

    if (onSelectClient) {
      onSelectClient(client);
    }
  };

  const filteredClients = clients.filter((client) => {
    const label = (client.companyName || client.name || client.address || '').toLowerCase();
    return label.includes(searchTerm.toLowerCase());
  });

  const handleClientCreated = async (createdClient) => {
    const normalizedClient = createdClient?.client || createdClient;
    await fetchClients();

    const createdId = String(normalizedClient?._id ?? normalizedClient?.id ?? '');
    if (!createdId) {
      setShowCreateClient(false);
      return;
    }

    setSelectedClientId(createdId);
    setSearchTerm(normalizedClient.companyName || normalizedClient.name || normalizedClient.address || '');
    setShowCreateClient(false);
    setShowSuggestions(false);

    if (onSelectClient) {
      onSelectClient({ ...normalizedClient, _id: normalizedClient?._id ?? normalizedClient?.id });
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-bold">Select Client:</label>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
            if (!e.target.value) {
              setSelectedClientId('');
              if (onSelectClient) onSelectClient(null);
            }
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Type client name to search..."
          className="w-full p-2 border rounded"
        />

        {showSuggestions && (
          <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-md max-h-60 overflow-auto">
            <button
              type="button"
              onMouseDown={() => {
                setShowCreateClient(true);
                setShowSuggestions(false);
              }}
              className="w-full text-left px-3 py-2 text-teal-700 hover:bg-teal-50 font-semibold border-b"
            >
              + Add new client
            </button>

            {filteredClients.length > 0 ? (
              filteredClients.map((client) => {
                const cid = String(client._id ?? client.id);
                const label = client.companyName || client.name || client.address;
                return (
                  <button
                    key={cid}
                    type="button"
                    onMouseDown={() => selectClient(client)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50"
                  >
                    {label}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No clients found</div>
            )}
          </div>
        )}
      </div>

      {showCreateClient && (
        <div className="mt-4 p-3 border border-gray-300 rounded bg-gray-50">
          <CreateClientForm
            onSuccess={handleClientCreated}
            onCancel={() => setShowCreateClient(false)}
            hideTitle
            className="p-0"
          />
        </div>
      )}
    </div>
  );
};

export default ClientSelect;