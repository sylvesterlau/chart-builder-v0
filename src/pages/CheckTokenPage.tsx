import {
  Button,
  Stack,
  VerticalSpace,
  Text,
  Textbox,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback, useState } from "preact/hooks";

interface CheckTokenPageProps {
  onBack: () => void;
}

export default function CheckTokenPage({ onBack }: CheckTokenPageProps) {
  const [tokenPath, setTokenPath] = useState<string>("");

  const handleLookupClick = useCallback(
    function () {
      emit("LOOKUP_TOKEN", tokenPath);
    },
    [tokenPath]
  );

  return (
    <div>
      <VerticalSpace space="medium" />
      <Button secondary onClick={onBack}>
        ← Back
      </Button>
      <VerticalSpace space="medium" />

      <h2>Check Token Key</h2>
      <VerticalSpace space="large" />

      <Stack space="small">
        <Text>Enter token path to find its key</Text>
        <Textbox
          onValueInput={setTokenPath}
          value={tokenPath}
          placeholder="e.g. semantic.color.fill.dataVis.general.01"
        />
        <Button fullWidth onClick={handleLookupClick}>
          Find Token Key
        </Button>
      </Stack>
    </div>
  );
}
