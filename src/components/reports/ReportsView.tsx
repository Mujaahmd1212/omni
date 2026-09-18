import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, DollarSign, Download, Printer, PieChart, Package, Calendar } from 'lucide-react';
import { Sale, Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';

export const ReportsView: React.FC = () => {
  const { currentEnterprise } = useApp();
  const sales = useMemo(() => db.getSales(currentEnterprise.id), [currentEnterprise.id]);
  const products = useMemo(() => db.getProducts(currentEnterprise.id), [currentEnterprise.id]);

  // Total Sales & Discounts
  const completedSales = useMemo(() => sales.filter(s => s.status === 'completed'), [sales]);
  const totalRevenue = useMemo(() => completedSales.reduce((acc, s) => acc + s.total, 0), [completedSales]);
  const totalDiscounts = useMemo(() => completedSales.reduce((acc, s) => acc + s.discountAmount, 0), [completedSales]);
  const totalTax = useMemo(() => completedSales.reduce((acc, s) => acc + s.taxAmount, 0), [completedSales]);

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    completedSales.forEach(s => {
      map[s.paymentMethod] = (map[s.paymentMethod] || 0) + s.total;
    });
    return Object.entries(map).map(([method, amount]) => ({
      method,
      amount,
      percent: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
    }));
  }, [completedSales, totalRevenue]);

  // Top Selling Products
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    completedSales.forEach(s => {
      s.items.forEach(item => {
        if (!map[item.productId]) {
          map[item.productId] = { name: item.name, qty: 0, revenue: 0 };
        }
        map[item.productId].qty += item.quantity;
        map[item.productId].revenue += item.price * item.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [completedSales]);

  const handleExportCsv = () => {
    const rows = [
      ['Invoice Number', 'Date', 'Cashier', 'Customer', 'Payment Method', 'Total'],
      ...completedSales.map(s => [
        s.invoiceNumber,
        new Date(s.createdAt).toISOString(),
        s.cashierName,
        s.customerName || 'Walk-in',
        s.paymentMethod,
        s.total.toFixed(2)
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_report_${currentEnterprise.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Sales Analytics & Reporting</h1>
            <p className="text-xs text-slate-400">
              Aggregated business metrics, revenue performance, and payment breakdown for {currentEnterprise.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
          
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Total Net Revenue</span>
          <div className="text-2xl font-black text-white font-mono">${totalRevenue.toFixed(2)}</div>
          <span className="text-[10px] text-emerald-400 font-medium">Completed Transactions</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Orders Processed</span>
          <div className="text-2xl font-black text-white font-mono">{completedSales.length}</div>
          <span className="text-[10px] text-indigo-300 font-medium">Active register sales</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Total Discounts Given</span>
          <div className="text-2xl font-black text-white font-mono">${totalDiscounts.toFixed(2)}</div>
          <span className="text-[10px] text-slate-500">Promotions & item markdowns</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Tax Collected</span>
          <div className="text-2xl font-black text-white font-mono">${totalTax.toFixed(2)}</div>
          <span className="text-[10px] text-slate-500">Rate: {currentEnterprise.taxRate}%</span>
        </div>

      </div>

      {/* Analytics Visuals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Selling Products (Left 60%) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-400" />
            Top Selling Products by Revenue
          </h2>

          <div className="space-y-3">
            {topProducts.map((p, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">{idx + 1}. {p.name}</span>
                  <span className="font-mono text-indigo-300">${p.revenue.toFixed(2)} ({p.qty} sold)</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, (p.revenue / (topProducts[0]?.revenue || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}

            {topProducts.length === 0 && (
              <p className="text-xs text-slate-500 py-6 text-center">No sales data recorded yet.</p>
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown (Right 40%) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" />
            Payment Method Share
          </h2>

          <div className="space-y-2.5">
            {paymentBreakdown.map((pm, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950 rounded-xl flex items-center justify-between border border-slate-800"
              >
                <div>
                  <span className="text-xs font-bold text-white capitalize">{pm.method}</span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {pm.percent.toFixed(1)}% of total volume
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-xs text-white">
                  ${pm.amount.toFixed(2)}
                </div>
              </div>
            ))}

            {paymentBreakdown.length === 0 && (
              <p className="text-xs text-slate-500 py-6 text-center">No transactions recorded yet.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
