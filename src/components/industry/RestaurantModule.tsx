import React, { useState } from 'react';
import { Utensils, Users, CheckCircle2, Clock, DollarSign, ChefHat } from 'lucide-react';
import { RestaurantTable } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';

export const RestaurantModule: React.FC = () => {
  const { currentEnterprise, currentBranch, setCurrentView } = useApp();
  const [tables, setTables] = useState<RestaurantTable[]>(() =>
    db.getRestaurantTables(currentEnterprise.id, currentBranch.id)
  );

  const reload = () => {
    setTables(db.getRestaurantTables(currentEnterprise.id, currentBranch.id));
  };

  const handleToggleStatus = (table: RestaurantTable) => {
    const nextStatus: RestaurantTable['status'] =
      table.status === 'available' ? 'occupied' :
      table.status === 'occupied' ? 'billing' : 'available';

    db.updateTableStatus(table.id, nextStatus, nextStatus === 'occupied' ? 45.00 : undefined);
    reload();
  };

  const zones = Array.from(new Set(tables.map(t => t.zone)));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Restaurant Table Floor Plan & Dine-In</h1>
            <p className="text-xs text-slate-400">
              Live dining room occupancy, table reservation, and active order totals for {currentBranch.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('kds')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
        >
          <ChefHat className="w-4 h-4" />
          Open Kitchen Display (KDS)
        </button>
      </div>

      {/* Tables Grid Grouped by Zone */}
      {zones.map((zone) => (
        <div key={zone} className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {zone} Dining Area
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {tables.filter(t => t.zone === zone).map((table) => {
              const isOccupied = table.status === 'occupied';
              const isBilled = table.status === 'billing';

              return (
                <div
                  key={table.id}
                  onClick={() => handleToggleStatus(table)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between select-none ${
                    isOccupied
                      ? 'bg-amber-950/25 border-amber-500/40 hover:border-amber-500 shadow-md shadow-amber-500/5'
                      : isBilled
                      ? 'bg-indigo-950/30 border-indigo-500/40 hover:border-indigo-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Table {table.number}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Users className="w-3 h-3" />
                      {table.capacity}p
                    </span>
                  </div>

                  <div className="my-3 text-center">
                    <div className={`text-xs font-bold uppercase tracking-wider ${
                      isOccupied ? 'text-amber-400' : isBilled ? 'text-indigo-400' : 'text-emerald-400'
                    }`}>
                      {table.status}
                    </div>

                    {table.activeOrderTotal ? (
                      <div className="text-sm font-mono font-black text-white mt-1">
                        ${table.activeOrderTotal.toFixed(2)}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 mt-1">Ready for guests</div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 text-[10px] text-center text-slate-400">
                    Click to cycle status
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

    </div>
  );
};
