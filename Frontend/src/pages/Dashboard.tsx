import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Wallet, Target, TrendingUp, DollarSign, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

interface Loan {
  id: number;
  name: string;
  principal: number;
  rate: number;
  tenure: number;
  monthsPaid: number;
}

interface Expense {
  id: number;
  category: string;
  amount: number;
  budget: number;
}

interface SavingsGoal {
  id: number;
  name: string;
  target: number;
  current: number;
  deadline: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

type EditingItem = Loan | Expense | SavingsGoal;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Load from localStorage or use defaults
  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('loans');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Education Loan', principal: 500000, rate: 8.5, tenure: 60, monthsPaid: 12 },
      { id: 2, name: 'Personal Loan', principal: 200000, rate: 12, tenure: 36, monthsPaid: 8 }
    ];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [
      { id: 1, category: 'Food', amount: 8000, budget: 10000 },
      { id: 2, category: 'Transport', amount: 5000, budget: 6000 },
      { id: 3, category: 'Entertainment', amount: 4000, budget: 5000 },
      { id: 4, category: 'Utilities', amount: 3000, budget: 4000 },
      { id: 5, category: 'Healthcare', amount: 2000, budget: 3000 },
      { id: 6, category: 'Others', amount: 3000, budget: 5000 }
    ];
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('savingsGoals');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Emergency Fund', target: 100000, current: 45000, deadline: '2025-12-31' },
      { id: 2, name: 'Vacation', target: 50000, current: 20000, deadline: '2025-06-30' },
      { id: 3, name: 'New Laptop', target: 80000, current: 60000, deadline: '2025-03-31' }
    ];
  });

  const [monthlyData] = useState<MonthlyData[]>(() => {
    const saved = localStorage.getItem('monthlyData');
    return saved ? JSON.parse(saved) : [
      { month: 'Jan', income: 50000, expenses: 35000, savings: 15000 },
      { month: 'Feb', income: 50000, expenses: 38000, savings: 12000 },
      { month: 'Mar', income: 52000, expenses: 36000, savings: 16000 },
      { month: 'Apr', income: 50000, expenses: 40000, savings: 10000 },
      { month: 'May', income: 55000, expenses: 37000, savings: 18000 },
      { month: 'Jun', income: 50000, expenses: 39000, savings: 11000 }
    ];
  });

  const [income, setIncome] = useState(() => {
    const saved = localStorage.getItem('income');
    return saved ? JSON.parse(saved) : 50000;
  });

  const [editingIncome, setEditingIncome] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);

  // Form states with string values for inputs
  const [loanForm, setLoanForm] = useState({ name: '', principal: '', rate: '', tenure: '', monthsPaid: '' });
  const [expenseForm, setExpenseForm] = useState({ category: '', amount: '', budget: '' });
  const [goalForm, setGoalForm] = useState({ name: '', target: '', current: '', deadline: '' });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('income', JSON.stringify(income));
  }, [income]);

  // Calculate EMI for a loan
  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const r = rate / (12 * 100);
    return (principal * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
  };

  // Calculate total financial metrics
  const calculateMetrics = () => {
    const totalEMI = loans.reduce((sum, loan) => sum + calculateEMI(loan.principal, loan.rate, loan.tenure), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBudget = expenses.reduce((sum, exp) => sum + exp.budget, 0);
    const remainingAfterExpenses = income - totalExpenses - totalEMI;

    const totalRemainingLoan = loans.reduce((sum, loan) => {
      const monthlyPrincipal = loan.principal / loan.tenure;
      return sum + (loan.principal - (monthlyPrincipal * loan.monthsPaid));
    }, 0);

    return {
      totalAssets: savingsGoals.reduce((sum, goal) => sum + goal.current, 0),
      totalLiabilities: totalRemainingLoan,
      netWorth: savingsGoals.reduce((sum, goal) => sum + goal.current, 0) - totalRemainingLoan,
      monthlyEMI: totalEMI,
      monthlyExpenses: totalExpenses,
      availableCash: remainingAfterExpenses,
      budgetUtilization: totalBudget > 0 ? ((totalExpenses / totalBudget) * 100).toFixed(1) : 0,
      savingsRate: income > 0 ? ((remainingAfterExpenses / income) * 100).toFixed(1) : 0
    };
  };

  const metrics = calculateMetrics();

  // CRUD Operations
  const handleAddLoan = () => {
    if (editingItem && 'tenure' in editingItem) {
      setLoans(loans.map(l => l.id === editingItem.id ? { ...l, name: loanForm.name, principal: Number(loanForm.principal), rate: Number(loanForm.rate), tenure: Number(loanForm.tenure), monthsPaid: Number(loanForm.monthsPaid) } : l));
    } else {
      const newLoan: Loan = { id: Date.now(), name: loanForm.name, principal: Number(loanForm.principal), rate: Number(loanForm.rate), tenure: Number(loanForm.tenure), monthsPaid: Number(loanForm.monthsPaid) };
      setLoans([...loans, newLoan]);
    }
    closeModal();
  };

  const handleAddExpense = () => {
    if (editingItem && 'category' in editingItem) {
      setExpenses(expenses.map(e => e.id === editingItem.id ? { ...e, category: expenseForm.category, amount: Number(expenseForm.amount), budget: Number(expenseForm.budget) } : e));
    } else {
      const newExpense: Expense = { id: Date.now(), category: expenseForm.category, amount: Number(expenseForm.amount), budget: Number(expenseForm.budget) };
      setExpenses([...expenses, newExpense]);
    }
    closeModal();
  };

  const handleAddGoal = () => {
    if (editingItem && 'target' in editingItem) {
      setSavingsGoals(savingsGoals.map(g => g.id === editingItem.id ? { ...g, name: goalForm.name, target: Number(goalForm.target), current: Number(goalForm.current), deadline: goalForm.deadline } : g));
    } else {
      const newGoal: SavingsGoal = { id: Date.now(), name: goalForm.name, target: Number(goalForm.target), current: Number(goalForm.current), deadline: goalForm.deadline };
      setSavingsGoals([...savingsGoals, newGoal]);
    }
    closeModal();
  };

  const handleDelete = (type: string, id: number) => {
    if (type === 'loan') setLoans(loans.filter(l => l.id !== id));
    if (type === 'expense') setExpenses(expenses.filter(e => e.id !== id));
    if (type === 'goal') setSavingsGoals(savingsGoals.filter(g => g.id !== id));
  };

  const openModal = (type: string, item: EditingItem | null = null) => {
    setModalType(type);
    setEditingItem(item);

    if (type === 'loan') {
        const loan = item as Loan | null;
      setLoanForm(loan ? { 
          name: loan.name, 
          principal: String(loan.principal), 
          rate: String(loan.rate), 
          tenure: String(loan.tenure), 
          monthsPaid: String(loan.monthsPaid) 
        } : { name: '', principal: '', rate: '', tenure: '', monthsPaid: '' });
    } else if (type === 'expense') {
        const expense = item as Expense | null;
      setExpenseForm(expense ? { 
          category: expense.category, 
          amount: String(expense.amount), 
          budget: String(expense.budget) 
        } : { category: '', amount: '', budget: '' });
    } else if (type === 'goal') {
        const goal = item as SavingsGoal | null;
      setGoalForm(goal ? { 
          name: goal.name, 
          target: String(goal.target), 
          current: String(goal.current), 
          deadline: goal.deadline 
        } : { name: '', target: '', current: '', deadline: '' });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
  };

  // Colors for charts
  const EXPENSE_COLORS = ['#34d399', '#60a5fa', '#a78bfa', '#ffbf24', '#f87171', '#818cf8'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Shared chart props
  const chartProps = {
    contentStyle: { backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' },
    itemStyle: { color: '#f8fafc' },
    labelStyle: { color: '#94a3b8' }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 tracking-tight leading-tight">
              Financial Dashboard
            </h1>
            <p className="text-slate-400 mt-2">Comprehensive view of your financial health</p>
          </div>

          <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-4">
            <span className="text-sm text-slate-400 font-medium uppercase tracking-wide">Monthly Income</span>
            {editingIncome ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="bg-black/30 border border-indigo-500/50 rounded-lg px-3 py-1 text-white w-32 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  autoFocus
                />
                <button onClick={() => setEditingIncome(false)} className="bg-emerald-500/20 text-emerald-400 p-1 rounded-lg hover:bg-emerald-500/30">
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setEditingIncome(true)}>
                <span className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {formatCurrency(income)}
                </span>
                <Edit2 size={14} className="text-slate-500 group-hover:text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {[
            { label: 'Net Worth', value: metrics.netWorth, sub: 'Assets - Liabilities', icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Total EMI', value: metrics.monthlyEMI, sub: `${loans.length} active loans`, icon: DollarSign, color: 'text-rose-400', bg: 'bg-rose-500/10' },
            { label: 'Expenses', value: metrics.monthlyExpenses, sub: `${metrics.budgetUtilization}% of budget`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Available Cash', value: metrics.availableCash, sub: `${metrics.savingsRate}% savings rate`, icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10' }
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.value > 0 ? <TrendingUp size={16} className="text-emerald-500" /> : null}
              </div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(stat.value)}</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-900/50 rounded-xl backdrop-blur-sm border border-white/5 w-fit overflow-x-auto">
          {['overview', 'loans', 'expenses', 'savings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${activeTab === tab
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px] animate-fade-in">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-6">Monthly Cashflow</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip {...chartProps} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="savings" stroke="#6366f1" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-6">Expense Breakdown</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenses as any}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="amount"
                      >
                        {expenses.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip {...chartProps} formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl lg:col-span-2">
                <h3 className="text-lg font-bold text-white mb-6">Budget vs Actual</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenses}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="category" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip {...chartProps} formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="budget" fill="#475569" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Your Loans</h2>
                <button onClick={() => openModal('loan')} className="primary-btn px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Plus size={16} /> Add Loan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loans.map((loan) => {
                  const progress = ((loan.monthsPaid / loan.tenure) * 100).toFixed(1);
                  return (
                    <div key={loan.id} className="glass-card p-6 rounded-2xl group hover:border-indigo-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-white text-lg">{loan.name}</h3>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal('loan', loan)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete('loan', loan.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Principal</span>
                          <span className="text-white font-medium">{formatCurrency(loan.principal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Interest Rate</span>
                          <span className="text-white font-medium">{loan.rate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Tenure</span>
                          <span className="text-white font-medium">{loan.monthsPaid}/{loan.tenure} months</span>
                        </div>
                      </div>

                      <div className="relative pt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Repayment Progress</span>
                          <span className="text-indigo-300">{progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Expenses & Budget</h2>
                <button onClick={() => openModal('expense')} className="primary-btn px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Plus size={16} /> Add Expense
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expenses.map((expense) => {
                  const percent = (expense.amount / expense.budget) * 100;
                  const isOver = percent > 100;

                  return (
                    <div key={expense.id} className="glass-card p-6 rounded-2xl group hover:border-indigo-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-white text-lg">{expense.category}</h3>
                        <div className="flex gap-2">
                          {isOver ? (
                            <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-lg border border-red-500/20">Over Budget</span>
                          ) : (
                            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-lg border border-emerald-500/20">On Track</span>
                          )}
                          <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openModal('expense', expense)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete('expense', expense.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-end mb-2">
                        <span className="text-2xl font-bold text-white">{formatCurrency(expense.amount)}</span>
                        <span className="text-sm text-slate-400 mb-1">of {formatCurrency(expense.budget)}</span>
                      </div>

                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'savings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Savings Goals</h2>
                <button onClick={() => openModal('goal')} className="primary-btn px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Plus size={16} /> Add Goal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savingsGoals.map((goal) => {
                  const percent = (goal.current / goal.target) * 100;
                  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={goal.id} className="glass-card p-6 rounded-2xl group hover:border-indigo-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                          <Target size={20} />
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal('goal', goal)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete('goal', goal.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-white text-lg mb-4">{goal.name}</h3>

                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Saved</span>
                          <span className="text-white font-bold">{formatCurrency(goal.current)}</span>
                        </div>

                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${percent}%` }} />
                        </div>

                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Target: {formatCurrency(goal.target)}</span>
                          <span>{percent.toFixed(0)}%</span>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-slate-400">
                          <span className="text-indigo-400">📅</span>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Dark Theme */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeModal}>
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingItem ? 'Edit' : 'Add'} {modalType === 'loan' ? 'Loan' : modalType === 'expense' ? 'Expense' : 'Goal'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (modalType === 'loan') handleAddLoan();
              else if (modalType === 'expense') handleAddExpense();
              else handleAddGoal();
            }} className="space-y-4">
              {modalType === 'loan' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Loan Name</label>
                    <input className="w-full glass-input px-4 py-2 rounded-lg" value={loanForm.name} onChange={e => setLoanForm({ ...loanForm, name: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-300">Principal</label>
                      <input type="number" className="w-full glass-input px-4 py-2 rounded-lg" value={loanForm.principal} onChange={e => setLoanForm({ ...loanForm, principal: e.target.value })} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-300">Rate (%)</label>
                      <input type="number" step="0.1" className="w-full glass-input px-4 py-2 rounded-lg" value={loanForm.rate} onChange={e => setLoanForm({ ...loanForm, rate: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-300">Tenure (mo)</label>
                      <input type="number" className="w-full glass-input px-4 py-2 rounded-lg" value={loanForm.tenure} onChange={e => setLoanForm({ ...loanForm, tenure: e.target.value })} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-300">Months Paid</label>
                      <input type="number" className="w-full glass-input px-4 py-2 rounded-lg" value={loanForm.monthsPaid} onChange={e => setLoanForm({ ...loanForm, monthsPaid: e.target.value })} required />
                    </div>
                  </div>
                </>
              )}

              {modalType === 'expense' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Category</label>
                    <input className="w-full glass-input px-4 py-2 rounded-lg" value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Amount</label>
                    <input type="number" className="w-full glass-input px-4 py-2 rounded-lg" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Budget</label>
                    <input type="number" className="w-full glass-input px-4 py-2 rounded-lg" value={expenseForm.budget} onChange={e => setExpenseForm({ ...expenseForm, budget: e.target.value })} required />
                  </div>
                </>
              )}

              {modalType === 'goal' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Goal Name</label>
                    <input className="w-full glass-input px-4 py-2 rounded-lg" value={goalForm.name} onChange={e => setGoalForm({ ...goalForm, name: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Target Amount</label>
                    <input type="number" className="w-full glass-input px-4 py-2 rounded-lg" value={goalForm.target} onChange={e => setGoalForm({ ...goalForm, target: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Current Savings</label>
                    <input type="number" className="w-full glass-input px-4 py-2 rounded-lg" value={goalForm.current} onChange={e => setGoalForm({ ...goalForm, current: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Deadline</label>
                    <input type="date" className="w-full glass-input px-4 py-2 rounded-lg text-white" value={goalForm.deadline} onChange={e => setGoalForm({ ...goalForm, deadline: e.target.value })} required />
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4 mt-6 border-t border-white/5">
                <button type="button" onClick={closeModal} className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-lg shadow-indigo-500/20">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
