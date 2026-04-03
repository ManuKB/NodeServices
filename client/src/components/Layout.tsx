import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, List, PlusCircle, LogOut, User } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                ExpenseTracker
              </Link>
              <div className="hidden sm:flex space-x-4">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <Link
                  to="/expenses"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <List size={18} />
                  Expenses
                </Link>
                <Link
                  to="/add"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <PlusCircle size={18} />
                  Add Expense
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} />
                {user?.name}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-2 flex justify-around">
        <Link to="/" className="flex flex-col items-center text-xs text-gray-600 hover:text-indigo-600">
          <LayoutDashboard size={20} />
          Dashboard
        </Link>
        <Link to="/expenses" className="flex flex-col items-center text-xs text-gray-600 hover:text-indigo-600">
          <List size={20} />
          Expenses
        </Link>
        <Link to="/add" className="flex flex-col items-center text-xs text-gray-600 hover:text-indigo-600">
          <PlusCircle size={20} />
          Add
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
