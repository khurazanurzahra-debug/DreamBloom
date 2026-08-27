import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Hapus",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="mb-5 text-sm leading-relaxed text-ink/70">{message}</p>
      <div className="flex gap-2.5">
        <Button variant="secondary" fullWidth onClick={onCancel}>
          Batal
        </Button>
        <Button fullWidth onClick={onConfirm} className="!bg-red-500 !text-white">
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
