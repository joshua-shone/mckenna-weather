import React from "react";

import styles from "./ErrorModal.module.scss";

export default function ErrorModal({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => any;
}) {
  return (
    <div className={styles.ModalContainer} data-testid="error-modal">
      <div className={styles.ErrorModal}>
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={onRetry}>Retry</button>
      </div>
    </div>
  );
}
