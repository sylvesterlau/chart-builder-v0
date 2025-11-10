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
import { sampleData } from "./config";

function Plugin() {
  const [itemA, setItemA] = useState<number>(0),
    [itemALabel, setItemALabel] = useState<string>(""),
    [itemB, setItemB] = useState<number>(0),
    [itemBLabel, setItemBLabel] = useState<string>(""),
    [itemC, setItemC] = useState<number>(0),
    [itemCLabel, setItemCLabel] = useState<string>(""),
    [itemD, setItemD] = useState<number>(0),
    [itemDLabel, setItemDLabel] = useState<string>(""),
    [itemE, setItemE] = useState<number>(0),
    [itemELabel, setItemELabel] = useState<string>("");

  // 处理数值输入的包装函数，确保空值时返回 0
  const handleNumericInput = useCallback((setter: (value: number) => void) => {
    return (value: number | null) => setter(value ?? 0);
  }, []);

  const handleGenerateButtonClick = useCallback(
    function () {
      const chartData = {
        data: [
          { label: itemALabel, value: itemA },
          { label: itemBLabel, value: itemB },
          { label: itemCLabel, value: itemC },
          { label: itemDLabel, value: itemD },
          { label: itemELabel, value: itemE },
        ],
      };
      // send data to main.ts
      emit("SUBMIT_CHART_DATA", chartData);
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

  // use sample data
  const handleUseSampleData = useCallback(function () {
    const data = sampleData.spending.data;
    setItemALabel(data[0].label);
    setItemA(data[0].value);
    setItemBLabel(data[1].label);
    setItemB(data[1].value);
    setItemCLabel(data[2].label);
    setItemC(data[2].value);
    setItemDLabel(data[3].label);
    setItemD(data[3].value);
    setItemELabel(data[4].label);
    setItemE(data[4].value);
  }, []);

  const handleTestBtnClick = useCallback(function () {
    // emit an event to main.ts to check variable collections
    emit("TEST_Click");
  }, []);

  return (
    <Container space="medium">
      <VerticalSpace space="medium" />
      <h2>Chart builder v0</h2>
      <VerticalSpace space="large" />

      {/* input field stack */}
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
            onNumericValueInput={handleNumericInput(setItemA)}
            value={String(itemA)}
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
            onNumericValueInput={handleNumericInput(setItemB)}
            value={String(itemB)}
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
            onNumericValueInput={handleNumericInput(setItemC)}
            value={String(itemC)}
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
            onNumericValueInput={handleNumericInput(setItemD)}
            value={String(itemD)}
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
            onNumericValueInput={handleNumericInput(setItemE)}
            value={String(itemE)}
            placeholder="Value"
          />
        </Columns>
        <VerticalSpace space="extraSmall" />
      </Stack>

      <VerticalSpace space="extraLarge" />

      {/* button group */}
      <Stack space="extraSmall">
        <Button secondary fullWidth onClick={handleUseSampleData}>
          Use sample data
        </Button>
        <Button fullWidth onClick={handleGenerateButtonClick}>
          Generate
        </Button>
        <VerticalSpace space="extraSmall" />
        <Button fullWidth secondary onClick={handleTestBtnClick}>
          Test
        </Button>
      </Stack>
    </Container>
  );
}

export default render(Plugin);
