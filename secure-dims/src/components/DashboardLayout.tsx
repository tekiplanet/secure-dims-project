import React from 'react';

interface SidebarItemProps {
    label: string;
    icon: React.ReactNode;
    id: string;
    activeId: string;
    onClick: (id: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ label, icon, id, activeId, onClick }) => (
    <div
        onClick={() => onClick(id)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${id === activeId ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
    >
        {icon}
        <span>{label}</span>
    </div>
);

export default function DashboardLayout({
    children,
    activeTab,
    setActiveTab
}: {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (id: string) => void;
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 border-r border-card-border p-6 flex flex-col gap-8 glass-morphism sticky top-0 h-screen">
                <div className="flex items-center gap-2 px-2">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">O</div>
                    <h1 className="text-xl font-bold tracking-tight">VORTEX ID</h1>
                </div>

                <nav className="flex flex-col gap-6 flex-grow overflow-y-auto custom-scrollbar pr-2">
                    {/* Holder Section */}
                    <div>
                        <p className="text-[10px] uppercase font-bold text-zinc-400 px-4 mb-2 tracking-widest">Digital Wallet (Holder)</p>
                        <div className="flex flex-col gap-1">
                            <SidebarItem id="dashboard" label="Dashboard" icon={<LayoutIcon />} activeId={activeTab} onClick={setActiveTab} />
                            <SidebarItem id="attributes" label="My Attributes" icon={<ShieldIcon />} activeId={activeTab} onClick={setActiveTab} />
                            <SidebarItem id="verifications" label="Selective Disclosure" icon={<CheckIcon />} activeId={activeTab} onClick={setActiveTab} />
                        </div>
                    </div>

                    {/* Issuer Section */}
                    <div>
                        <p className="text-[10px] uppercase font-bold text-zinc-400 px-4 mb-2 tracking-widest">Authority (Issuer)</p>
                        <div className="flex flex-col gap-1">
                            <SidebarItem id="issuer-portal" label="Request Queue" icon={<IssuerIcon />} activeId={activeTab} onClick={setActiveTab} />
                        </div>
                    </div>

                    {/* Verifier Section */}
                    <div>
                        <p className="text-[10px] uppercase font-bold text-zinc-400 px-4 mb-2 tracking-widest">Public (Verifier)</p>
                        <div className="flex flex-col gap-1">
                            <SidebarItem id="verifier-playground" label="Verifier Playground" icon={<VerifierIcon />} activeId={activeTab} onClick={setActiveTab} />
                        </div>
                    </div>

                    {/* System Section */}
                    <div>
                        <p className="text-[10px] uppercase font-bold text-zinc-400 px-4 mb-2 tracking-widest">System</p>
                        <div className="flex flex-col gap-1">
                            <SidebarItem id="audit" label="Audit Logs" icon={<HistoryIcon />} activeId={activeTab} onClick={setActiveTab} />
                            <SidebarItem id="settings" label="Settings" icon={<SettingsIcon />} activeId={activeTab} onClick={setActiveTab} />
                        </div>
                    </div>
                </nav>

                <div className="pt-6 border-t border-card-border">
                    <SidebarItem id="logout" label="Reset Session" icon={<LogoutIcon />} activeId={activeTab} onClick={() => { localStorage.clear(); window.location.reload(); }} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-10 overflow-auto">
                {children}
            </main>
        </div>
    );
}

// Icons
const LayoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>;
const ShieldIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const HistoryIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const IssuerIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>;
const VerifierIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
