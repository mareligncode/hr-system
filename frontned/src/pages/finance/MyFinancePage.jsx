import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { motion } from 'framer-motion';
import financeService from '../../services/financeService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { DollarSign, FileText, UploadCloud, Download } from 'lucide-react';

const MyFinancePage = () => {
    const { t } = useSettings();
    const [payslips, setPayslips] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [expenseForm, setExpenseForm] = useState({ amount: '', category: 'Travel', description: '', expense_date: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const payRes = await financeService.getMyPayslips();
            setPayslips(payRes.data);

            const expRes = await financeService.getMyExpenses();
            setExpenses(expRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        try {
            await financeService.submitExpense(expenseForm);
            alert('Expense submitted successfully');
            setExpenseForm({ amount: '', category: 'Travel', description: '', expense_date: new Date().toISOString().split('T')[0] });
            fetchData();
        } catch (error) {
            alert('Failed to submit expense');
        }
    };

    return (
        <div className="pb-20 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)]">{t('myFinancePayslips')}</h1>
                    <p className="text-sm text-[var(--text-soft)]">{t('myFinancePayslipsDesc')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-main)] shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FileText className="text-blue-500" /> {t('myPayslips')}</h2>
                        {loading ? <p>{t('loading')}</p> : payslips.length === 0 ? <p className="text-sm text-[var(--text-soft)]">{t('noPayslipsAvailable') || 'No payslips available.'}</p> : (
                            <div className="space-y-3">
                                {payslips.map(slip => (
                                    <div key={slip.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[var(--bg-surface-soft)] rounded-2xl border border-[var(--border-main)] hover:border-blue-500/30 transition-colors gap-4">
                                        <div>
                                            <div className="font-bold text-sm">{t('period')}: {slip.PayrollPeriod?.start_date} to {slip.PayrollPeriod?.end_date}</div>
                                            <div className="text-[10px] uppercase font-black text-emerald-500 tracking-widest mt-1">{t('netPayable')}: {slip.net_pay} {slip.payment_currency}</div>
                                        </div>
                                        <Button size="sm" variant="secondary" className="w-full sm:w-auto hover:bg-blue-50 text-blue-600">
                                            <Download className="w-4 h-4 mr-2" /> Download PDF
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-main)] shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><UploadCloud className="text-purple-500" /> {t('submitExpense')}</h2>
                        <form onSubmit={handleExpenseSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label={t('amount') || 'Amount'} type="number" step="0.01" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[var(--text-soft)]">Category</label>
                                    <select className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                                        <option>Travel</option>
                                        <option>Meals</option>
                                        <option>Supplies</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <Input label={t('date') || 'Date'} type="date" value={expenseForm.expense_date} onChange={e => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} required />
                            <Input label={t('description')} value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} required />
                            <Button type="submit" className="w-full bg-blue-600 text-white">{t('submitClaim') || 'Submit Claim'}</Button>
                        </form>
                    </div>

                    <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-main)] shadow-sm">
                        <h2 className="text-lg font-bold mb-4">{t('expenseHistory')}</h2>
                        {expenses.length === 0 ? <p className="text-xs text-[var(--text-soft)]">{t('noSubmittedExpenses')}</p> : (
                            <div className="space-y-3">
                                {expenses.map(exp => (
                                    <div key={exp.id} className="flex justify-between items-center text-sm p-3 border-b border-[var(--border-main)]/50 last:border-0">
                                        <div>
                                            <span className="font-semibold block">{exp.category}</span>
                                            <span className="text-[10px] text-[var(--text-soft)]">{exp.expense_date}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold">{exp.amount} {exp.currency}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${exp.status === 'approved' ? 'text-emerald-500' : exp.status === 'rejected' ? 'text-red-500' : 'text-amber-500'}`}>{exp.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyFinancePage;
