import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    ShieldAlert,
    Calendar,
    Download,
    Plus,
    X,
    Filter,
    Search,
    ChevronDown,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import lmsService from '../../services/lmsService';
import employeeService from '../../services/employeeService';
import { toast } from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';

const ComplianceDashboard = () => {
    const { t } = useTranslation();
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Summary Stats
    const stats = [
        { label: t('activeCertifications'), value: '42', icon: <ShieldCheck className="text-green-500" />, color: 'bg-green-50' },
        { label: t('expiringSoon'), value: '5', icon: <Calendar className="text-orange-500" />, color: 'bg-orange-50' },
        { label: t('expired'), value: '2', icon: <ShieldAlert className="text-red-500" />, color: 'bg-red-50' },
        { label: t('trainingCompletion'), value: '88%', icon: <CheckCircle className="text-blue-500" />, color: 'bg-blue-50' },
    ];

    useEffect(() => {
        fetchCertifications();
    }, []);

    const fetchCertifications = async () => {
        try {
            setLoading(true);
            // Assuming an endpoint or mockup for now
            const res = await lmsService.getCertifications('all');
            setCertifications(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (expiryDate) => {
        if (!expiryDate) return <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{t('permanent')}</span>;

        const days = differenceInDays(new Date(expiryDate), new Date());

        if (days < 0) return <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{t('expired')}</span>;
        if (days < 30) return <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{t('expiringSoon')}</span>;
        return <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{t('valid')}</span>;
    };

    return (
        <div className="p-10 max-w-7xl mx-auto space-y-12">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="p-5 bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-100">
                        <ShieldCheck className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('complianceHub')}</h1>
                        <p className="text-gray-500 font-medium text-lg">{t('trackingSafetyAndServiceStandards')}</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-3xl font-black hover:bg-black transition-all transform hover:-translate-y-1 shadow-2xl shadow-gray-200"
                >
                    <Plus size={20} />
                    {t('uploadCertification')}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-50 border border-gray-50 flex flex-col justify-center relative overflow-hidden group">
                        <div className={`absolute -right-6 -bottom-6 p-10 rounded-full ${stat.color} opacity-40 group-hover:scale-110 transition-transform duration-500`} />
                        <div className="relative z-10 space-y-2">
                            <div className="flex justify-between items-center mb-4">
                                <div className={`p-4 rounded-2xl ${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">{stat.label}</h3>
                            <p className="text-4xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Table Area */}
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden">
                <div className="px-10 py-8 border-b border-gray-50 flex flex-wrap gap-6 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-black text-gray-900">{t('certificationRegistry')}</h2>
                        <span className="bg-gray-100 px-4 py-1.5 rounded-full text-xs font-black text-gray-400">{certifications.length} {t('records')}</span>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                                type="text"
                                className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none w-64"
                                placeholder={t('filterByOwner')}
                            />
                        </div>
                        <button className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-600 transition-colors">
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/30 text-[10px] font-black text-gray-400 uppercase tracking-widest uppercase">
                            <th className="px-10 py-6">{t('professional')}</th>
                            <th className="px-10 py-6">{t('certification')}</th>
                            <th className="px-10 py-6">{t('issuedBy')}</th>
                            <th className="px-10 py-6">{t('expiryDate')}</th>
                            <th className="px-10 py-6 text-right">{t('status')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {certifications.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-10 py-32 text-center">
                                    <div className="flex flex-col items-center opacity-20">
                                        <ShieldCheck size={80} className="text-indigo-200 mb-6" />
                                        <p className="text-xl font-black text-gray-900">{t('noCertificationsRecorded')}</p>
                                        <p className="text-gray-400 mt-2 font-medium">{t('startBuildingYourComplianceRegistry')}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : certifications.map(cert => (
                            <tr key={cert.id} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-100">
                                            {cert.Employee?.User?.first_name?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900">{cert.Employee?.User?.first_name} {cert.Employee?.User?.last_name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{cert.Employee?.Position?.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <p className="font-bold text-gray-800">{cert.certification_name}</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase mt-1">ID: {cert.certificate_number || '---'}</p>
                                </td>
                                <td className="px-10 py-8">
                                    <span className="text-sm font-bold text-gray-500">{cert.issuing_body}</span>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-gray-900">{cert.expiry_date ? format(new Date(cert.expiry_date), 'MMM dd, yyyy') : t('noExpiry')}</span>
                                        <span className="text-[10px] text-gray-300 font-bold uppercase">{t('granted')} {format(new Date(cert.issue_date), 'yyyy')}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    {getStatusBadge(cert.expiry_date)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Critical Alert Banner */}
            <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-10 flex items-center justify-between shadow-xl shadow-red-50">
                <div className="flex items-center gap-8">
                    <div className="p-5 bg-red-500 rounded-3xl text-white animate-pulse">
                        <AlertCircle size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-red-900">{t('urgentActionRequired')}</h3>
                        <p className="text-red-700/70 text-lg font-medium">{t('thereAre2ExpiredCertificationsThatAffectDepartmentEligibility')}</p>
                    </div>
                </div>
                <button className="px-10 py-4 bg-red-600 text-white rounded-[2rem] font-black hover:bg-red-700 transition-all">
                    {t('viewViolations')}
                </button>
            </div>
        </div>
    );
};

export default ComplianceDashboard;
