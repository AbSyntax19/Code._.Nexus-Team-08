import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './dashboard.css';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Load from localStorage or use defaults
  const [loans, setLoans] = useState(() => {
    const saved = localStorage.getItem('loans');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Education Loan', principal: 500000, rate: 8.5, tenure: 60, monthsPaid: 12 },
      { id: 2, name: 'Personal Loan', principal: 200000, rate: 12, tenure: 36, monthsPaid: 8 }
    ];
  });

  const [expenses, setExpenses] = useState(() => {
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

  const [savingsGoals, setSavingsGoals] = useState(() => {
    const saved = localStorage.getItem('savingsGoals');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Emergency Fund', target: 100000, current: 45000, deadline: '2025-12-31' },
      { id: 2, name: 'Vacation', target: 50000, current: 20000, deadline: '2025-06-30' },
      { id: 3, name: 'New Laptop', target: 80000, current: 60000, deadline: '2025-03-31' }
    ];
  });

  const [monthlyData, setMonthlyData] = useState(() => {
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
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [loanForm, setLoanForm] = useState({ name: '', principal: '', rate: '', tenure: '', monthsPaid: 0 });
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
  const calculateEMI = (principal, rate, tenure) => {
    const r = rate / (12 * 100);
    return (principal * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
  };

  // Calculate total financial metrics
  const calculateMetrics = () => {
    const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.principal, 0);
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
    if (editingItem) {
      setLoans(loans.map(l => l.id === editingItem.id ? { ...loanForm, id: l.id } : l));
    } else {
      const newLoan = { ...loanForm, id: Date.now(), principal: Number(loanForm.principal), rate: Number(loanForm.rate), tenure: Number(loanForm.tenure), monthsPaid: Number(loanForm.monthsPaid) };
      setLoans([...loans, newLoan]);
    }
    closeModal();
  };

  const handleAddExpense = () => {
    if (editingItem) {
      setExpenses(expenses.map(e => e.id === editingItem.id ? { ...expenseForm, id: e.id, amount: Number(expenseForm.amount), budget: Number(expenseForm.budget) } : e));
    } else {
      const newExpense = { ...expenseForm, id: Date.now(), amount: Number(expenseForm.amount), budget: Number(expenseForm.budget) };
      setExpenses([...expenses, newExpense]);
    }
    closeModal();
  };

  const handleAddGoal = () => {
    if (editingItem) {
      setSavingsGoals(savingsGoals.map(g => g.id === editingItem.id ? { ...goalForm, id: g.id, target: Number(goalForm.target), current: Number(goalForm.current) } : g));
    } else {
      const newGoal = { ...goalForm, id: Date.now(), target: Number(goalForm.target), current: Number(goalForm.current) };
      setSavingsGoals([...savingsGoals, newGoal]);
    }
    closeModal();
  };

  const handleDelete = (type, id) => {
    if (type === 'loan') setLoans(loans.filter(l => l.id !== id));
    if (type === 'expense') setExpenses(expenses.filter(e => e.id !== id));
    if (type === 'goal') setSavingsGoals(savingsGoals.filter(g => g.id !== id));
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);

    if (type === 'loan') {
      setLoanForm(item || { name: '', principal: '', rate: '', tenure: '', monthsPaid: 0 });
    } else if (type === 'expense') {
      setExpenseForm(item || { category: '', amount: '', budget: '' });
    } else if (type === 'goal') {
      setGoalForm(item || { name: '', target: '', current: '', deadline: '' });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
  };

  // Colors for charts
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
  const EXPENSE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1'];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="advanced-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>💰 Financial Dashboard</h1>
          <p>Comprehensive view of your financial health</p>
        </div>
        <div className="income-display">
          <span className="income-label">Monthly Income</span>
          {editingIncome ? (
            <div className="income-edit">
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="income-input"
                autoFocus
              />
              <button onClick={() => setEditingIncome(false)} className="btn-save-income">✓</button>
            </div>
          ) : (
            <span className="income-value" onClick={() => setEditingIncome(true)}>
              {formatCurrency(income)}
              <span className="edit-hint">✏️</span>
            </span>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card stat-positive">
          <div className="stat-icon">💎</div>
          <div className="stat-content">
            <span className="stat-label">Net Worth</span>
            <span className="stat-value">{formatCurrency(metrics.netWorth)}</span>
            <span className="stat-change">Assets - Liabilities</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <span className="stat-label">Total EMI</span>
            <span className="stat-value">{formatCurrency(metrics.monthlyEMI)}</span>
            <span className="stat-change">{loans.length} active loans</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-label">Monthly Expenses</span>
            <span className="stat-value">{formatCurrency(metrics.monthlyExpenses)}</span>
            <span className="stat-change">{metrics.budgetUtilization}% of budget</span>
          </div>
        </div>

        <div className="stat-card stat-positive">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-label">Available Cash</span>
            <span className="stat-value">{formatCurrency(metrics.availableCash)}</span>
            <span className="stat-change">{metrics.savingsRate}% savings rate</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
          💳 Loans ({loans.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          📊 Expenses ({expenses.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'savings' ? 'active' : ''}`}
          onClick={() => setActiveTab('savings')}
        >
          🎯 Goals ({savingsGoals.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="charts-grid">
              {/* Income vs Expenses Chart */}
              <div className="chart-card">
                <h3>Monthly Cashflow</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} name="Expenses" />
                    <Line type="monotone" dataKey="savings" stroke="#667eea" strokeWidth={3} name="Savings" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Expense Breakdown Pie Chart */}
              <div className="chart-card">
                <h3>Expense Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenses}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {expenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Budget vs Actual */}
            <div className="chart-card full-width">
              <h3>Budget vs Actual Spending</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="category" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="budget" fill="#a0aec0" name="Budget" />
                  <Bar dataKey="amount" fill="#667eea" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Loans Tab */}
        {activeTab === 'loans' && (
          <div className="loans-content">
            <div className="section-header">
              <h2>Your Loans</h2>
              <button className="btn-add" onClick={() => openModal('loan')}>+ Add Loan</button>
            </div>

            <div className="loans-grid">
              {loans.map((loan) => {
                const emi = calculateEMI(loan.principal, loan.rate, loan.tenure);
                const totalPayment = emi * loan.tenure;
                const totalInterest = totalPayment - loan.principal;
                const progress = ((loan.monthsPaid / loan.tenure) * 100).toFixed(1);
                const monthlyPrincipal = loan.principal / loan.tenure;
                const remainingPrincipal = loan.principal - (monthlyPrincipal * loan.monthsPaid);

                return (
                  <div key={loan.id} className="loan-card">
                    <div className="loan-header">
                      <h3>{loan.name}</h3>
                      <div className="card-actions">
                        <span className="loan-badge">{loan.rate}% APR</span>
                        <button className="btn-icon" onClick={() => openModal('loan', loan)}>✏️</button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete('loan', loan.id)}>🗑️</button>
                      </div>
                    </div>

                    <div className="loan-details">
                      <div className="detail-row">
                        <span>Principal Amount</span>
                        <strong>{formatCurrency(loan.principal)}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Monthly EMI</span>
                        <strong>{formatCurrency(emi)}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Total Interest</span>
                        <strong className="text-warning">{formatCurrency(totalInterest)}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Remaining Balance</span>
                        <strong className="text-danger">{formatCurrency(remainingPrincipal)}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Tenure</span>
                        <strong>{loan.monthsPaid}/{loan.tenure} months</strong>
                      </div>
                    </div>

                    <div className="loan-progress">
                      <div className="progress-header">
                        <span>Repayment Progress</span>
                        <span className="progress-percent">{progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {loans.length > 0 && (
              <div className="chart-card">
                <h3>Loan Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={loans}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="principal"
                    >
                      {loans.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="expenses-content">
            <div className="section-header">
              <h2>Your Expenses</h2>
              <button className="btn-add" onClick={() => openModal('expense')}>+ Add Expense</button>
            </div>

            <div className="expense-categories">
              {expenses.map((expense) => {
                const utilization = ((expense.amount / expense.budget) * 100).toFixed(1);
                const isOverBudget = expense.amount > expense.budget;

                return (
                  <div key={expense.id} className="expense-category-card">
                    <div className="category-header">
                      <h4>{expense.category}</h4>
                      <div className="card-actions">
                        <span className={`category-status ${isOverBudget ? 'over-budget' : 'under-budget'}`}>
                          {isOverBudget ? '⚠️ Over' : '✓ Good'}
                        </span>
                        <button className="btn-icon" onClick={() => openModal('expense', expense)}>✏️</button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete('expense', expense.id)}>🗑️</button>
                      </div>
                    </div>

                    <div className="category-amounts">
                      <div className="amount-item">
                        <span className="amount-label">Spent</span>
                        <span className="amount-value">{formatCurrency(expense.amount)}</span>
                      </div>
                      <div className="amount-item">
                        <span className="amount-label">Budget</span>
                        <span className="amount-value">{formatCurrency(expense.budget)}</span>
                      </div>
                    </div>

                    <div className="category-progress">
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${isOverBudget ? 'over-budget-fill' : ''}`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{utilization}% utilized</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Savings Goals Tab */}
        {activeTab === 'savings' && (
          <div className="savings-content">
            <div className="section-header">
              <h2>Your Savings Goals</h2>
              <button className="btn-add" onClick={() => openModal('goal')}>+ Add Goal</button>
            </div>

            <div className="savings-grid">
              {savingsGoals.map((goal) => {
                const progress = ((goal.current / goal.target) * 100).toFixed(1);
                const remaining = goal.target - goal.current;
                const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                const monthlyRequired = daysLeft > 0 ? (remaining / (daysLeft / 30)).toFixed(0) : 0;

                return (
                  <div key={goal.id} className="savings-goal-card">
                    <div className="goal-header-actions">
                      <div className="goal-icon">🎯</div>
                      <div className="card-actions">
                        <button className="btn-icon" onClick={() => openModal('goal', goal)}>✏️</button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete('goal', goal.id)}>🗑️</button>
                      </div>
                    </div>
                    <h3>{goal.name}</h3>

                    <div className="goal-amounts">
                      <div className="goal-current">
                        <span className="goal-label">Current</span>
                        <span className="goal-value">{formatCurrency(goal.current)}</span>
                      </div>
                      <div className="goal-target">
                        <span className="goal-label">Target</span>
                        <span className="goal-value">{formatCurrency(goal.target)}</span>
                      </div>
                    </div>

                    <div className="goal-progress">
                      <div className="progress-bar">
                        <div className="progress-fill savings-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="progress-text">{progress}% Complete</span>
                    </div>

                    <div className="goal-info">
                      <div className="info-item">
                        <span>📅 Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="info-item">
                        <span>⏰ {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}</span>
                      </div>
                      {daysLeft > 0 && (
                        <div className="info-item">
                          <span>💵 Save {formatCurrency(monthlyRequired)}/month to reach goal</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit' : 'Add'} {modalType === 'loan' ? 'Loan' : modalType === 'expense' ? 'Expense' : 'Savings Goal'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              {modalType === 'loan' && (
                <form onSubmit={(e) => { e.preventDefault(); handleAddLoan(); }}>
                  <div className="form-group">
                    <label>Loan Name</label>
                    <input
                      type="text"
                      value={loanForm.name}
                      onChange={(e) => setLoanForm({ ...loanForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Principal Amount (₹)</label>
                      <input
                        type="number"
                        value={loanForm.principal}
                        onChange={(e) => setLoanForm({ ...loanForm, principal: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Interest Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={loanForm.rate}
                        onChange={(e) => setLoanForm({ ...loanForm, rate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tenure (months)</label>
                      <input
                        type="number"
                        value={loanForm.tenure}
                        onChange={(e) => setLoanForm({ ...loanForm, tenure: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Months Paid</label>
                      <input
                        type="number"
                        value={loanForm.monthsPaid}
                        onChange={(e) => setLoanForm({ ...loanForm, monthsPaid: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn-submit">Save</button>
                  </div>
                </form>
              )}

              {modalType === 'expense' && (
                <form onSubmit={(e) => { e.preventDefault(); handleAddExpense(); }}>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Amount (₹)</label>
                      <input
                        type="number"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Budget (₹)</label>
                      <input
                        type="number"
                        value={expenseForm.budget}
                        onChange={(e) => setExpenseForm({ ...expenseForm, budget: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn-submit">Save</button>
                  </div>
                </form>
              )}

              {modalType === 'goal' && (
                <form onSubmit={(e) => { e.preventDefault(); handleAddGoal(); }}>
                  <div className="form-group">
                    <label>Goal Name</label>
                    <input
                      type="text"
                      value={goalForm.name}
                      onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Target Amount (₹)</label>
                      <input
                        type="number"
                        value={goalForm.target}
                        onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Current Savings (₹)</label>
                      <input
                        type="number"
                        value={goalForm.current}
                        onChange={(e) => setGoalForm({ ...goalForm, current: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Deadline</label>
                    <input
                      type="date"
                      value={goalForm.deadline}
                      onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn-submit">Save</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}