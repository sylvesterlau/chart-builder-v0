import { Button, Stack, VerticalSpace } from "@create-figma-plugin/ui";
import { h } from "preact";

interface HomePageProps {
  onNavigate: (page: "checkCollection" | "checkNode" | "checkToken") => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div>
      <VerticalSpace space="medium" />
      <h2>Fig Inspect</h2>
      <VerticalSpace space="extraLarge" />

      <Stack space="medium">
        <Button
          secondary
          fullWidth
          onClick={() => onNavigate("checkCollection")}
        >
          1. Check Collection
        </Button>

        <Button secondary fullWidth onClick={() => onNavigate("checkNode")}>
          2. Check Node
        </Button>

        <Button secondary fullWidth onClick={() => onNavigate("checkToken")}>
          3. Check Token Key
        </Button>
      </Stack>
    </div>
  );
}
