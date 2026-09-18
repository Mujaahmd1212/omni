import React, { useState } from 'react';
import { BedDouble, CheckCircle2, User, Key, Sparkles, AlertCircle } from 'lucide-react';
import { HotelRoom } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';

export const HotelModule: React.FC = () => {
  const { currentEnterprise } = useApp();
  const [rooms, setRooms] = useState<HotelRoom[]>(() => db.getHotelRooms(currentEnterprise.id));

  // Check-In Modal State
  const [checkInRoom, setCheckInRoom] = useState<HotelRoom | null>(null);
  const [guestName, setGuestName] = useState<string>('');

  const reload = () => {
    setRooms(db.getHotelRooms(currentEnterprise.id));
  };

  const handleToggleRoomStatus = (room: HotelRoom) => {
    if (room.status === 'available') {
      setCheckInRoom(room);
      setGuestName('');
    } else if (room.status === 'occupied') {
      // Check-out -> goes to cleaning
      db.updateRoomStatus(room.id, 'cleaning', '');
      reload();
    } else if (room.status === 'cleaning') {
      // Housekeeper cleans -> goes to available
      db.updateRoomStatus(room.id, 'available', '');
      reload();
    }
  };

  const handleConfirmCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInRoom || !guestName.trim()) return;

    db.updateRoomStatus(checkInRoom.id, 'occupied', guestName.trim());
    setCheckInRoom(null);
    reload();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <BedDouble className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Hotel Front Desk & Room Rack</h1>
            <p className="text-xs text-slate-400">
              Live guest room status, check-in registration, and housekeeping turn-down management
            </p>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.map((r) => {
          const isOccupied = r.status === 'occupied';
          const isCleaning = r.status === 'cleaning';
          const isAvailable = r.status === 'available';

          return (
            <div
              key={r.id}
              onClick={() => handleToggleRoomStatus(r)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between select-none ${
                isOccupied
                  ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500 shadow-sm'
                  : isCleaning
                  ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500'
                  : 'bg-slate-900 border-slate-800 hover:border-violet-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-black text-white">
                  Room {r.roomNumber}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {r.type}
                </span>
              </div>

              <div className="my-3 space-y-1">
                <div className={`text-xs font-bold uppercase tracking-wider ${
                  isOccupied ? 'text-amber-400' : isCleaning ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {r.status}
                </div>

                {r.currentGuestName ? (
                  <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{r.currentGuestName}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 font-mono">
                    ${r.pricePerNight}/night
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/60 text-[10px] text-center text-slate-400">
                {isAvailable ? 'Click to Check-in Guest' : isOccupied ? 'Click to Check-out' : 'Click when Cleaned'}
              </div>
            </div>
          );
        })}
      </div>

      {/* CHECK IN MODAL */}
      {checkInRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleConfirmCheckIn}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Check-in Guest: Room {checkInRoom.roomNumber}</h2>
              <button onClick={() => setCheckInRoom(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl space-y-1">
              <div className="text-white font-bold uppercase text-[11px]">{checkInRoom.type} Room</div>
              <div className="text-slate-400 font-mono">Nightly Rate: ${checkInRoom.nightlyRate.toFixed(2)}</div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Guest Full Name *</label>
              <input
                type="text"
                required
                autoFocus
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCheckInRoom(null)}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/30"
              >
                Confirm Guest Check-in
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
