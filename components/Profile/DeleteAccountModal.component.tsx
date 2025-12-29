'use client';

interface DeleteAccountModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function DeleteAccountModal({
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteAccountModalProps) {
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg text-error mb-4">Delete Account</h3>
        <p className="py-4 text-base-content">
          Are you sure you want to delete your account? This action cannot be undone.
          All your data, products, and store information will be permanently removed.
        </p>
        <div className="alert alert-warning mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm">This is a permanent action that cannot be reversed.</span>
        </div>
        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="btn btn-error text-white"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Deleting...
              </>
            ) : (
              'Delete Account'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

