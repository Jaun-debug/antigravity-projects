'use client';

import { useState, useEffect } from 'react';
import { LucideIcon, PlusCircle, Trash2, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function App() {
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [savingsGoal, setSavingsGoal] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [analyticsData, setAnalyticsData] = useState([]);
  
  useEffect(() => {
    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    setTotalExpenses(total);
    // Update analytics data here if needed
  }, [expenses]);

  const handleAddExpense = () => {
    if (expenseAmount && expenseCategory) {
      setExpenses([...expenses, { amount: parseFloat(expenseAmount), category: expenseCategory }]);
      setExpenseAmount('');
      setExpenseCategory('');
    }
  };

  const handleDeleteExpense = (index: number) => {
    const newExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(newExpenses);
  };

  return (
    <div className="bg-white text-black min-h-screen flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-2xl mb-8 mt-12">
        <h1 className="text-4xl font-bold text-center">Student Budget Tracker</h1>
        <p className="text-center text-gray-600 mt-2">Manage your income, expenses, and savings goals effortlessly.</p>
      </header>
      
      <motion.div className="w-full max-w-2xl bg-gray-50 rounded-xl shadow p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Income</h2>
        <input
          type="number"
          value={income || ''}
          onChange={(e) => setIncome(parseFloat(e.target.value))}
          placeholder="Enter your total income"
          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none mb-4 bg-white"
        />
      </motion.div>

      <motion.div className="w-full max-w-2xl bg-gray-50 rounded-xl shadow p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Add Expense</h2>
        <div className="flex mb-4 gap-2">
          <input
            type="text"
            value={expenseCategory}
            onChange={(e) => setExpenseCategory(e.target.value)}
            placeholder="Category"
            className="flex-1 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          />
          <input
            type="number"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            placeholder="Amount"
            className="flex-1 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          />
          <button onClick={handleAddExpense} className="px-6 bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center text-white rounded font-medium shadow">
            <PlusCircle className="w-5 h-5 mr-2" /> Add
          </button>
        </div>
        <ul className="list-disc pl-5 mt-6 space-y-3">
          {expenses.map((expense, index) => (
            <li key={index} className="flex justify-between items-center bg-white p-3 rounded shadow hover:shadow-md transition border border-gray-100 ml-[-20px] pl-4 list-none">
              <span className="font-medium text-gray-800">{expense.category}: <span className="text-gray-500 ml-1 font-normal">${expense.amount.toFixed(2)}</span></span>
              <button onClick={() => handleDeleteExpense(index)} className="text-red-500 hover:text-red-600 transition p-2 hover:bg-red-50 rounded">
                <Trash2 className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div className="w-full max-w-2xl bg-gray-50 rounded-xl shadow p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Savings Goal</h2>
        <input
          type="number"
          value={savingsGoal || ''}
          onChange={(e) => setSavingsGoal(parseFloat(e.target.value))}
          placeholder="Enter your savings goal"
          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none mb-6 bg-white"
        />
        <div className="flex justify-between bg-blue-50 p-4 rounded text-blue-900 border border-blue-100 font-medium">
          <span>Total Expenses: ${totalExpenses.toFixed(2)}</span>
          <span>Remaining: ${Math.max(0, income - totalExpenses).toFixed(2)}</span>
        </div>
      </motion.div>

      <motion.div className="w-full max-w-2xl bg-gray-50 rounded-xl shadow p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
        <BarChart2 className="w-12 h-12 mx-auto mb-4 text-blue-500" />
        <p className="text-center text-gray-600 max-w-md mx-auto">Visualize your spending habits and make informed decisions.</p>
      </motion.div>
    </div>
  );
}
