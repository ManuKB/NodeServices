import { useState, useEffect } from 'react';
import { expenseApi, type Expense } from '../api';
import { Pencil, Trash2, Search, Check, X } from 'lucide-react';
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Expenses</h1>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-gray-400 hidden sm:block" />
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus-ring-primary outline-none text-sm"
            >
              {[
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
              ].map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus-ring-primary outline-none text-sm"
            >
              {[...Array(5)].map((_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          </div>
          <Link
            to="/add"
            className="bg-primary text-white px-4 py-2 rounded-lg hover-bg-primary-dark transition-colors text-sm font-medium btn-press"
          >
            + Add New
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="spinner" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400 animate-fade-in">
          <p>No expenses found for this period.</p>
          <Link to="/add" className="text-primary text-sm font-medium mt-2 inline-block">
            Add an expense
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {expenses.map((expense, idx) => (
              <div
                key={expense.id}
                className={`expense-card animate-fade-in-up stagger-${Math.min(idx + 1, 5)}`}
              >
                {editingId === expense.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus-ring-primary outline-none"
                      placeholder="Expense name"
                    />
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus-ring-primary outline-none"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                        className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus-ring-primary outline-none"
                        placeholder="Amount"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(expense.id)}
                        className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium btn-press flex items-center justify-center gap-1"
                      >
                        <Check size={16} /> Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium text-gray-600 btn-press flex items-center justify-center gap-1"
                      >
                        <X size={16} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{expense.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(expense.date).toLocaleDateString('en-IN')} &middot; {expense.added_by_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
                        {'\u20B9'}{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(expense)}
                          className="text-primary p-1.5 rounded-lg hover:bg-gray-100 btn-press"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-500 p-1.5 rounded-lg hover:bg-red-50 btn-press"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
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
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus-ring-primary outline-none"
                            />
                          </td>
                          <td className="px-6 py-3">
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus-ring-primary outline-none"
                            />
                          </td>
                          <td className="px-6 py-3 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.amount}
                              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                              className="w-28 px-2 py-1 border border-gray-300 rounded text-sm text-right focus-ring-primary outline-none"
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
                              className="text-primary mr-3 btn-press"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="text-red-500 hover:text-red-700 btn-press"
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
          </div>

          {/* Total bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center animate-fade-in-up">
            <span className="text-sm text-gray-500">{expenses.length} expense(s)</span>
            <span className="text-base sm:text-lg font-bold text-gray-900">
              Total: {'\u20B9'}{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
