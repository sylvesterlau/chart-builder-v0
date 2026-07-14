import { h } from "preact";
import styles from "./WindowResizeGrip.module.css";

/** Visual-only; drag hit target comes from `usePluginWindowResize`. */
export function WindowResizeGrip() {
  return (
    <div className={styles.root} aria-hidden="true">
      <svg
        className={styles.svg}
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.5 1.5L1.5 10.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M10.5 5L5 10.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default WindowResizeGrip;
