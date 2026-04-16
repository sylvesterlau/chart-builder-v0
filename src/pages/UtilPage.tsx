import { Button, Container, Stack, Text, Textbox, VerticalSpace } from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback, useState } from "preact/hooks";

interface UtilPageProps {
  onBack: () => void;
}

function UtilPage({ onBack }: UtilPageProps) {
  const [tokenPath, setTokenPath] = useState<string>("");

  const handleLookup = useCallback(
    function () {
      if (!tokenPath.trim()) {
        return;
      }
      emit("LOOKUP_TOKEN_VAR_KEY", tokenPath.trim());
    },
    [tokenPath],
  );

  return (
    <Container space="medium">
      <VerticalSpace space="small" />
      <Button secondary onClick={onBack}>
        ← Back
      </Button>
      <VerticalSpace space="medium" />
      <h2>Util page</h2>
      <VerticalSpace space="extraSmall" />
      <Text>Lookup token variable key</Text>
      <VerticalSpace space="small" />
      <Stack space="extraSmall">
        <Textbox
          value={tokenPath}
          onValueInput={setTokenPath}
          placeholder="e.g. dataVis.general.01 or semantic.color..."
        />
        <Button fullWidth onClick={handleLookup}>
          Lookup
        </Button>
      </Stack>
    </Container>
  );
}

export default UtilPage;
