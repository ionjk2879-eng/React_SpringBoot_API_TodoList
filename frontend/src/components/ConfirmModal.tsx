interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel = '삭제', danger = true, pending = false, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-[70] p-4"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl shadow-black/10 w-full max-w-sm p-5">
        <h2 className="text-sm font-semibold text-[#1D1D1F] mb-1.5">{title}</h2>
        <p className="text-sm text-[#86868B] leading-relaxed">{message}</p>
        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            disabled={pending}
            className="flex-1 text-sm text-[#86868B] border border-[#D2D2D7] py-2 rounded-lg hover:bg-[#F5F5F7] transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className={`flex-1 text-sm font-medium py-2 rounded-lg text-white transition-colors disabled:opacity-60 ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {pending ? '삭제 중…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
