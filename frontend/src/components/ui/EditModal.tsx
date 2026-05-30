import React from "react";

type Props = {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  submitting?: boolean;
};

const EditModal: React.FC<Props> = ({ open, title, children, onClose, onSubmit, submitLabel = "Save", submitting = false }) => {
  if (!open) return null;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-lg dark:bg-slate-900 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 id="edit-modal-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">{children}</div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-3xl px-4 py-2 btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-3xl px-4 py-2 btn-primary disabled:opacity-50">{submitting ? "Saving..." : submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
