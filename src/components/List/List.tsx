import { IconChevronRightLarge24 } from "@create-figma-plugin/ui";
import { h } from "preact";
import styles from "./List.module.css";
interface ListProps {
  icon?: h.JSX.Element;
  title: string;
  onClick?: () => void;
  disable?: boolean | false;
}
export default function List({ icon, title, onClick, disable }: ListProps) {
  const listContainerClass = !disable
    ? styles.listContainer
    : styles.listContainerDisable;
  return (
    <div
      className={listContainerClass}
      onClick={!disable ? onClick : undefined}
    >
      {icon && <div style={{ marginRight: "8px" }}>{icon}</div>}
      <h3 className={styles.listTitle}>{title}</h3>
      <IconChevronRightLarge24 />
    </div>
  );
}
