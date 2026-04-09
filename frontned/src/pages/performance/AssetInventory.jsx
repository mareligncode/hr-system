import React, { useState, useEffect } from 'react';
import {
    Laptop,
    Smartphone,
    Truck,
    Umbrella,
    Package,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    Filter,
    Search,
    ChevronDown,
    MoreVertical,
    History,
    ExternalLink
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import welfareService from '../../services/welfareService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const AssetInventory = () => {
    const { t } = useTranslation();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        fetchAssets();
    }, [filterCategory]);

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const params = filterCategory !== 'all' ? { category: filterCategory } : {};
            const res = await welfareService.getAssets(params);
            setAssets(res.data);
        } catch (error) {
            toast.error(t('failedToLoadAssets'));
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'electronics': return <Laptop className="text-blue-500" />;
            case 'vehicle': return <Truck className="text-orange-500" />;
            case 'uniform': return <Umbrella className="text-green-500" />;
            case 'smartphone': return <Smartphone className="text-purple-500" />;
            default: return <Package className="text-gray-500" />;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'available': return 'bg-green-50 text-green-600';
            case 'assigned': return 'bg-blue-50 text-blue-600';
            case 'maintenance': return 'bg-amber-50 text-amber-600';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    return (
        <div className="p-10 max-w-[1600px] mx-auto space-y-12">
            <div className="flex justify-between items-end">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
                        <Package size={14} />
                        {t('corporateResources')}
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 leading-tight">{t('assetInventory')}</h1>
                    <p className="text-gray-400 font-medium text-lg italic max-w-xl">{t('meticulousTrackingOfCompanyPropertyFromSliconToStitch')}</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[2rem] font-black shadow-2xl shadow-gray-200 hover:bg-black transition-all">
                        <Plus size={20} />
                        {t('registerAsset')}
                    </button>
                </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                    { label: t('totalAssets'), value: assets.length, icon: <Package />, color: 'bg-gray-50' },
                    { label: t('deployed'), value: assets.filter(a => a.status === 'assigned').length, icon: <CheckCircle2 className="text-green-500" />, color: 'bg-green-50/50' },
                    { label: t('inMaintenance'), value: '3', icon: <AlertCircle className="text-amber-500" />, color: 'bg-amber-50/50' },
                    { label: t('auditScore'), value: '98%', icon: <History className="text-indigo-500" />, color: 'bg-indigo-50/50' },
                ].map((stat, i) => (
                    <div key={i} className={`p-8 rounded-[2.5rem] ${stat.color} flex items-center justify-between group cursor-default transition-all hover:scale-[1.02]`}>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-4xl font-black text-gray-900 leading-none">{stat.value}</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl shadow-sm text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter & Search */}
            <div className="flex flex-wrap items-center gap-6 bg-white p-6 rounded-[3rem] shadow-xl shadow-gray-50 border border-gray-100">
                <div className="flex-grow relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input
                        type="text"
                        placeholder={t('searchByTagSerialOrName')}
                        className="w-full pl-16 pr-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-medium"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'electronics', 'vehicle', 'uniform'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                    Array(8).fill(0).map((_, i) => <div key={i} className="h-64 bg-gray-50 rounded-[3rem] animate-pulse" />)
                ) : assets.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-4 opacity-30">
                        <Package size={64} className="mx-auto" />
                        <h3 className="text-2xl font-black uppercase tracking-widest">{t('noAssetsFound')}</h3>
                    </div>
                ) : assets.map((asset, i) => (
                    <div
                        key={asset.id}
                        className="bg-white rounded-[3rem] border border-gray-100 p-8 space-y-6 hover:shadow-2xl hover:shadow-indigo-50 transition-all group overflow-hidden relative"
                    >
                        {/* Status Float */}
                        <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl font-black text-[9px] uppercase tracking-widest ${getStatusStyle(asset.status)}`}>
                            {asset.status}
                        </div>

                        <div className="flex justify-between items-start">
                            <div className="p-5 bg-gray-50 rounded-[1.5rem] group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                {getCategoryIcon(asset.category)}
                            </div>
                            <button className="text-gray-300 hover:text-gray-900">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{asset.asset_tag}</p>
                            <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{asset.name}</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-tighter">SN: {asset.serial_number || '---'}</p>
                        </div>

                        <div className="pt-6 border-t border-gray-50 space-y-4">
                            {asset.AssetAssignments?.[0] ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-black text-indigo-600 text-xs">
                                        {asset.AssetAssignments[0].Employee?.User?.first_name?.[0]}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{t('assignedTo')}</p>
                                        <p className="text-xs font-bold text-gray-700">{asset.AssetAssignments[0].Employee?.User?.first_name} {asset.AssetAssignments[0].Employee?.User?.last_name}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-green-500">
                                    <CheckCircle2 size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t('readyForDeployment')}</span>
                                </div>
                            )}

                            <button className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-2">
                                <History size={14} />
                                {t('viewLifecycle')}
                                <ExternalLink size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssetInventory;
