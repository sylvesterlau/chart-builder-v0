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

  // 使用 number 类型（不允许 null）并设置默认值为 0
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
      // 构建包含 label 和 value 的数组
      const chartData = {
        data: [
          { label: itemALabel, value: itemA },
          { label: itemBLabel, value: itemB },
          { label: itemCLabel, value: itemC },
          { label: itemDLabel, value: itemD },
          { label: itemELabel, value: itemE },
        ],
      };
      // 触发主线程事件，传递数据
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

  //test button
  const handleTestButtonClick = useCallback(function () {
    // emit("TEST_BTN");
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
      <Columns space="extraSmall">
        <Button fullWidth onClick={handleGenerateButtonClick}>
          Generate
        </Button>
        <Button disabled fullWidth onClick={handleTestButtonClick}>
          TEST Btn
        </Button>
      </Columns>
      <VerticalSpace space="small" />
    </Container>
  );
}

export default render(Plugin);
