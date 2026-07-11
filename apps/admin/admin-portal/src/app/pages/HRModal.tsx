import React from 'react';
import { X } from 'lucide-react';
import styles from './HRModal.module.css';

interface HRModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
}

export default function HRModal({ isOpen, onClose, title, children, onSubmit, submitText = 'Save' }: HRModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
        {onSubmit && (
          <div className={styles.modalFooter}>
            <button className={styles.btnCancel} onClick={onClose}>Cancel</button>
            <button className={styles.btnSubmit} onClick={onSubmit}>{submitText}</button>
          </div>
        )}
      </div>
    </div>
  );
}
