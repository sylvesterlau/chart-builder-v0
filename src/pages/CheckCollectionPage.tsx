import { Button, Stack, VerticalSpace, Text } from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback } from "preact/hooks";

interface CheckCollectionPageProps {
  onBack: () => void;
}

export default function CheckCollectionPage({
  onBack,
}: CheckCollectionPageProps) {
  const handleInspectClick = useCallback(function () {
    emit("INSPECT_LIBRARY");
  }, []);

  return (
    <div>
      <VerticalSpace space="medium" />
      <Button secondary onClick={onBack}>
        ← Back
      </Button>
      <VerticalSpace space="medium" />

      <h2>Check Collection</h2>
      <VerticalSpace space="large" />

      <Stack space="small">
        <Text>Inspect collections key from team library</Text>
        <Button fullWidth onClick={handleInspectClick}>
          Inspect Collections Key
        </Button>
      </Stack>
    </div>
  );
}
