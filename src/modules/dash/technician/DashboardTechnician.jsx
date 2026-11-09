import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import TasksCalendar from '../../tasks/components/TasksCalendar';
import TasksCard from '../../tasks/components/TasksCard';
import { fetchUsers as fetchUsersService } from '../../../services/usersService';

/**
 * DashboardTechnician component displays the technician dashboard.
 * 
 * @returns {JSX.Element} Renders the technician dashboard with access to products and calendar.
 */
const DashboardTechnician = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]);
  const clients = useSelector(state => state.clients.items);

  useEffect(() => {
    (async () => {
      try {
        const u = await fetchUsersService();
        setUsers(u);
      } catch (err) {
        console.warn('Failed to fetch users for technician board', err);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Technician Dashboard</h1>
        <p className="text-lg text-gray-600 mb-8">Welcome, {user?.name}! Access your assigned tasks and products.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/products"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <h2 className="text-xl font-semibold text-green-600 mb-2">Products</h2>
            <p className="text-gray-600">View and manage products.</p>
          </Link>

          <Link
            to="/products"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <h2 className="text-xl font-semibold text-green-600 mb-2">Truck Inventory</h2>
            <p className="text-gray-600">View the truck inventory (read-only).</p>
          </Link>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-orange-600 mb-2">Calendar</h2>
            <p className="text-gray-600">View assigned jobs and technicians' schedule.</p>
            <div className="mt-4">
              <TasksCalendar role="technician" userId={user?.id} onTaskSelect={(t) => setSelectedTask(t)} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">Tarea</h2>
            <p className="text-gray-600">Detalles de la tarea seleccionada.</p>
            <div className="mt-4">
              <TasksCard task={selectedTask} users={users} clients={clients} onClose={() => setSelectedTask(null)} onSaved={() => { setSelectedTask(null); }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTechnician;