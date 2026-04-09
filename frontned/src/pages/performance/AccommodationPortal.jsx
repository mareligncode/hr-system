import React, { useState, useEffect } from 'react';
import {
    Home,
    Users,
    Wifi,
    Zap,
    ShieldCheck,
    Plus,
    X,
    Filter,
    Search,
    ChevronDown,
    Droplets,
    Wind,
    Settings,
    MoreHorizontal
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import welfareService from '../../services/welfareService';
import { toast } from 'react-hot-toast';

const AccommodationPortal = () => {
    const { t } = useTranslation();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await welfareService.getAccommodations();
            setRooms(res.data);
        } catch (error) {
            toast.error(t('failedToLoadRooms'));
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (room) => {
        const isFull = room.occupancy_count >= room.capacity;
        if (room.status === 'maintenance') return { label: t('maintenance'), color: 'text-amber-600', bg: 'bg-amber-100/50' };
        if (isFull) return { label: t('fullyOccupied'), color: 'text-red-500', bg: 'bg-red-50' };
        return { label: `${room.capacity - room.occupancy_count} ${t('spotsLeft')}`, color: 'text-green-600', bg: 'bg-green-50' };
    };

    return (
        <div className="p-10 max-w-[1600px] mx-auto space-y-12">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter">{t('staffHousingPortal')}</h1>
                    <p className="text-gray-400 font-medium text-xl mt-3 max-w-2xl">{t('managingResidentsAndMaintenanceAcrossAllCorporateBuildings')}</p>
                </div>
                <div className="flex gap-4">
                    <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm">
                        <Settings size={24} />
                    </button>
                    <button className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-[2rem] font-black shadow-2xl shadow-gray-200 hover:bg-black transition-all">
                        <Plus size={20} />
                        {t('addBuildingOrRoom')}
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                {/* Lateral Navigation - Building List */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-gray-300 uppercase tracking-[0.2em] mb-8">{t('locations')}</h3>
                    {['Royal Residences', 'Palm Court', 'Staff Village A', 'The Annex'].map((b, i) => (
                        <div key={i} className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between ${i === 0 ? 'bg-white border-gray-900 shadow-xl' : 'bg-gray-50 border-transparent text-gray-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${i === 0 ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-300'}`}>
                                    <Home size={20} />
                                </div>
                                <span className={`font-black uppercase tracking-widest text-xs ${i === 0 ? 'text-gray-900' : ''}`}>{b}</span>
                            </div>
                            <span className="text-[10px] font-black">{i === 0 ? '24 Units' : '---'}</span>
                        </div>
                    ))}

                    <div className="pt-10 space-y-4">
                        <h3 className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">{t('amenitiesOverview')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: <Wifi size={14} />, label: t('highSpeedWifi') },
                                { icon: <Zap size={14} />, label: t('maintenance') },
                                { icon: <Wind size={14} />, label: t('hvac') },
                                { icon: <Droplets size={14} />, label: t('dailyCleaning') },
                            ].map((a, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                                    <div className="p-1.5 bg-gray-50 rounded-md">{a.icon}</div>
                                    {a.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="xl:col-span-3 space-y-8">
                    <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-50 border border-gray-50">
                        <div className="flex items-center gap-6">
                            <h2 className="text-2xl font-black text-gray-900">{t('royalResidences')}</h2>
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <div className="flex gap-4">
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input type="text" className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold outline-none" placeholder={t('findRoomOrUser')} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            Array(6).fill(0).map((_, i) => <div key={i} className="h-72 bg-gray-50 rounded-[3rem] animate-pulse" />)
                        ) : rooms.map((room, i) => {
                            const status = getStatusInfo(room);
                            return (
                                <div key={room.id} className="bg-white rounded-[3rem] border border-gray-100 p-8 space-y-6 hover:shadow-2xl transition-all group relative overflow-hidden">
                                    {/* Status Overlay */}
                                    <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl font-black text-[9px] uppercase tracking-widest ${status.bg} ${status.color}`}>
                                        {status.label}
                                    </div>

                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{room.room_type}</p>
                                            <h3 className="text-3xl font-black text-gray-900 leading-none">{room.room_number}</h3>
                                        </div>
                                        <button className="text-gray-200 hover:text-gray-900">
                                            <MoreHorizontal />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-3">
                                            {room.Employees?.map((emp, j) => (
                                                <div
                                                    key={j}
                                                    title={`${emp.User?.first_name} ${emp.User?.last_name}`}
                                                    className="w-10 h-10 bg-indigo-500 border-2 border-white rounded-xl flex items-center justify-center text-[10px] font-black text-white cursor-pointer hover:translate-y-[-4px] transition-transform"
                                                >
                                                    {emp.User?.first_name?.[0]}
                                                </div>
                                            ))}
                                            {Array(Math.max(0, room.capacity - (room.Employees?.length || 0))).fill(0).map((_, j) => (
                                                <div key={j} className="w-10 h-10 bg-gray-50 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center text-gray-200">
                                                    <Plus size={14} />
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                                            {room.occupancy_count} / {room.capacity} {t('residents')}
                                        </span>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                                        <button className="flex items-center justify-center gap-2 py-4 bg-gray-50 rounded-2xl font-black text-[10px] text-gray-400 uppercase hover:bg-gray-100 transition-all">
                                            <Users size={14} />
                                            {t('assignStaff')}
                                        </button>
                                        <button className="flex items-center justify-center gap-2 py-4 bg-gray-50 rounded-2xl font-black text-[10px] text-gray-400 uppercase hover:bg-orange-50 hover:text-orange-600 transition-all">
                                            <Settings size={14} />
                                            {t('maintenance')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccommodationPortal;
