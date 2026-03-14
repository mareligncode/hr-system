import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import recruitmentService from '../../services/recruitmentService';
import { useSettings } from '../../context/SettingsContext.jsx';
import {
    DollarSign,
    Calendar,
    Briefcase,
    User,
    ChevronRight,
    Search,
    Filter,
    Loader2,
    History,
    FileCheck,
    XCircle,
    BadgeCheck,
    Clock
} from 'lucide-react';

const OfferManagementPage = () => {
    const { t } = useSettings();
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        fetchOffers();
    }, [filterStatus]);

    const fetchOffers = async () => {
        setLoading(true);
        try {
            const data = await recruitmentService.getOffers({
                status: filterStatus
            });
            setOffers(data);
        } catch (error) {
            console.error('Failed to fetch offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'sent': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'accepted': return 'bg-green-50 text-green-600 border-green-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            case 'expired': return 'bg-gray-50 text-gray-600 border-gray-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const filteredOffers = offers.filter(offer =>
        `${offer.JobApplication?.Applicant?.first_name} ${offer.JobApplication?.Applicant?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.JobApplication?.JobPosting?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-[var(--bg-base)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] mb-2 flex items-center gap-3">
                        <FileCheck className="w-8 h-8 text-emerald-500" />
                        {t('offers')}
                    </h1>
                    <p className="text-[var(--text-soft)] text-lg">
                        {t('manageOffersDescription') || "Track and manage candidate job offers and contracts."}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-[var(--bg-surface)] p-4 rounded-3xl shadow-sm border border-[var(--border-main)] mb-8 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t('searchOffersPlaceholder') || "Search by candidate or job..."}
                        className="w-full pl-12 pr-4 py-3 bg-[var(--bg-surface-soft)] border border-[var(--border-main)] rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-[var(--text-muted)]" />
                    <select
                        className="bg-[var(--bg-surface-soft)] border border-[var(--border-main)] rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-[var(--text-main)] min-w-[160px] outline-none appearance-none cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">{t('allStatuses')}</option>
                        <option value="sent">{t('sent') || "Sent"}</option>
                        <option value="accepted">{t('accepted') || "Accepted"}</option>
                        <option value="rejected">{t('rejected') || "Rejected"}</option>
                        <option value="expired">{t('expired') || "Expired"}</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    <p className="text-[var(--text-soft)] font-medium animate-pulse">{t('loadingOffers') || "Retrieving offer records..."}</p>
                </div>
            ) : filteredOffers.length === 0 ? (
                <div className="text-center py-24 bg-[var(--bg-surface)] rounded-3xl border-2 border-dashed border-[var(--border-main)]">
                    <FileCheck className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-bold text-[var(--text-main)]">{t('noOffersSent')}</h3>
                    <p className="text-[var(--text-soft)] max-w-sm mx-auto mt-2">{t('tryAdjustingSearch')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOffers.map((offer) => (
                        <div
                            key={offer.id}
                            className="bg-[var(--bg-surface)] rounded-3xl p-6 shadow-sm border border-[var(--border-main)] hover:border-emerald-500/50 hover:shadow-xl transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(offer.status)}`}>
                                    {offer.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:scale-110 group-hover:rotate-3">
                                    {offer.JobApplication?.Applicant?.first_name[0]}{offer.JobApplication?.Applicant?.last_name[0]}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-black text-[var(--text-main)] truncate">
                                        {offer.JobApplication?.Applicant?.first_name} {offer.JobApplication?.Applicant?.last_name}
                                    </h3>
                                    <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider truncate">
                                        {offer.JobApplication?.JobPosting?.title}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center text-sm text-[var(--text-soft)] font-medium gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-soft)] flex items-center justify-center">
                                        <DollarSign className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <span className="text-[var(--text-main)] font-black text-lg">
                                        {offer.salary.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)] uppercase mt-1">/ year</span>
                                </div>
                                <div className="flex items-center text-sm text-[var(--text-soft)] font-medium gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-soft)] flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black text-[var(--text-muted)] leading-tight">{t('joiningDate')}</span>
                                        <span>{new Date(offer.joining_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                                <div className="flex items-center text-sm text-[var(--text-soft)] font-medium gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-soft)] flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black text-[var(--text-muted)] leading-tight">{t('expiryDate')}</span>
                                        <span className={new Date(offer.expiry_date) < new Date() ? 'text-red-500 font-bold' : ''}>
                                            {new Date(offer.expiry_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/recruitment/applicants/${offer.job_application_id}`)}
                                className="w-full py-3 bg-[var(--bg-surface-soft)] text-[var(--text-main)] rounded-2xl font-black text-sm hover:bg-[var(--border-main)] transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                {t('viewApplication')}
                                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OfferManagementPage;
