import { Button, Stack, VerticalSpace, Text } from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback } from "preact/hooks";

interface CheckNodePageProps {
  onBack: () => void;
}

export default function CheckNodePage({ onBack }: CheckNodePageProps) {
  const handleInspectClick = useCallback(function () {
    emit("INSPECT_COMP");
  }, []);

  return (
    <div>
      <VerticalSpace space="medium" />
      <Button secondary onClick={onBack}>
        ← Back
      </Button>
      <VerticalSpace space="medium" />

      <h2>Check Node</h2>
      <VerticalSpace space="large" />

      <Stack space="small">
        <Text>Select a node in Figma and check its details</Text>
        <Button fullWidth onClick={handleInspectClick}>
          Check Node Detail
        </Button>
      </Stack>
    </div>
  );
}
