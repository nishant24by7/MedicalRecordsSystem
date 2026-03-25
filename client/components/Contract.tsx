"use client";

import { useState, useCallback } from "react";
import {
  addRecord,
  getRecord,
  updateRecord,
  getRecordOwner,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Textarea ─────────────────────────────────────────────

function TextArea({
  label,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <textarea
          {...props}
          rows={4}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none resize-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "view" | "add" | "update";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("view");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Add Record state
  const [addData, setAddData] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newRecordId, setNewRecordId] = useState<number | null>(null);

  // Update Record state
  const [updateId, setUpdateId] = useState("");
  const [updateData, setUpdateData] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // View Record state
  const [viewId, setViewId] = useState("");
  const [isViewing, setIsViewing] = useState(false);
  const [recordData, setRecordData] = useState<string | null>(null);
  const [recordOwner, setRecordOwner] = useState<string | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleAddRecord = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!addData.trim()) return setError("Enter medical data");
    setError(null);
    setIsAdding(true);
    setTxStatus("Awaiting signature...");
    setNewRecordId(null);
    try {
      // Convert text to base64 for Bytes type
      const encodedData = btoa(addData.trim());
      const result = await addRecord(walletAddress, encodedData);
      // Extract record ID from result
      const txResult = result as { results?: Array<{ value?: { ui32?: number } }> };
      if (txResult.results && txResult.results[0]?.value?.ui32) {
        setNewRecordId(txResult.results[0].value.ui32);
        setTxStatus("Medical record created on-chain!");
      } else {
        setTxStatus("Medical record created on-chain!");
      }
      setAddData("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsAdding(false);
    }
  }, [walletAddress, addData]);

  const handleUpdateRecord = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!updateId.trim() || !updateData.trim()) return setError("Fill in all fields");
    setError(null);
    setIsUpdating(true);
    setTxStatus("Awaiting signature...");
    try {
      const id = parseInt(updateId.trim(), 10);
      if (isNaN(id)) return setError("Invalid record ID");
      const encodedData = btoa(updateData.trim());
      await updateRecord(walletAddress, id, encodedData);
      setTxStatus("Medical record updated on-chain!");
      setUpdateId("");
      setUpdateData("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsUpdating(false);
    }
  }, [walletAddress, updateId, updateData]);

  const handleViewRecord = useCallback(async () => {
    if (!viewId.trim()) return setError("Enter a record ID");
    setError(null);
    setIsViewing(true);
    setRecordData(null);
    setRecordOwner(null);
    try {
      const id = parseInt(viewId.trim(), 10);
      if (isNaN(id)) return setError("Invalid record ID");
      
      // Get owner first
      const owner = await getRecordOwner(id);
      setRecordOwner(owner);
      
      // Get record data if we have a wallet to auth with
      if (walletAddress) {
        const data = await getRecord(id, walletAddress);
        if (data) {
          // Decode base64 to text
          try {
            setRecordData(atob(data));
          } catch {
            setRecordData(data);
          }
        } else {
          setError("Record not found or access denied");
        }
      } else {
        // Just show owner without auth
        if (owner) {
          setTxStatus("Connect wallet to view record data");
          setTimeout(() => setTxStatus(null), 3000);
        } else {
          setError("Record not found");
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsViewing(false);
    }
  }, [viewId, walletAddress]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "view", label: "View", icon: <SearchIcon />, color: "#4fc3f7" },
    { key: "add", label: "Add Record", icon: <PlusIcon />, color: "#7c6cf0" },
    { key: "update", label: "Update", icon: <EditIcon />, color: "#fbbf24" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") || txStatus.includes("updated") || txStatus.includes("created") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6cf0]/20 to-[#4fc3f7]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7c6cf0]">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M12 18v-6" />
                  <path d="M9 15h6" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Medical Records</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setRecordData(null); setRecordOwner(null); setNewRecordId(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* View */}
            {activeTab === "view" && (
              <div className="space-y-5">
                <MethodSignature name="get_record" params="(id: u32, caller: Address)" returns="-> Bytes" color="#4fc3f7" />
                <Input label="Record ID" value={viewId} onChange={(e) => setViewId(e.target.value)} placeholder="e.g. 1" type="number" />
                <ShimmerButton onClick={handleViewRecord} disabled={isViewing} shimmerColor="#4fc3f7" className="w-full">
                  {isViewing ? <><SpinnerIcon /> Querying...</> : <><SearchIcon /> View Record</>}
                </ShimmerButton>

                {recordOwner && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Record Info</span>
                      <Badge variant="info">
                        <UserIcon /> Owner
                      </Badge>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Record ID</span>
                        <span className="font-mono text-sm text-white/80">{viewId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Owner</span>
                        <span className="font-mono text-sm text-white/80">{truncate(recordOwner)}</span>
                      </div>
                      {recordData && (
                        <div className="space-y-2">
                          <div className="text-xs text-white/35">Medical Data</div>
                          <div className="rounded-lg bg-white/[0.03] p-3 font-mono text-xs text-white/70 whitespace-pre-wrap break-all">
                            {recordData}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add */}
            {activeTab === "add" && (
              <div className="space-y-5">
                <MethodSignature name="add_record" params="(patient: Address, data: Bytes)" returns="-> u32" color="#7c6cf0" />
                <TextArea label="Medical Data" value={addData} onChange={(e) => setAddData(e.target.value)} placeholder="Enter medical record data..." />
                {walletAddress ? (
                  <ShimmerButton onClick={handleAddRecord} disabled={isAdding} shimmerColor="#7c6cf0" className="w-full">
                    {isAdding ? <><SpinnerIcon /> Creating...</> : <><PlusIcon /> Add Medical Record</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to add records
                  </button>
                )}

                {newRecordId !== null && (
                  <div className="rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 animate-fade-in-up">
                    <div className="flex items-center gap-2">
                      <span className="text-[#34d399]"><CheckIcon /></span>
                      <span className="text-sm text-[#34d399]/90">Record created with ID: <span className="font-mono font-bold">{newRecordId}</span></span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Update */}
            {activeTab === "update" && (
              <div className="space-y-5">
                <MethodSignature name="update_record" params="(id: u32, caller: Address, data: Bytes)" color="#fbbf24" />
                <Input label="Record ID" value={updateId} onChange={(e) => setUpdateId(e.target.value)} placeholder="e.g. 1" type="number" />
                <TextArea label="New Medical Data" value={updateData} onChange={(e) => setUpdateData(e.target.value)} placeholder="Enter updated medical data..." />

                {walletAddress ? (
                  <ShimmerButton onClick={handleUpdateRecord} disabled={isUpdating} shimmerColor="#fbbf24" className="w-full">
                    {isUpdating ? <><SpinnerIcon /> Updating...</> : <><EditIcon /> Update Record</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#fbbf24]/20 bg-[#fbbf24]/[0.03] py-4 text-sm text-[#fbbf24]/60 hover:border-[#fbbf24]/30 hover:text-[#fbbf24]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to update records
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Medical Records System &middot; Soroban</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#7c6cf0]" />
                <span className="font-mono text-[9px] text-white/15">Encrypted</span>
              </span>
              <span className="text-white/10 text-[8px]">&rarr;</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#4fc3f7]" />
                <span className="font-mono text-[9px] text-white/15">Owner-only</span>
              </span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}