import React, { useState } from 'react';
import { ChefHat, Clock, CheckCircle2, Play, Flame, Utensils } from 'lucide-react';
import { KitchenOrder } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';

export const KitchenDisplaySystem: React.FC = () => {
  const { currentEnterprise, currentBranch, setCurrentView } = useApp();
  const [orders, setOrders] = useState<KitchenOrder[]>(() =>
    db.getKitchenOrders(currentEnterprise.id, currentBranch.id)
  );

  const reload = () => {
    setOrders(db.getKitchenOrders(currentEnterprise.id, currentBranch.id));
  };

  const handleUpdateStatus = (orderId: string, nextStatus: KitchenOrder['status']) => {
    db.updateKitchenOrderStatus(orderId, nextStatus);
    reload();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Kitchen Display System (KDS)</h1>
            <p className="text-xs text-slate-400">
              Live order preparation queue for line cooks & kitchen expedited staff ({currentBranch.name})
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('restaurant')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
        >
          Back to Floor Plan
        </button>
      </div>

      {/* Live Order Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.map((o) => {
          const isPending = o.status === 'pending';
          const isPreparing = o.status === 'preparing';
          const isReady = o.status === 'ready';

          return (
            <div
              key={o.id}
              className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-lg transition-all ${
                isPending
                  ? 'bg-slate-900 border-amber-500/50'
                  : isPreparing
                  ? 'bg-slate-900 border-indigo-500/50'
                  : 'bg-slate-900 border-emerald-500/50'
              }`}
            >
              {/* Ticket Top Banner */}
              <div className={`p-3.5 flex items-center justify-between border-b ${
                isPending ? 'bg-amber-500/10 border-amber-500/30' :
                isPreparing ? 'bg-indigo-500/10 border-indigo-500/30' :
                'bg-emerald-500/10 border-emerald-500/30'
              }`}>
                <div>
                  <span className="font-mono font-black text-sm text-white">{o.orderNumber}</span>
                  <div className="text-[11px] font-bold text-indigo-300">
                    {o.tableNumber.includes('Table') ? o.tableNumber : `Table ${o.tableNumber}`} ({o.diningType})
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{o.createdAt}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 space-y-2 flex-1">
                {o.items.map((it, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-white">
                    <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center font-mono font-bold text-indigo-300 shrink-0">
                      {it.qty}
                    </span>
                    <span className="pt-0.5 leading-snug">{it.name}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="p-3 bg-slate-950 border-t border-slate-800">
                {isPending && (
                  <button
                    onClick={() => handleUpdateStatus(o.id, 'preparing')}
                    className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Start Cooking
                  </button>
                )}

                {isPreparing && (
                  <button
                    onClick={() => handleUpdateStatus(o.id, 'ready')}
                    className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Ready for Pickup
                  </button>
                )}

                {isReady && (
                  <button
                    onClick={() => handleUpdateStatus(o.id, 'served')}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Served to Table
                  </button>
                )}

                {o.status === 'served' && (
                  <div className="text-center text-xs font-bold text-emerald-400 py-1">
                    Served & Completed
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            <ChefHat className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-xs">No active kitchen orders right now. Orders placed from POS terminal will appear here live.</p>
          </div>
        )}
      </div>

    </div>
  );
};
