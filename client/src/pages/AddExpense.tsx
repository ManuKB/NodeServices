import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseApi } from '../api';
import { PlusCircle } from 'lucide-react';

export default function AddExpense() {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !date || !amount) {
      setError('All fields are required.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    try {
      await expenseApi.create({ name, date, amount: parsedAmount });
      navigate('/expenses');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in-up">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Add New Expense</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm animate-scale-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus-ring-primary outline-none transition-colors text-base sm:text-sm"
              placeholder="e.g., Groceries, Electricity Bill"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus-ring-primary outline-none transition-colors text-base sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ({'\u20B9'})</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus-ring-primary outline-none transition-colors text-base sm:text-sm"
              placeholder="0.00"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-2.5 sm:py-2 px-4 rounded-lg hover-bg-primary-dark transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 btn-press"
            >
              <PlusCircle size={18} />
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/expenses')}
              className="px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium btn-press"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
