import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { motion } from 'framer-motion';
import financeService from '../../services/financeService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { DollarSign, CheckCircle2, PlayCircle, Plus, Receipt, Clock } from 'lucide-react';

const PayrollDashboard = () => {
    const { t } = useSettings();
    const [periods, setPeriods] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formPeriod, setFormPeriod] = useState({ start_date: '', end_date: '', description: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const resPeriods = await financeService.getPeriods();
            setPeriods(resPeriods.data.periods || resPeriods.data);

            const resExpenses = await financeService.getPendingExpenses();
            setExpenses(resExpenses.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePeriod = async (e) => {
        e.preventDefault();
        try {
            await financeService.createPeriod(formPeriod);
            fetchData();
        } catch (error) {
            alert('Failed to create payroll period');
        }
    };

    const handleCalculate = async (id) => {
        try {
            await financeService.calculatePayroll(id);
            alert('Calculation initiated successfully.');
            fetchData();
        } catch (error) {
            alert('Failed to calculate');
        }
    };

    const handleApprove = async (id) => {
        try {
            await financeService.approvePayroll(id);
            alert('Payroll approved!');
            fetchData();
        } catch (error) {
            alert('Failed to approve');
        }
    };

    const handleApproveExpense = async (id, status) => {
        try {
            await financeService.approveExpense(id, status);
            fetchData();
        } catch (error) {
            alert('Failed to update expense');
        }
    };

    return (
        <div className="pb-20 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)]">{t('payrollFinance')}</h1>
                    <p className="text-sm text-[var(--text-soft)]">{t('payrollFinanceDesc')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-main)] shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><DollarSign /> {t('payrollPeriods')}</h2>
                        {loading ? <p>{t('loading')}</p> : (
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left min-w-[500px]">
                                    <thead>
                                        <tr className="text-[var(--text-muted)] text-xs uppercase border-b border-[var(--border-main)]">
                                            <th className="pb-3 text-left">{t('period')}</th>
                                            <th className="pb-3 text-left">{t('status')}</th>
                                            <th className="pb-3 text-right">{t('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {periods.map(p => (
                                            <tr key={p.id} className="border-b border-[var(--border-main)]/50 hover:bg-[var(--bg-surface-soft)] transition-colors">
                                                <td className="py-4">
                                                    <div className="font-semibold text-sm">{p.start_date} to {p.end_date}</div>
                                                    <div className="text-xs text-[var(--text-soft)]">{p.description}</div>
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right space-x-2">
                                                    {p.status === 'open' && (
                                                        <Button size="sm" onClick={() => handleCalculate(p.id)} className="bg-blue-600 text-white">
                                                            <PlayCircle className="w-4 h-4 mr-1" /> {t('calculate')}
                                                        </Button>
                                                    )}
                                                    {p.status === 'completed' && (
                                                        <Button size="sm" onClick={() => handleApprove(p.id)} className="bg-emerald-600 text-white">
                                                            <CheckCircle2 className="w-4 h-4 mr-1" /> {t('approve')}
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-main)] shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Receipt /> {t('pendingExpenseClaims')}</h2>
                        {expenses.length === 0 ? <p className="text-sm text-[var(--text-soft)]">{t('noPendingExpenses')}</p> : (
                            <div className="space-y-4">
                                {expenses.map(exp => (
                                    <div key={exp.id} className="flex justify-between items-center p-4 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface-soft)]">
                                        <div>
                                            <div className="font-bold text-sm">{exp.Employee?.User?.first_name} {exp.Employee?.User?.last_name}</div>
                                            <div className="text-xs text-[var(--text-soft)]">{exp.category} - {exp.amount} {exp.currency}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleApproveExpense(exp.id, 'approved')} className="bg-emerald-500/10 text-emerald-600">{t('approve')}</Button>
                                            <Button size="sm" onClick={() => handleApproveExpense(exp.id, 'rejected')} variant="secondary" className="text-red-500">{t('reject')}</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-main)] shadow-sm">
                        <h2 className="text-lg font-bold mb-4">{t('openNewPeriod')}</h2>
                        <form onSubmit={handleCreatePeriod} className="space-y-4">
                            <Input type="date" label={t('startDate')} value={formPeriod.start_date} onChange={(e) => setFormPeriod({ ...formPeriod, start_date: e.target.value })} required />
                            <Input type="date" label={t('endDate')} value={formPeriod.end_date} onChange={(e) => setFormPeriod({ ...formPeriod, end_date: e.target.value })} required />
                            <Input label={t('description')} value={formPeriod.description} onChange={(e) => setFormPeriod({ ...formPeriod, description: e.target.value })} />
                            <Button type="submit" className="w-full bg-blue-600 text-white">{t('createPeriod')}</Button>
                        </form>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl text-white shadow-lg space-y-4">
                        <h2 className="text-lg font-bold">{t('generateOffCycle')}</h2>
                        <p className="text-sm opacity-90">{t('generateOffCycleDesc')}</p>
                        <Button className="w-full bg-white text-indigo-600">{t('runOffCyclePayroll')}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayrollDashboard;
