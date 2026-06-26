import React, { useState, useEffect } from "react";
import {
  listAllSystemUpdates,
  createSystemUpdate,
  deleteSystemUpdate,
  SystemUpdateNotification,
} from "@/services/updateNotificationApi";
import { listRoles, Role } from "@/services/roleApi";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import Modal from "@/components/Modal";
import {
  Bell,
  Plus,
  Trash2,
  RotateCcw,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function UpdateNotificationManagementPage() {
  const [updates, setUpdates] = useState<SystemUpdateNotification[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SystemUpdateNotification | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formPriority, setFormPriority] = useState("Low");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Load updates and roles in parallel
      const [updatesRes, rolesRes] = await Promise.all([
        listAllSystemUpdates(),
        listRoles(false),
      ]);

      setUpdates(updatesRes.updates || []);
      setRoles(rolesRes.roles || []);
    } catch (err: any) {
      setError(err.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formMessage.trim()) {
      setError("กรุณากรอกหัวข้อและรายละเอียดให้ครบถ้วน");
      return;
    }
    if (selectedRoles.length === 0) {
      setError("กรุณาเลือกอย่างน้อย 1 ตำแหน่งที่สามารถเห็นการแจ้งเตือนนี้");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createSystemUpdate({
        title: formTitle,
        message: formMessage,
        priority: formPriority,
        forRoles: selectedRoles,
      });

      setSuccessMsg("สร้างการแจ้งเตือนการอัพเดตสำเร็จ");
      // Reset form
      setFormTitle("");
      setFormMessage("");
      setFormPriority("Low");
      setSelectedRoles([]);
      setShowCreateModal(false);

      // Reload list
      loadData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || "สร้างการแจ้งเตือนไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;

    try {
      setError(null);
      await deleteSystemUpdate(deleteTarget.id);
      setSuccessMsg("ลบการแจ้งเตือนสำเร็จ");
      setDeleteTarget(null);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || "ลบการแจ้งเตือนไม่สำเร็จ");
    }
  }

  const handleRoleCheckboxChange = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSelectAllRoles = () => {
    if (selectedRoles.length === roles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(roles.map((r) => r.name));
    }
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="p-6 md:p-8 h-full flex flex-col bg-[#F5F5F5] font-sans overflow-hidden">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            Update Notifications Management
          </h1>
          <p className="text-gray-500 mt-1 ml-14">
            เขียนการแจ้งเตือนการอัพเดตระบบและเลือกตำแหน่งที่จะให้เห็นประกาศ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-green-600 transition-colors shadow-sm"
            title="รีเฟรชข้อมูล"
          >
            <RotateCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setError(null);
              setShowCreateModal(true);
            }}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition-all font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            สร้างแจ้งเตือนใหม่
          </button>
        </div>
      </div>

      {/* Success/Error Banners */}
      {successMsg && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-500 border-t-transparent mb-4"></div>
              <span>กำลังโหลดข้อมูล...</span>
            </div>
          ) : updates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Bell className="w-12 h-12 mb-4 text-gray-300" />
              <span>ยังไม่มีรายการแจ้งเตือนการอัพเดตระบบ</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      วันที่สร้าง
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      หัวข้อ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      รายละเอียด
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      ระดับความสำคัญ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      ตำแหน่งที่เห็น
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {updates.map((update) => (
                    <tr key={update.id} className="hover:bg-gray-50/55 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {new Date(update.timestamp).toLocaleString("th-TH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                        {update.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {update.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                            update.priority
                          )}`}
                        >
                          {update.priority === "High"
                            ? "สำคัญสูง"
                            : update.priority === "Medium"
                            ? "สำคัญปานกลาง"
                            : "ทั่วไป"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-1">
                          {update.targeted_roles && update.targeted_roles.length > 0 ? (
                            update.targeted_roles.map((role) => (
                              <span
                                key={role}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded text-xs"
                              >
                                {role}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">ไม่ระบุ</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => setDeleteTarget(update)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                          title="ลบการแจ้งเตือน"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Update Modal */}
      {showCreateModal && (
        <Modal
          title="สร้างการแจ้งเตือนการอัพเดตระบบ"
          onClose={() => setShowCreateModal(false)}
        >
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                หัวข้ออัพเดต <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="เช่น อัพเดตระบบจัดการคลังสินค้า V2"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ระดับความสำคัญ
              </label>
              <div className="flex gap-4">
                {["Low", "Medium", "High"].map((prio) => (
                  <label key={prio} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value={prio}
                      checked={formPriority === prio}
                      onChange={() => setFormPriority(prio)}
                      className="text-green-600 focus:ring-green-500 border-gray-300 h-4 w-4"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {prio === "High"
                        ? "สำคัญสูง (High)"
                        : prio === "Medium"
                        ? "สำคัญปานกลาง (Medium)"
                        : "ทั่วไป (Low)"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ตำแหน่งที่มีสิทธิ์เห็นแจ้งเตือนนี้ <span className="text-red-500">*</span>
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                <button
                  type="button"
                  onClick={handleSelectAllRoles}
                  className="mb-3 text-xs font-semibold text-green-600 hover:text-green-700 block text-left"
                >
                  {selectedRoles.length === roles.length ? "✕ ยกเลิกการเลือกทั้งหมด" : "✓ เลือกทั้งหมด"}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => (
                    <label
                      key={role.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-100/50 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.name)}
                        onChange={() => handleRoleCheckboxChange(role.name)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700">{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                รายละเอียดการอัพเดต <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="อธิบายรายละเอียดการอัพเดต ฟีเจอร์ใหม่ๆ หรือจุดที่เปลี่ยน..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? "กำลังสร้าง..." : "บันทึกและประกาศ"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          itemName={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
