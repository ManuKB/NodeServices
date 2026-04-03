import { useState, useEffect } from 'react';
import { expenseApi, type Expense } from '../api';
import { Pencil, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', date: '', amount: '' });

  useEffect(() => {
    loadExpenses();
  }, [month, year]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await expenseApi.getAll(month, year);
      setExpenses(res.data);
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseApi.delete(id);
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Failed to delete expense', err);
    }
  };

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditForm({
      name: expense.name,
      date: expense.date,
      amount: expense.amount.toString(),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', date: '', amount: '' });
  };

  const saveEdit = async (id: number) => {
    try {
      const res = await expenseApi.update(id, {
        name: editForm.name,
        date: editForm.date,
        amount: parseFloat(editForm.amount),
      });
      setExpenses(expenses.map((e) => (e.id === id ? res.data : e)));
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update expense', err);
    }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            >
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            >
              {[...Array(5)].map((_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          </div>
          <Link
            to="/add"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            + Add New
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>No expenses found for this period.</p>
            <Link to="/add" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-2 inline-block">
              Add an expense
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      {editingId === expense.id ? (
                        <>
                          <td className="px-6 py-3">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </td>
                          <td className="px-6 py-3">
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </td>
                          <td className="px-6 py-3 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.amount}
                              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                              className="w-28 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">{expense.added_by_name}</td>
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => saveEdit(expense.id)}
                              className="text-green-600 hover:text-green-700 text-sm font-medium mr-2"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{expense.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(expense.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                            {'\u20B9'}{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{expense.added_by_name}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => startEdit(expense)}
                              className="text-indigo-600 hover:text-indigo-700 mr-3"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm text-gray-500">{expenses.length} expense(s)</span>
              <span className="text-lg font-bold text-gray-900">
                Total: {'\u20B9'}{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
