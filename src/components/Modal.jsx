import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import "../styles/modal.css";

const Modal = forwardRef(({ title, children, onClose }, ref) => {
  const dialogRef = useRef(null);

  useImperativeHandle(ref, () => ({
    open: () => {
      dialogRef.current?.showModal();
    },
    close: () => {
      dialogRef.current?.close();
    },
  }));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onClose?.();
    };

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  // Close modal when clicking outside the content

 
  return (
    <dialog ref={dialogRef} className="modal" >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            className="modal-close"
            type="button"
            onClick={() => dialogRef.current?.close()}
          >
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </dialog>
  );
});

Modal.displayName = "Modal";

export default Modal;