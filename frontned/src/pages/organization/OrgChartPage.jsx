import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartmentHierarchy } from '../../store/organizationSlice';
import { useSettings } from '../../context/SettingsContext.jsx';

const OrgChartPage = () => {
    const dispatch = useDispatch();
    const { hierarchy, loading } = useSelector((state) => state.organization);
    const { t } = useSettings();

    useEffect(() => {
        dispatch(fetchDepartmentHierarchy());
    }, [dispatch]);

    const renderNode = (node) => (
        <div key={node.id} className="flex flex-col items-center">
            {/* Card */}
            <div className="relative p-6 bg-[var(--bg-surface)] border-2 border-[var(--border-main)] rounded-3xl shadow-xl min-w-[240px] text-center hover:border-blue-500 transition-all duration-500 group">
                {/* Connector Top */}
                {node.parent_department_id && (
                    <div className="absolute -top-10 left-1/2 w-0.5 h-10 bg-slate-400/30 -translate-x-1/2" />
                )}

                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-500 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🏢</span>
                </div>

                <h3 className="font-bold text-[var(--text-main)] mb-1 uppercase tracking-tight">{node.name}</h3>
                <p className="text-[10px] font-mono font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full inline-block mb-4 uppercase tracking-[0.2em]">
                    {node.code}
                </p>

                {node.Manager && (
                    <div className="pt-4 border-t border-[var(--border-main)] flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-blue-500/20 mb-2 overflow-hidden flex items-center justify-center text-[10px] font-bold text-white uppercase">
                            {node.Manager.profile_picture ? (
                                <img src={node.Manager.profile_picture} alt="" className="w-full h-full object-cover" />
                            ) : (
                                `${node.Manager.first_name[0]}${node.Manager.last_name[0]}`
                            )}
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)] mb-0.5">Manager</p>
                        <p className="text-xs font-bold text-[var(--text-soft)]">{node.Manager.first_name} {node.Manager.last_name}</p>
                    </div>
                )}
            </div>

            {/* Children container */}
            {node.subDepartments && node.subDepartments.length > 0 && (
                <div className="pt-20 relative flex flex-wrap justify-center gap-12">
                    {/* Horizontal Connector */}
                    <div className="absolute top-0 left-12 right-12 h-0.5 bg-slate-400/30" />
                    {/* Vertical Link from parent */}
                    <div className="absolute -top-10 left-1/2 w-0.5 h-10 bg-slate-400/30 -translate-x-1/2" />

                    {node.subDepartments.map((child) => (
                        <div key={child.id} className="relative">
                            {/* Individual Vertical Link */}
                            <div className="absolute -top-10 left-1/2 w-0.5 h-10 bg-slate-400/30 -translate-x-1/2" />
                            {renderNode(child)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-[80vh] flex flex-col overflow-hidden">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase">{t('orgChart')}</h1>
                <p className="text-[var(--text-muted)] font-medium tracking-widest uppercase text-[10px]">Hierarchical Structural Model</p>
            </div>

            <div className="flex-1 overflow-auto p-20 flex justify-center items-start custom-scrollbar">
                <div className="relative">
                    {hierarchy.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-20 pb-40">
                            {hierarchy.map(node => renderNode(node))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-[var(--bg-surface)] rounded-3xl border-2 border-dashed border-[var(--border-main)] px-20">
                            <span className="text-6xl mb-6 block">🗺️</span>
                            <h3 className="text-xl font-bold mb-2">Structure Not Found</h3>
                            <p className="text-[var(--text-soft)]">Please define your departments and parent units first.</p>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--border-main);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--text-muted);
                }
            `}} />
        </div>
    );
};

export default OrgChartPage;
