/**
 * ClientDetails component displays and manages the details of a single client.
 * 
 * Features:
 * - Fetches client data from the API using the client ID from the URL.
 * - Allows editing and saving of basic client information (company name, address, city, state, zip).
 * - Manages a dynamic list of contacts (add, update, delete).
 * - Displays a list of completed jobs for the client.
 * - Allows adding new jobs with date, description, installed equipment, and notes.
 * - Handles loading and error states.
 * 
 * State Variables:
 * - client: Object containing all client data.
 * - loading: Boolean indicating if data is being fetched.
 * - companyName, address, city, state, zip: Strings for basic info.
 * - contacts: Array of contact objects.
 * - jobs: Array of job objects.
 * - newJobDesc, newJobDate, newJobEquipment, newJobNotes: Strings for new job form.
 * 
 * API Endpoints Used:
 * - GET /clients/:id - Fetch client details.
 * - PUT /clients/:id - Update client basic info and contacts.
 * - POST /clients/:id/jobs - Add a new job for the client.
 * 
 * UI Components Used:
 * - Button: For navigation and actions.
 * - ButtonDelete: For deleting contacts.
 * 
 * @component
 * @returns {JSX.Element} The client details page.
 */
import { useEffect, useState } from 'react';
import { api} from '../../../services';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import ButtonDelete from '../../../components/ui/ButtonDelete';
import toast from 'react-hot-toast';

