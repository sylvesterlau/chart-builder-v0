import {
  Button,
  Columns,
  Container,
  render,
  Textbox,
  Text,
  TextboxNumeric,
  VerticalSpace,
  Stack,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback, useState } from "preact/hooks";

import { CloseHandler, CreateRectanglesHandler } from "./types";

function Plugin() {
  const [count, setCount] = useState<number | null>(5);
  const [countString, setCountString] = useState("5");

  const [itemA, setItemA] = useState<number | null>(null);
  const [itemALabel, setItemALabel] = useState<string>("");
  const [itemB, setItemB] = useState<number | null>(null);
  const [itemBLabel, setItemBLabel] = useState<string>("");
  const [itemC, setItemC] = useState<number | null>(null);
  const [itemCLabel, setItemCLabel] = useState<string>("");
  const [itemD, setItemD] = useState<number | null>(null);
  const [itemDLabel, setItemDLabel] = useState<string>("");
  const [itemE, setItemE] = useState<number | null>(null);
  const [itemELabel, setItemELabel] = useState<string>("");

  const handleGenerateButtonClick = useCallback(
    function () {
      // 构建包含 label 和 value 的数组并打印到控制台
      const chartData = {
        chartData: [
          { label: itemALabel, value: itemA },
          { label: itemBLabel, value: itemB },
          { label: itemCLabel, value: itemC },
          { label: itemDLabel, value: itemD },
          { label: itemELabel, value: itemE },
        ],
      };
      console.log("ChartData:", chartData);
    },
    [
      itemA,
      itemALabel,
      itemB,
      itemBLabel,
      itemC,
      itemCLabel,
      itemD,
      itemDLabel,
      itemE,
      itemELabel,
    ]
  );
  return (
    <Container space="medium">
      <VerticalSpace space="medium" />
      <h2>Chart builder v0</h2>
      <VerticalSpace space="large" />

      {/* input field  */}
      <Stack space="extraSmall">
        {/* Item A */}
        <Text>Item A</Text>
        <Columns space="extraSmall">
          <Textbox
            onValueInput={setItemALabel}
            value={itemALabel}
            placeholder="Label A"
          />
          <TextboxNumeric
            onNumericValueInput={setItemA}
            value={itemA !== null ? String(itemA) : ""}
            placeholder="Value"
          />
        </Columns>
        <VerticalSpace space="extraSmall" />

        {/* Item B */}
        <Text>Item B</Text>
        <Columns space="extraSmall">
          <Textbox
            onValueInput={setItemBLabel}
            value={itemBLabel}
            placeholder="Label B"
          />
          <TextboxNumeric
            onNumericValueInput={setItemB}
            value={itemB !== null ? String(itemB) : ""}
            placeholder="Value"
          />
        </Columns>
        <VerticalSpace space="extraSmall" />

        {/* Item C */}
        <Text>Item C</Text>
        <Columns space="extraSmall">
          <Textbox
            onValueInput={setItemCLabel}
            value={itemCLabel}
            placeholder="Label C"
          />
          <TextboxNumeric
            onNumericValueInput={setItemC}
            value={itemC !== null ? String(itemC) : ""}
            placeholder="Value"
          />
        </Columns>
        <VerticalSpace space="extraSmall" />

        {/* Item D */}
        <Text>Item D</Text>
        <Columns space="extraSmall">
          <Textbox
            onValueInput={setItemDLabel}
            value={itemDLabel}
            placeholder="Label D"
          />
          <TextboxNumeric
            onNumericValueInput={setItemD}
            value={itemD !== null ? String(itemD) : ""}
            placeholder="Value"
          />
        </Columns>
        <VerticalSpace space="extraSmall" />

        {/* Item E */}
        <Text>Item E</Text>
        <Columns space="extraSmall">
          <Textbox
            onValueInput={setItemELabel}
            value={itemELabel}
            placeholder="Label E"
          />
          <TextboxNumeric
            onNumericValueInput={setItemE}
            value={itemE !== null ? String(itemE) : ""}
            placeholder="Value"
          />
        </Columns>
        <VerticalSpace space="extraSmall" />
      </Stack>

      <VerticalSpace space="extraLarge" />

      {/* button group */}
      <Columns space="extraSmall">
        <Button fullWidth onClick={handleGenerateButtonClick}>
          Generate
        </Button>
      </Columns>
      <VerticalSpace space="small" />
    </Container>
  );
}

export default render(Plugin);
