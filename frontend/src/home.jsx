import React, { useState, useEffect, useCallback } from 'react';

// --- SVG Icon Components ---
// Using inline SVGs to avoid extra dependencies. These are for visual flair.

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-red-500 transition-colors duration-200"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4Z"></path><path d="M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h2v-4h-2Z"></path></svg>
);

const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>
);

const ChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
);

// Loading spinner component
const Spinner = () => (
    <div className="flex justify-center items-center p-8 h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
    </div>
);

// --- Main Home Component ---

export default function Home() {
  // --- State Management ---
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- API URL ---
  const API_URL = 'http://127.0.0.1:5000/api/expenses';

  // --- Data Fetching ---
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setExpenses(data);
      } else {
        console.error("API did not return an array:", data);
        setError("Received an invalid response from the server.");
        setExpenses([]);
      }

    } catch (e) {
      setError('Failed to fetch expenses. Please make sure the backend server is running.');
      console.error(e);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // --- Event Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    
    if (!description || !amount || !category) {
        setError('Please fill all fields.');
        return;
    }

    const newExpense = {
        description,
        amount: parseFloat(amount),
        category,
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newExpense),
        });

        if (!response.ok) { throw new Error('Failed to add expense'); }

        setDescription('');
        setAmount('');
        setCategory('Food');
        fetchExpenses(); 

    } catch (e) {
        setError('Failed to add expense.');
        console.error(e);
    }
  };
  
  const handleDelete = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) { throw new Error('Failed to delete expense'); }
        fetchExpenses();
    } catch (e) {
        setError('Failed to delete expense.');
        console.error(e);
    }
  };

  // --- Derived State & Render Logic ---
  const totalExpenses = expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
  
  const expensesByCategory = expenses.reduce((acc, expense) => {
      const { category, amount } = expense;
      if (!acc[category]) {
          acc[category] = 0;
      }
      acc[category] += parseFloat(amount);
      return acc;
  }, {});

  const categoryColors = {
    Food: 'bg-emerald-500',
    Transport: 'bg-blue-500',
    Utilities: 'bg-amber-500',
    Entertainment: 'bg-purple-500',
    Other: 'bg-slate-500',
  };

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-800">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-700">Expense Tracker</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* --- Summary Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                <div className="bg-sky-100 text-sky-600 p-3 rounded-full"><WalletIcon /></div>
                <div>
                    <p className="text-slate-500 text-sm">Total Expenses</p>
                    <p className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                <div className="bg-sky-100 text-sky-600 p-3 rounded-full"><ListIcon /></div>
                <div>
                    <p className="text-slate-500 text-sm">Total Transactions</p>
                    <p className="text-2xl font-bold">{expenses.length}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Left Column: Add Expense & Category Breakdown --- */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                  <input
                    type="text" id="description" value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Coffee with friends"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-slate-600 mb-1">Amount (₹)</label>
                  <input
                    type="number" id="amount" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g., 350.50"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-600 mb-1">Category</label>
                  <select
                    id="category" value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option>Food</option>
                    <option>Transport</option>
                    <option>Utilities</option>
                    <option>Entertainment</option>
                    <option>Other</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 flex items-center justify-center space-x-2">
                  <PlusIcon />
                  <span>Add Expense</span>
                </button>
              </form>
            </div>

            {/* --- Category Breakdown --- */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2"><ChartIcon /> <span>By Category</span></h2>
                <div className="space-y-3">
                    {Object.keys(expensesByCategory).length > 0 ? (
                        Object.entries(expensesByCategory).map(([category, amount]) => (
                            <div key={category}>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                    <span className="font-medium">{category}</span>
                                    <span className="text-slate-500">₹{amount.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                    <div 
                                        className={`${categoryColors[category]} h-2.5 rounded-full`} 
                                        style={{ width: `${(amount / totalExpenses) * 100}%` }}>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-center text-sm py-4">No data for chart yet.</p>
                    )}
                </div>
            </div>
          </div>

          {/* --- Right Column: Expense History --- */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Expense History</h2>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
            {loading ? (
              <Spinner />
            ) : (
              <div className="space-y-3">
                {expenses.length > 0 ? (
                  [...expenses].reverse().map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${categoryColors[expense.category]}`}>
                          {expense.category.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">{expense.description}</p>
                          <p className="text-sm text-slate-500">{expense.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="font-bold text-md text-red-500">-₹{parseFloat(expense.amount).toFixed(2)}</p>
                        <button onClick={() => handleDelete(expense.id)} className="p-2 rounded-full hover:bg-slate-200 group">
                            <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-8">No expenses recorded yet. Add one to get started!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