// const ClientDetails = () => {
export default function ClientDetails() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);


  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [status, setStatus] = useState('active');
  const [contacts, setContacts] = useState([]);
  const [jobs, setJobs] = useState([]);

  // 
  const [newJobDesc, setNewJobDesc] = useState('');
  const [newJobDate, setNewJobDate] = useState('');
  const [newJobEquipment, setNewJobEquipment] = useState('');
  const [newJobNotes, setNewJobNotes] = useState('');

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await api.get(`/clients/${id}`);
        setClient(res.data);
        setCompanyName(res.data.companyName || '');
        setAddress(res.data.address || '');
        setCity(res.data.city || '');
        setState(res.data.state || '');
        setZip(res.data.zip || '');
        setStatus(res.data.status || 'active');
        setContacts(res.data.contacts || []);
        setJobs(res.data.jobs || []);
      } catch (error) {
        console.error('Error fetching client:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  // Save basic info
  const handleSaveBasicInfo = async () => {
    try {
      await api.put(`/clients/${id}`, {
        companyName,
        address,
        city,
        state,
        zip,
        status,
        contacts,
      });
      toast.success('Updated Info');
    } catch (error) {
      toast.error('Error updating client');
      console.error(error);
    }
  };

  // update contact information
  const updateContact = (index, field, value) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
  };

  // add new contact
  const addContact = () => {
    setContacts([...contacts, { name: '', role: '', phone: '', email: '' }]);
  };

  // delete contact
  const removeContact = (index) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
  };

  // add new job
  const addJob = async () => {
    if (!newJobDate || !newJobDesc) {
      toast.error('Date and description are mandatory fields');
      return;
    }
    try {
      const newJob = {
        date: new Date(newJobDate),
        description: newJobDesc,
        equipmentInstalled: newJobEquipment ? newJobEquipment.split(',').map(s => s.trim()) : [],
        notes: newJobNotes,
      };
      const res = await api.post(`/clients/${id}/jobs`, newJob);
      setJobs(res.data.jobs);
      setNewJobDate('');
      setNewJobDesc('');
      setNewJobEquipment('');
      setNewJobNotes('');
      toast.success('Job Added');
    } catch (error) {
      toast.error('Error adding job');
      console.error(error);
    }
  };

  if (loading) return <p className="p-6">Loanding client...</p>;
  if (!client) return <p className="p-6">Client no found</p>;



  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <Button
        onClick={() => navigate(-1)}
      >
        ← Back
      </Button>

      <h2 className="text-3xl font-bold">Client: {companyName || 'No name'}</h2>

      <section className="bg-white p-4 rounded shadow space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Basic Info</h3>
          <input
            type="text"
            placeholder="Company Name o House Name"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="State"
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-20 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="ZIP"
              value={zip}
              onChange={e => setZip(e.target.value)}
              className="w-28 p-2 border rounded"
            />
          </div>

          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full p-2 border rounded mt-2"
          >
            <option value="prospect">Prospect</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <h4 className="text-lg font-semibold mt-4">Contacts</h4>
          {contacts.map((contact, i) => (
            <div key={i} className="border p-3 rounded mb-3 space-y-2">
              <input
                type="text"
                placeholder="Name"
                value={contact.name ?? ''}
                onChange={e => updateContact(i, 'name', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Rol"
                value={contact.role ?? ''}
                onChange={e => updateContact(i, 'role', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={contact.phone ?? ''}
                onChange={e => updateContact(i, 'phone', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={contact.email ?? ''}
                onChange={e => updateContact(i, 'email', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <ButtonDelete
                onClick={() => removeContact(i)}
              >
                Delete Contact
              </ButtonDelete>
            </div>
          ))}
          <Button
            onClick={addContact}
          >
            Add Contact
          </Button>
        </div>
        <Button onClick={handleSaveBasicInfo}  >
          Save
        </Button>
      </section>

      <section className="bg-white p-4 rounded shadow space-y-4">
        <h3 className="text-xl font-semibold">Completed jobs</h3>
        {(jobs?.length ?? 0) === 0 ? (
          <p>No jobs recorded.</p>
        ) : (
          <ul className="space-y-4">
            {jobs.map((job, i) => (
              <li key={job._id || i} className="border p-3 rounded">
                <p><strong>Date:</strong> {new Date(job.date).toLocaleDateString()}</p>
                <p><strong>Descripcion:</strong> {job.description}</p>
                <p><strong>Installed equipment</strong> {job.equipmentInstalled?.join(', ')}</p>
                <p><strong>Notes:</strong> {job.notes}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 border-t pt-4 space-y-4">
          <h4 className="text-lg font-semibold">Add new Job</h4>
          <input
            type="date"
            value={newJobDate}
            onChange={e => setNewJobDate(e.target.value)}
            className="p-2 border rounded w-full max-w-xs"
          />
          <textarea
            placeholder="Descripción"
            value={newJobDesc}
            onChange={e => setNewJobDesc(e.target.value)}
            className="p-2 border rounded w-full max-w-md"
            rows={3}
          />
          <input
            type="text"
            placeholder="Installed equipment (separated by commas)"
            value={newJobEquipment}
            onChange={e => setNewJobEquipment(e.target.value)}
            className="p-2 border rounded w-full max-w-md"
          />
          <textarea
            placeholder="Notes (opcional)"
            value={newJobNotes}
            onChange={e => setNewJobNotes(e.target.value)}
            className="p-2 border rounded w-full max-w-md"
            rows={2}
          />
          <Button
            onClick={addJob}
          >
            Add Job
          </Button>
        </div>
      </section>

      <ButtonDelete
        onClick={async () => {
          toast(
            (t) => (
              <div>
                <p>Are you sure you want to delete this client?</p>
                <div className="mt-2 flex gap-2">
                  <Button
                    onClick={async () => {
                      try {
                        await api.delete(`/clients/${id}`);
                        toast.dismiss(t.id);
                        toast.success('Client deleted');
                        navigate(-1);
                      } catch (error) {
                        toast.dismiss(t.id);
                        toast.error('Error deleting client');
                        console.error(error);
                      }
                    }}
                  >
                    Yes, Delete
                  </Button>
                  <ButtonDelete
                    onClick={() => toast.dismiss(t.id)}
                  >
                    Cancel
                  </ButtonDelete>
                </div>
              </div>
            ),
            { duration: 10000 }
          );
        }}
      >
        Delete Client
      </ButtonDelete>
    </div>
  );
};

// export default ClientDetails;
