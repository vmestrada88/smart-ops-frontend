/**
 * ClientList component fetches and displays a list of clients.
 *
 * - Fetches client data from the API endpoint `/clients` on mount.
 * - Normalizes client objects to ensure each has a unique `_id` property.
 * - Displays a styled list of clients with company name, address, city, state, zip, and number of contacts.
 * - Each client item is clickable and navigates to the client's detail page using React Router.
 * - Shows a message if no clients are available.
 *
 * @component
 * @returns {JSX.Element} The rendered client list component.
 */
//smartsolution-frontend\src\shared\components\ClientList.jsx

import { useEffect, useState } from 'react';
import { api } from '../../../services';
import { useNavigate } from 'react-router-dom';
import { ShieldUser } from 'lucide-react';

const statusClasses = {
  prospect: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-200 text-gray-700'
};

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/clients');
        const data = Array.isArray(res.data) ? res.data : [];
        const normalized = data.map(c => ({ ...c, _id: c._id ?? c.id }));
        setClients(normalized);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Clients List </h2>
      {clients.length === 0 ? (
        <p>No clients avalible.</p>
      ) : (
        <ul className="divide-y divide-gray-300 border border-gray-300 rounded">
          {clients.map(client => {
            const cid = String(client._id || client.id);
            return (
              <li
                key={cid}
                className="p-4 hover:bg-teal-100 cursor-pointer flex items-start gap-3"
                onClick={() => navigate(`/clients/${cid}`)}
              >
                <ShieldUser className="text-teal-600 mt-1" size={24} />
                <div>
                  <h3 className="text-xl font-semibold">{client.companyName || 'No Name'}</h3>
                  <p>{client.address}, {client.city}, {client.state} {client.zip}</p>
                  <p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusClasses[client.status] || statusClasses.active}`}>
                      {(client.status || 'active').toUpperCase()}
                    </span>
                  </p>
                  <p>Contacts: {client.contacts?.length ?? 0}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ClientList;
