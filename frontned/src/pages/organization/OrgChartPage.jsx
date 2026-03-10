import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartmentHierarchy, updateDepartment } from '../../store/organizationSlice';
import { useSettings } from '../../context/SettingsContext.jsx';
import usePermission from '../../hooks/usePermission';

const OrgChartPage = () => {
    const dispatch = useDispatch();
    const { hierarchy, loading } = useSelector((state) => state.organization);
    const { t } = useSettings();
    const { hasPermission } = usePermission();
    const canManageOrg = hasPermission('manage_org');
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        dispatch(fetchDepartmentHierarchy());
    }, [dispatch]);

    const handleDrop = async (draggedId, targetParentId) => {
        if (!canManageOrg) return;
        if (draggedId === String(targetParentId)) return;

        try {
            await dispatch(updateDepartment({
                id: draggedId,
                data: { parent_department_id: targetParentId }
            })).unwrap();
            dispatch(fetchDepartmentHierarchy());
        } catch (error) {
            console.error("Failed to update hierarchy", error);
        }
    };

    const renderNode = (node) => (
        <div key={node.id} className="flex flex-col items-center">
            {/* Card */}
            <div
                draggable={canManageOrg}
                onDragStart={(e) => {
                    e.dataTransfer.setData('departmentId', node.id);
                    setIsDragging(true);
                }}
                onDragEnd={() => setIsDragging(false)}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (canManageOrg) e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                }}
                onDragLeave={(e) => {
                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                    const draggedId = e.dataTransfer.getData('departmentId');
                    if (draggedId && draggedId !== String(node.id)) {
                        handleDrop(draggedId, node.id);
                        setIsDragging(false);
                    }
                }}
                className={`relative p-6 bg-[var(--bg-surface)] border-2 border-[var(--border-main)] rounded-3xl shadow-xl min-w-[240px] text-center transition-all duration-300 group ${canManageOrg ? 'cursor-grab active:cursor-grabbing hover:border-blue-400' : ''}`}
            >
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
                                <img
                                    src={node.Manager.profile_picture.replace('http://', 'https://')}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                `${node.Manager.first_name[0]}${node.Manager.last_name[0]}`
                            )}
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)] mb-0.5">Manager</p>
                        <p className="text-xs font-bold text-[var(--text-soft)]">{node.Manager.first_name} {node.Manager.last_name}</p>
                    </div>
                )}

                {/* Employees avatars */}
                {node.Employees && node.Employees.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--border-main)]/50">
                        <p className="text-[9px] uppercase tracking-wider font-bold text-[var(--text-muted)] mb-2">
                            {node.Employees.length} {node.Employees.length === 1 ? 'Employee' : 'Employees'}
                        </p>
                        <div className="flex -space-x-2 overflow-hidden justify-center hover:space-x-1 transition-all">
                            {node.Employees.slice(0, 5).map((emp, i) => (
                                <div
                                    key={emp.id}
                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--bg-surface)] bg-slate-200 overflow-hidden cursor-help"
                                    title={`${emp.User.first_name} ${emp.User.last_name}`}
                                >
                                    {emp.User.profile_picture ? (
                                        <img
                                            src={emp.User.profile_picture.replace('http://', 'https://')}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-[10px] font-bold">
                                            {emp.User.first_name[0]}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {node.Employees.length > 5 && (
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold ring-2 ring-[var(--bg-surface)]">
                                    +{node.Employees.length - 5}
                                </div>
                            )}
                        </div>
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

                    {node.subDepartments.map((child, index) => (
                        <div key={`child-${child.id}-${index}`} className="relative">
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
            <div className="mb-10 text-center relative">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase">{t('orgChart')}</h1>
                <p className="text-[var(--text-muted)] font-medium tracking-widest uppercase text-[10px]">{t('hierarchicalStructuralModel')}</p>

                {canManageOrg && (
                    <div className="absolute right-0 top-0">
                        <div className="text-xs bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-medium border border-blue-100 flex items-center gap-2 shadow-sm">
                            🖐️ {t('dragAndDropToRearrange')}
                        </div>
                    </div>
                )}
            </div>

            {canManageOrg && isDragging && (
                <div
                    className="w-full max-w-2xl mx-auto border-2 border-dashed border-blue-400 bg-blue-50 p-6 rounded-3xl flex justify-center items-center text-blue-600 font-bold uppercase tracking-wider text-sm mb-10 transition-all shadow-inner"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData('departmentId');
                        if (draggedId) {
                            handleDrop(draggedId, null);
                            setIsDragging(false);
                        }
                    }}
                >
                    ⬇️ {t('dropToMakeTopLevel')}
                </div>
            )}

            <div className="flex-1 overflow-auto p-20 pt-10 flex justify-center items-start custom-scrollbar">
                <div className="relative">
                    {hierarchy.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-20 pb-40">
                            {hierarchy.map((node, index) => (
                                <div key={`root-${node.id}-${index}`}>
                                    {renderNode(node)}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-[var(--bg-surface)] rounded-3xl border-2 border-dashed border-[var(--border-main)] px-20">
                            <span className="text-6xl mb-6 block">🗺️</span>
                            <h3 className="text-xl font-bold mb-2">{t('structureNotFound')}</h3>
                            <p className="text-[var(--text-soft)]">{t('defineDepartmentsFirst')}</p>
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
