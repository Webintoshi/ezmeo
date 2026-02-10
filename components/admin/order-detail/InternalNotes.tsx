"use client";

import { useState } from "react";
import { FileText, Plus, X, Pencil, Trash2, User } from "lucide-react";

// Simple time formatter
function formatTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface InternalNote {
  id: string;
  text: string;
  adminId?: string;
  adminName?: string;
  createdAt: Date | string;
}

interface InternalNotesProps {
  notes: InternalNote[];
  customerNote?: string;
  onAddNote: (text: string) => Promise<void>;
  onUpdateNote?: (noteId: string, text: string) => Promise<void>;
  onDeleteNote?: (noteId: string) => Promise<void>;
  currentAdminName?: string;
  className?: string;
}

export function InternalNotes({
  notes,
  customerNote,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  currentAdminName = "Admin",
  className = "",
}: InternalNotesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleSubmit = async () => {
    if (!newNoteText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddNote(newNoteText.trim());
      setNewNoteText("");
      setIsAdding(false);
    } catch (error) {
      console.error("Not eklenirken hata:", error);
      alert("Not eklenirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !editText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onUpdateNote?.(editingId, editText.trim());
      setEditingId(null);
      setEditText("");
    } catch (error) {
      console.error("Not güncellenirken hata:", error);
      alert("Not güncellenirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Bu notu silmek istediğinizden emin misiniz?")) return;

    try {
      await onDeleteNote?.(noteId);
    } catch (error) {
      console.error("Not silinirken hata:", error);
      alert("Not silinirken bir hata oluştu.");
    }
  };

  const startEdit = (note: InternalNote) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">İç Notlar</h3>
            <p className="text-sm text-gray-500">
              {notes.length} not · Sadece admin tarafından görülebilir
            </p>
          </div>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-red-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Not Ekle
          </button>
        )}
      </div>

      <div className="p-8">
        {/* Customer Note (if exists) */}
        {customerNote && (
          <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Müşteri Notu
              </span>
            </div>
            <p className="text-amber-900 font-medium">{customerNote}</p>
          </div>
        )}

        {/* Add Note Form */}
        {isAdding && (
          <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Yeni not yazın..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">
                Not {currentAdminName} tarafından eklenecek
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewNoteText("");
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!newNoteText.trim() || isSubmitting}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Ekleniyor..." : "Ekle"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Henüz iç not eklenmemiş</p>
            </div>
          ) : (
            notes.map((note) => {
              const isEditing = editingId === note.id;
              const noteDate = new Date(note.createdAt);

              return (
                <div
                  key={note.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isEditing
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {isEditing ? (
                    // Edit Mode
                    <div>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-blue-200 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                      <div className="flex items-center justify-end gap-2 mt-3">
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
                        >
                          İptal
                        </button>
                        <button
                          onClick={handleUpdate}
                          disabled={!editText.trim() || isSubmitting}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 break-words">
                              {note.text}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {note.adminName || "Admin"} · {formatTime(note.createdAt)}
                            </p>
                          </div>
                          {(onUpdateNote || onDeleteNote) && (
                            <div className="flex items-center gap-1">
                              {onUpdateNote && (
                                <button
                                  onClick={() => startEdit(note)}
                                  className="p-1.5 hover:bg-white rounded-lg transition-colors"
                                  title="Düzenle"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                              )}
                              {onDeleteNote && (
                                <button
                                  onClick={() => handleDelete(note.id)}
                                  className="p-1.5 hover:bg-white rounded-lg transition-colors"
                                  title="Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
