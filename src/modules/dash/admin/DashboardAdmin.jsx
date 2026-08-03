import { Link } from 'react-router-dom';
import { Users, Box, FileText, ShoppingBag } from 'lucide-react';

/**
 * DashboardAdmin component displays the admin dashboard with access to key sections.
 * 
 * @returns {JSX.Element} Renders the admin dashboard with navigation links.
 */
import { useSelector } from 'react-redux';
// ClientsPanel and ProductsPanel removed: admin dashboard uses cards and calendar
import TasksPanel from '../../tasks/components/TasksPanel';
import TasksCalendar from '../../tasks/components/TasksCalendar';

const DashboardAdmin = () => {
  const user = useSelector((state) => state.auth.user) || JSON.parse(localStorage.getItem('user'));

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        <p className="text-lg text-gray-600 mb-8">Welcome, {user?.name}! Here you can access the main sections of the application.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/clients"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-blue-600">Clients</h2>
            </div>
            <p className="text-gray-600">Manage and view client information.</p>
          </Link>
          
          <Link
            to="/admin/products"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                <Box className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-green-600">Products</h2>
            </div>
            <p className="text-gray-600">Manage and edit products inventory.</p>
          </Link>
          
          <Link
            to="/admin/amazon-shop"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mr-3">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-amber-600">Shop (Amazon)</h2>
            </div>
            <p className="text-gray-600">Manage Amazon Associates product listings shown on the public Shop.</p>
          </Link>
          
          <Link
            to="/invoice"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-purple-600">Invoices</h2>
            </div>
            <p className="text-gray-600">Create and manage invoices.</p>
          </Link>
        </div>
      
        {/* Clients and Products panels removed — top cards provide navigation */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TasksPanel />
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Calendar</h2>
            <TasksCalendar role="admin" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;