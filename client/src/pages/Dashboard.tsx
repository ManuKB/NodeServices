import { useState, useEffect } from 'react';
import { expenseApi, type MonthlySummary, type Expense } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, IndianRupee, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function Dashboard() {
  const [summary, setSummary] = useState<MonthlySummary[]>([]);
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState<Expense[]>([]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, expensesRes] = await Promise.all([
        expenseApi.getSummary(year),
        expenseApi.getAll(
          (new Date().getMonth() + 1).toString(),
          new Date().getFullYear().toString()
        ),
      ]);
      setSummary(summaryRes.data);
      setCurrentMonthExpenses(expensesRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = MONTH_NAMES.map((name, i) => {
    const monthNum = (i + 1).toString().padStart(2, '0');
    const found = summary.find((s) => s.month === monthNum);
    return { name, total: found ? found.total : 0, count: found ? found.count : 0 };
  });

  const totalExpenses = summary.reduce((sum, s) => sum + s.total, 0);
  const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgMonthly = summary.length > 0 ? totalExpenses / summary.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {[...Array(5)].map((_, i) => {
            const y = new Date().getFullYear() - i;
            return <option key={y} value={y}>{y}</option>;
          })}
        </select>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <IndianRupee size={24} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {'\u20B9'}{currentMonthTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Yearly Total ({year})</p>
              <p className="text-2xl font-bold text-gray-900">
                {'\u20B9'}{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-3 rounded-lg">
              <Calendar size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Monthly ({year})</p>
              <p className="text-2xl font-bold text-gray-900">
                {'\u20B9'}{avgMonthly.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly trend chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Expense Trend ({year})</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
              <YAxis tick={{ fill: '#6b7280' }} />
              <Tooltip
                formatter={(value) => [`\u20B9${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Total']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Current month expenses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Current Month Expenses ({currentMonthExpenses.length})
          </h2>
          <Link
            to="/expenses"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {currentMonthExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No expenses this month.</p>
            <Link to="/add" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-2 inline-block">
              Add your first expense
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-medium text-gray-500">Name</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="pb-3 text-sm font-medium text-gray-500 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {currentMonthExpenses.slice(0, 5).map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100">
                    <td className="py-3 text-sm text-gray-900">{expense.name}</td>
                    <td className="py-3 text-sm text-gray-600">
                      {new Date(expense.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 text-sm text-gray-900 text-right font-medium">
                      {'\u20B9'}{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
