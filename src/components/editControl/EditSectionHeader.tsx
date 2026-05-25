import {
  IconButton,
  IconEyeSmall24,
  IconHiddenSmall24,
  Text,
} from "@create-figma-plugin/ui";
import { h } from "preact";
import styles from "../../ui.css";

interface EditSectionHeaderProps {
  hideTitle: string;
  onVisibilityToggle: () => void;
  showTitle: string;
  title: string;
  visible: boolean;
}

function EditSectionHeader({
  hideTitle,
  onVisibilityToggle,
  showTitle,
  title,
  visible,
}: EditSectionHeaderProps) {
  return (
    <div className={styles.editSectionHeader}>
      <Text className={styles.sectionTitle}>{title}</Text>
      <IconButton
        onClick={onVisibilityToggle}
        title={visible ? hideTitle : showTitle}
      >
        {visible ? <IconEyeSmall24 /> : <IconHiddenSmall24 />}
      </IconButton>
    </div>
  );
}

export default EditSectionHeader;
