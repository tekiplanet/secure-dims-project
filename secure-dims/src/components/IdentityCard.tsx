import React from 'react';

interface IdentityCardProps {
    did: string;
    trustLevel: 'L1' | 'L2' | 'L3' | 'L4';
    status: 'Active' | 'Suspended';
}

const levelColors = {
    L1: 'from-gray-400 to-gray-600',
    L2: 'from-blue-400 to-blue-600',
    L3: 'from-purple-400 to-purple-600',
    L4: 'from-amber-400 to-orange-600',
};

export const IdentityCard: React.FC<IdentityCardProps> = ({ did, trustLevel, status }) => {
    return (
        <div className={`premium-card p-8 text-white bg-gradient-to-br ${levelColors[trustLevel]} relative overflow-hidden h-64 w-full max-w-md`}>
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
            </div>

            <div className="flex flex-col justify-between h-full">
                <div>
                    <h3 className="text-sm font-medium tracking-widest uppercase opacity-80">Digital Identity Card</h3>
                    <p className="mt-4 text-xs font-mono break-all opacity-90">{did}</p>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs opacity-70">Assurance Level</p>
                        <p className="text-3xl font-bold tracking-tighter">{trustLevel}</p>
                    </div>
                    <div className="text-right">
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-white/20 backdrop-blur-md`}>
                            {status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
