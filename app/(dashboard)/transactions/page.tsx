"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import Papa from "papaparse";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { CategoryIcon } from "@/components/CategoryIcon";

export default function TransactionsPage() {
  const { user } = useAuth();
  const currency = user?.currency || "₹";
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [categoryId, setCategoryId] = useState("");
  const [period, setPeriod] = useState("ALL");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

  // CSV Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importRows, setImportRows] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        type,
        categoryId,
        period,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: "10",
      });

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [search, type, categoryId, period, sortBy, sortOrder, page]);

  useEffect(() => {
    const handleUpdate = () => fetchTransactions();
    window.addEventListener("fintrack_data_updated", handleUpdate);
    return () => window.removeEventListener("fintrack_data_updated", handleUpdate);
  }, [page]);

  const handleExportCSV = async () => {
    try {
      const res = await fetch("/api/import-export");
      if (res.ok) {
        const data = await res.json();
        const csv = Papa.unparse(data.data);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", data.filename || "fintrack_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Exported transactions as CSV!", "success");
      }
    } catch {
      showToast("Failed to export transactions", "error");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setImportRows(results.data);
        setImportErrors([]);
        setIsImportModalOpen(true);
      },
      error: (err) => {
        showToast(`CSV Parsing Error: ${err.message}`, "error");
      },
    });
  };

  const executeImport = async () => {
    if (importRows.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/import-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: importRows }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.errorCount > 0) {
          setImportErrors(result.errors);
          showToast(`Imported ${result.successCount} rows. ${result.errorCount} warnings.`, "warning");
        } else {
          showToast(`Successfully imported ${result.successCount} transactions!`, "success");
          setIsImportModalOpen(false);
          fetchTransactions();
        }
      }
    } catch {
      showToast("Error processing CSV import", "error");
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Transaction deleted", "success");
        fetchTransactions();
      }
    } catch {
      showToast("Failed to delete transaction", "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#141010] dark:text-[#FAF8F5]">
            Transactions
          </h1>
          <p className="text-xs text-[#4A3F3F] dark:text-[#C8BFB0] font-medium mt-0.5">
            Search, filter, export, and batch import your ledger records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] text-[#141010] dark:text-[#FAF8F5] hover:bg-[#FAF8F5] dark:hover:bg-[#302929] transition-colors cursor-pointer shadow-sm">
            <Upload className="w-4 h-4 text-[#810100] dark:text-[#FAF8F5]" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] text-[#141010] dark:text-[#FAF8F5] hover:bg-[#FAF8F5] dark:hover:bg-[#302929] transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#594D4D]" />
            <input
              type="text"
              placeholder="Search description, notes, category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
            />
          </div>

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-extrabold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="EXPENSE">Expense Only</option>
            <option value="INCOME">Income Only</option>
          </select>

          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-extrabold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split("_");
              setSortBy(sb);
              setSortOrder(so);
            }}
            className="px-3 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-extrabold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] dark:bg-[#141010] border-b border-[#E2DBD0] dark:border-[#3B3030] text-[#594D4D] uppercase tracking-wider font-extrabold">
              <tr>
                <th className="py-4 px-5">Transaction</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5">Payment Method</th>
                <th className="py-4 px-5 text-right">Amount</th>
                <th className="py-4 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DBD0]/50 dark:divide-[#3B3030] font-medium">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#E2DBD0] dark:bg-[#3B3030]" />
                        <div className="space-y-1.5 flex-1">
                          <div className="w-28 h-3.5 bg-[#E2DBD0] dark:bg-[#3B3030] rounded-md" />
                          <div className="w-16 h-2.5 bg-[#E2DBD0]/60 dark:bg-[#3B3030]/60 rounded-md" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5"><div className="w-20 h-6 bg-[#E2DBD0] dark:bg-[#3B3030] rounded-full" /></td>
                    <td className="py-4 px-5"><div className="w-16 h-3 bg-[#E2DBD0] dark:bg-[#3B3030] rounded-md" /></td>
                    <td className="py-4 px-5"><div className="w-16 h-3 bg-[#E2DBD0] dark:bg-[#3B3030] rounded-md" /></td>
                    <td className="py-4 px-5 text-right"><div className="w-16 h-4 bg-[#E2DBD0] dark:bg-[#3B3030] rounded-md ml-auto" /></td>
                    <td className="py-4 px-5 text-center"><div className="w-6 h-6 bg-[#E2DBD0] dark:bg-[#3B3030] rounded-lg mx-auto" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#594D4D]">
                    <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-[#810100]/10 text-[#810100] dark:text-[#E53835] flex items-center justify-center shadow-sm">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-sm text-[#141010] dark:text-[#FAF8F5]">No Transactions Found</h4>
                      <p className="text-xs text-[#594D4D] dark:text-[#9E9090]">
                        No financial records match your selected filters. Try resetting search parameters or record a new transaction.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#302929] transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: tx.category?.color || "#810100" }}
                        >
                          <CategoryIcon iconName={tx.category?.icon || "Tag"} className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-[#141010] dark:text-[#FAF8F5] block">
                            {tx.description}
                          </span>
                          {tx.notes && <span className="text-[11px] text-[#594D4D]">{tx.notes}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FAF8F5] dark:bg-[#141010] text-[#141010] dark:text-[#FAF8F5] border border-[#E2DBD0] dark:border-[#3B3030]">
                        {tx.category?.name}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-[#4A3F3F] dark:text-[#C8BFB0] font-semibold">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-[#4A3F3F] dark:text-[#C8BFB0] font-semibold">
                      {tx.paymentMethod}
                    </td>
                    <td
                      className={`py-4 px-5 text-right font-black text-sm ${
                        tx.type === "INCOME" ? "text-emerald-700 dark:text-emerald-400" : "text-[#810100] dark:text-[#FAF8F5]"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}
                      {currency}
                      {tx.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-[#E2DBD0] dark:border-[#3B3030] flex items-center justify-between text-xs font-bold text-[#594D4D]">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total entries)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-[#E2DBD0] dark:border-[#3B3030] disabled:opacity-40 hover:bg-[#FAF8F5] dark:hover:bg-[#302929]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-xl border border-[#E2DBD0] dark:border-[#3B3030] disabled:opacity-40 hover:bg-[#FAF8F5] dark:hover:bg-[#302929]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CSV Import Preview Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#FFFFFF] dark:bg-[#201A1A] rounded-3xl shadow-2xl border border-[#E2DBD0] dark:border-[#3B3030] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#E2DBD0] dark:border-[#3B3030]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#810100] dark:text-[#FAF8F5]" />
                <h3 className="font-extrabold text-sm text-[#141010] dark:text-[#FAF8F5]">Import CSV Confirmation</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)}>
                <X className="w-4 h-4 text-[#594D4D]" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-[#4A3F3F] dark:text-[#C8BFB0]">
                Parsed <span className="font-bold text-[#810100] dark:text-[#FAF8F5]">{importRows.length}</span> rows from your CSV file. Confirm batch import to update your financial dashboard.
              </p>

              {importErrors.length > 0 && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Row Validation Warnings</span>
                  </div>
                  {importErrors.map((err, idx) => (
                    <div key={idx} className="text-[11px] text-rose-500">
                      Row {err.row}: {err.error}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E2DBD0] dark:border-[#3B3030] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#594D4D] hover:bg-[#FAF8F5] dark:hover:bg-[#302929]"
              >
                Cancel
              </button>
              <button
                onClick={executeImport}
                disabled={importing}
                className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow"
              >
                {importing ? "Importing..." : "Confirm Batch Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
