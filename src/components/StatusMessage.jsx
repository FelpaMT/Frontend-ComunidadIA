import React from "react";

export default function StatusMessage({ type = "info", message }) {
  if (!message) return null;
  let cls = "status status-info";
  if (type === "success") cls = "status status-success";
  if (type === "error") cls = "status status-error";

  return <div className={cls}>{message}</div>;
}
