import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, List, PlusCircle, LogOut, User } from 'lucide-react';
import ThemePicker from './ThemePicker';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop top nav */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-primary">
                ExpenseTracker
              </Link>
              <div className="hidden sm:flex space-x-1">
                <Link
                  to="/"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/') ? 'bg-primary-light text-primary' : 'text-gray-600 hover-text-primary hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <Link
                  to="/expenses"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/expenses') ? 'bg-primary-light text-primary' : 'text-gray-600 hover-text-primary hover:bg-gray-100'
                  }`}
                >
                  <List size={18} />
                  Expenses
                </Link>
                <Link
                  to="/add"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/add') ? 'bg-primary-light text-primary' : 'text-gray-600 hover-text-primary hover:bg-gray-100'
                  }`}
                >
                  <PlusCircle size={18} />
                  Add Expense
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemePicker />
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <User size={16} />
                {user?.name}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors btn-press"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-8">
        <div className="page-enter">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="sm:hidden bottom-nav">
        <Link to="/" className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}>
          <LayoutDashboard size={22} />
          Dashboard
        </Link>
        <Link to="/expenses" className={`bottom-nav-item ${isActive('/expenses') ? 'active' : ''}`}>
          <List size={22} />
          Expenses
        </Link>
        <Link to="/add" className={`bottom-nav-item ${isActive('/add') ? 'active' : ''}`}>
          <PlusCircle size={22} />
          Add
        </Link>
      </div>
    </div>
  );
}
