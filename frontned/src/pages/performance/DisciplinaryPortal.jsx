import React, { useState, useEffect } from 'react';
import {
    AlertTriangle,
    FileText,
    ShieldAlert,
    ShieldCheck,
    Plus,
    X,
    MessageCircle,
    Gavel,
    Search,
    Filter
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import performanceService from '../../services/performanceService';
import employeeService from '../../services/employeeService';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const DisciplinaryPortal = () => {
    const { t } = useTranslation();
    const { user } = useSelector(state => state.auth);
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isIssueOpen, setIsIssueOpen] = useState(false);

    const [newRecord, setNewRecord] = useState({
        employee_id: '',
        incident_type: '',
        description: '',
        action_taken: 'verbal_warning',
        incident_date: format(new Date(), 'yyyy-MM-dd')
    });

    const isInternalUser = ['admin', 'hr', 'manager'].includes(user.role);

    useEffect(() => {
        fetchRecords();
        if (isInternalUser) fetchEmployees();
    }, []);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const res = await performanceService.getDisciplinaryHistory();
            setRecords(res.data);
        } catch (error) {
            toast.error(t('failedToLoadRecords'));
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await employeeService.getEmployees();
            setEmployees(res.employees || res);
        } catch (error) {
            console.error(error);
        }
    };

    const handleIssueWarning = async (e) => {
        e.preventDefault();
        try {
            await performanceService.issueWarning(newRecord);
            toast.success(t('disciplinaryRecordCreated'));
            setIsIssueOpen(false);
            setNewRecord({
                employee_id: '',
                incident_type: '',
                description: '',
                action_taken: 'verbal_warning',
                incident_date: format(new Date(), 'yyyy-MM-dd')
            });
            fetchRecords();
        } catch (error) {
            toast.error(error.response?.data?.error || t('failedToCreateRecord'));
        }
    };

    const getActionStyle = (action) => {
        switch (action) {
            case 'verbal_warning': return { color: 'text-orange-600', bg: 'bg-orange-50', icon: <MessageCircle size={16} /> };
            case 'written_warning': return { color: 'text-amber-600', bg: 'bg-amber-50', icon: <FileText size={16} /> };
            case 'final_warning': return { color: 'text-red-500', bg: 'bg-red-50', icon: <ShieldAlert size={16} /> };
            case 'suspension': return { color: 'text-red-700', bg: 'bg-red-100', icon: <Gavel size={16} /> };
            case 'termination': return { color: 'text-red-900', bg: 'bg-red-200', icon: <ShieldAlert size={16} /> };
            default: return { color: 'text-gray-600', bg: 'bg-gray-50', icon: <ShieldCheck size={16} /> };
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="bg-red-50 p-5 rounded-3xl">
                        <ShieldAlert className="text-red-600" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('disciplinaryPortal')}</h1>
                        <p className="text-gray-500 font-medium text-lg">{t('managingComplianceAndConduct')}</p>
                    </div>
                </div>
                {isInternalUser && (
                    <button
                        onClick={() => setIsIssueOpen(true)}
                        className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl shadow-gray-200 hover:bg-black transition-all transform hover:-translate-y-1"
                    >
                        <Plus size={20} />
                        {t('issueWarning')}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Search & Filter Header */}
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-50 border border-gray-50 flex flex-wrap gap-4 items-center">
                    <div className="flex-grow relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        <input
                            type="text"
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-gray-100 font-medium text-gray-700"
                            placeholder={t('searchRecordsByEmployeeOrIncident')}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all">
                        <Filter size={18} />
                        {t('filters')}
                    </button>
                </div>

                {/* History Table */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">{t('employee')}</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">{t('incident')}</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">{t('action')}</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">{t('date')}</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center opacity-20">
                                            <ShieldCheck size={64} className="text-gray-400 mb-4" />
                                            <p className="font-bold text-lg">{t('noDisciplinaryRecordsFound')}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                records.map(record => {
                                    const style = getActionStyle(record.action_taken);
                                    return (
                                        <tr key={record.id} className="hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-500">
                                                        {record.Employee?.User?.first_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{record.Employee?.User?.first_name} {record.Employee?.User?.last_name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{record.Employee?.Department?.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-gray-700">{record.incident_type}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-[200px]">{record.description}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs ${style.bg} ${style.color}`}>
                                                    {style.icon}
                                                    {record.action_taken.replace('_', ' ').toUpperCase()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-medium text-gray-500">
                                                {format(new Date(record.incident_date), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${record.status === 'open' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Issue Warning Modal */}
            {isIssueOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900">{t('formalAction')}</h2>
                                <p className="text-gray-400 font-medium">{t('completeInformationToEnsureCompliance')}</p>
                            </div>
                            <button onClick={() => setIsIssueOpen(false)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleIssueWarning} className="p-10 grid grid-cols-2 gap-8">
                            <div className="col-span-1">
                                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">{t('selectEmployee')}</label>
                                <select
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-gray-100 font-bold text-gray-700 appearance-none"
                                    value={newRecord.employee_id}
                                    onChange={(e) => setNewRecord({ ...newRecord, employee_id: e.target.value })}
                                >
                                    <option value="">{t('chooseStaff')}</option>
                                    {employees.map(emp => (
                                        <option key={emp.user_id} value={emp.user_id}>{emp.User?.first_name} {emp.User?.last_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">{t('incidentType')}</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-gray-100 font-bold text-gray-700"
                                    placeholder="e.g. Failure to comply with safety"
                                    value={newRecord.incident_type}
                                    onChange={(e) => setNewRecord({ ...newRecord, incident_type: e.target.value })}
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">{t('actionToBeTaken')}</label>
                                <select
                                    required
                                    className="w-full px-6 py-4 bg-gray-100/50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-gray-100 font-black text-red-600 appearance-none"
                                    value={newRecord.action_taken}
                                    onChange={(e) => setNewRecord({ ...newRecord, action_taken: e.target.value })}
                                >
                                    <option value="verbal_warning">{t('verbalWarning')}</option>
                                    <option value="written_warning">{t('writtenWarning')}</option>
                                    <option value="final_warning">{t('finalWarning')}</option>
                                    <option value="suspension">{t('suspension')}</option>
                                    <option value="termination">{t('termination')}</option>
                                </select>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">{t('incidentDate')}</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-gray-100 font-bold text-gray-700"
                                    value={newRecord.incident_date}
                                    onChange={(e) => setNewRecord({ ...newRecord, incident_date: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">{t('incidentDescription')}</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-gray-100 font-medium text-gray-700 resize-none"
                                    placeholder={t('provideDetailedDescriptionOfConduct')}
                                    value={newRecord.description}
                                    onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2 pt-4">
                                <button
                                    type="submit"
                                    className="w-full py-6 bg-red-600 text-white rounded-3xl font-black text-lg shadow-2xl shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-3"
                                >
                                    <ShieldAlert size={24} />
                                    {t('confirmAndIssueRecord')}
                                </button>
                                <p className="text-center text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest">
                                    {t('thisActionRequiresFinalHRAuditing')}
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisciplinaryPortal;
