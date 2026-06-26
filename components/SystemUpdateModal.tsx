import React, { useState } from "react";
import { SystemUpdateNotification } from "@/services/updateNotificationApi";
import { Bell, X, Check, FileText, AlertCircle, Info, CheckCheck } from "lucide-react";

interface SystemUpdateModalProps {
  updates: SystemUpdateNotification[];
  onMarkRead: (id: string) => Promise<void>;
  onClose: () => void;
  isSidebarCollapsed?: boolean;
  hideSidebar?: boolean;
}

export default function SystemUpdateModal({
  updates,
  onMarkRead,
  onClose,
  isSidebarCollapsed = false,
  hideSidebar = false,
}: SystemUpdateModalProps) {
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  if (updates.length === 0) return null;

  const handleDismiss = async (id: string) => {
    try {
      setLoadingMap((prev) => ({ ...prev, [id]: true }));
      await onMarkRead(id);
    } catch (err) {
      console.error("Failed to dismiss notification:", id, err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleMarkAllRead = async () => {
    const unread = updates.filter(u => !u.is_read_by_user);
    for (const update of unread) {
      await handleDismiss(update.id);
    }
  };

  const formatTimeElapsed = (timestamp: string): string => {
    try {
      const diff = Date.now() - new Date(timestamp).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return "เมื่อครู่";
      if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
      const days = Math.floor(hours / 24);
      return `${days} วันที่แล้ว`;
    } catch {
      return "ไม่ระบุ";
    }
  };

  const getIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
      case "Medium":
        return <Info className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const getIconBg = (priority: string, isRead: boolean) => {
    if (isRead) return "bg-gray-800/80 text-gray-500";
    switch (priority) {
      case "High":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    }
  };

  const unreadCount = updates.filter(u => !u.is_read_by_user).length;

  // Float popover next to the sidebar and above the user profile section
  const leftClass = hideSidebar 
    ? "bottom-20 left-4 animate-in fade-in slide-in-from-bottom-4" 
    : isSidebarCollapsed 
      ? "bottom-20 left-[88px] animate-in fade-in slide-in-from-bottom-4" 
      : "bottom-20 left-[264px] animate-in fade-in slide-in-from-bottom-4";

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-transparent z-[9998]"
      />

      {/* Popover Bubble */}
      <div className={`fixed z-[9999] w-80 max-h-[420px] bg-[#0d1117] text-gray-200 shadow-2xl rounded-2xl border border-gray-800 flex flex-col overflow-hidden transform transition-all duration-200 ease-out ${leftClass}`}>
        {/* Header */}
        <div className="p-3 border-b border-gray-800 flex items-center justify-between bg-[#161b22]">
          <div className="flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-green-400" />
            <h2 className="text-xs font-bold text-white">การแจ้งเตือน</h2>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] text-green-400 hover:text-green-300 flex items-center gap-0.5 transition-colors mr-1 font-semibold"
                title="อ่านทั้งหมด"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                อ่านทั้งหมด
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-all"
              title="ปิด"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-800/80 bg-[#0d1117] max-h-[360px]">
          {updates.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <Bell className="w-8 h-8 mb-2 text-gray-600" />
              <span className="text-xs">ไม่มีการแจ้งเตือน</span>
            </div>
          ) : (
            updates.map((update) => {
              const isRead = !!update.is_read_by_user;
              const isLoading = !!loadingMap[update.id];
              return (
                <div
                  key={update.id}
                  className={`p-3 hover:bg-[#161b22]/50 transition-colors flex gap-2.5 items-start ${
                    !isRead ? "bg-green-500/[0.01]" : ""
                  }`}
                >
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${getIconBg(update.priority, isRead)}`}>
                    {getIcon(update.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <h4 className={`text-xs font-bold leading-snug break-words ${!isRead ? "text-white" : "text-gray-300"}`}>
                        {update.title}
                      </h4>
                      {!isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 mt-1.5 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 whitespace-pre-line leading-relaxed break-words">
                      {update.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] text-gray-500 font-medium">
                        {formatTimeElapsed(update.timestamp)}
                      </span>
                      {!isRead && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleDismiss(update.id)}
                          className="text-[10px] font-semibold text-green-400 hover:text-green-300 flex items-center gap-0.5 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? (
                            <div className="w-2.5 h-2.5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          อ่านแล้ว
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
