import {
  Button,
  Divider,
  IconCopySmall24,
  Stack,
  Text,
  TextboxMultiline,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import { parseTokenPathLines } from "../helpers";
import type {
  SelectedTextStyleKeyResult,
  TokenVarKeyLookupResult,
} from "../types";
import { copyTextToClipboard } from "../utils/copyToClipboard";
import uiStyles from "../ui.css";

type LookupStatus = "found" | "multiple" | "not_found" | "error";

function lookupStatusLabel(status: LookupStatus): string {
  if (status === "multiple") {
    return "Multiple matches";
  }
  if (status === "error") {
    return "Error";
  }
  return "Not found";
}

interface TokenLookupCopyButtonProps {
  keyValue: string;
  copied: boolean;
  onCopy: (key: string) => void;
}

function TokenLookupCopyButton(props: TokenLookupCopyButtonProps) {
  const { keyValue, copied, onCopy } = props;
  const actionsClassName = copied
    ? `${uiStyles.tokenLookupCopyActions} ${uiStyles.tokenLookupCopyActionsVisible}`
    : uiStyles.tokenLookupCopyActions;

  return (
    <div className={actionsClassName}>
      {copied ? (
        <span className={uiStyles.tokenLookupCopiedFeedback}>Copied</span>
      ) : null}
      <button
        type="button"
        className={`${uiStyles.navBackButton} ${uiStyles.tokenLookupCopyBtn}${
          copied ? ` ${uiStyles.tokenLookupCopyBtnCopied}` : ""
        }`}
        title={copied ? "Copied" : "Copy key"}
        onClick={function () {
          onCopy(keyValue);
        }}
      >
        <IconCopySmall24 />
      </button>
    </div>
  );
}

/** Variable batch lookup + text style key from selection (Design system Util). */
export function TokenKeyLookupPanel() {
  const [tokenPaths, setTokenPaths] = useState<string>("");
  const [varLoading, setVarLoading] = useState<boolean>(false);
  const [styleLoading, setStyleLoading] = useState<boolean>(false);
  const [varResults, setVarResults] = useState<TokenVarKeyLookupResult[]>([]);
  const [styleResult, setStyleResult] =
    useState<SelectedTextStyleKeyResult | null>(null);
  const [varHasSearched, setVarHasSearched] = useState<boolean>(false);
  const [styleHasRead, setStyleHasRead] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyKey = useCallback(function (key: string) {
    if (!copyTextToClipboard(key)) {
      return;
    }
    setCopiedKey(key);
    window.setTimeout(function () {
      setCopiedKey(null);
    }, 1500);
  }, []);

  useEffect(function subscribeVarLookupResults() {
    return on("TOKEN_VAR_KEY_LOOKUP_RESULTS", function (payload) {
      setVarResults(payload);
      setVarLoading(false);
      setVarHasSearched(true);
    });
  }, []);

  useEffect(function subscribeSelectedTextStyleResult() {
    return on("SELECTED_TEXT_STYLE_KEY_RESULT", function (payload) {
      setStyleResult(payload);
      setStyleLoading(false);
      setStyleHasRead(true);
    });
  }, []);

  const handleVarLookup = useCallback(
    function () {
      const paths = parseTokenPathLines(tokenPaths);
      if (paths.length === 0) {
        setVarResults([]);
        setVarHasSearched(true);
        return;
      }
      setVarLoading(true);
      emit("LOOKUP_TOKEN_VAR_KEYS", paths);
    },
    [tokenPaths],
  );

  const handleReadSelectedStyle = useCallback(function () {
    setStyleLoading(true);
    emit("READ_SELECTED_TEXT_STYLE_KEY");
  }, []);

  return (
    <div>
      <Text className={uiStyles.sectionTitle}>Variable key lookup</Text>
      <VerticalSpace space="extraSmall" />
      <Text>
        Lookup variable import keys for importVariableByKeyAsync (one path per
        line)
      </Text>
      <VerticalSpace space="small" />
      <Stack space="extraSmall">
        <TextboxMultiline
          grow
          value={tokenPaths}
          onValueInput={setTokenPaths}
          placeholder={"dataVis/1\ntext/primary"}
        />
        <Button fullWidth disabled={varLoading} onClick={handleVarLookup}>
          {varLoading ? "Looking up…" : "Lookup"}
        </Button>
      </Stack>

      {varHasSearched ? (
        <div>
          <VerticalSpace space="medium" />
          <Text className={uiStyles.sectionTitle}>Results</Text>
          <VerticalSpace space="small" />
          {varResults.length === 0 ? (
            <Text>Enter at least one token path.</Text>
          ) : (
            <div className={uiStyles.tokenLookupList}>
              {varResults.map(function (result) {
                const showCopyOnRow =
                  result.status === "found" && Boolean(result.key);
                const rowCopyVisible =
                  showCopyOnRow && copiedKey === result.key;

                const rowClassName = rowCopyVisible
                  ? `${uiStyles.tokenLookupRow} ${uiStyles.tokenLookupRowCopyVisible}`
                  : uiStyles.tokenLookupRow;

                return (
                  <div key={result.path} className={rowClassName}>
                    <div className={uiStyles.tokenLookupHeader}>
                      <span className={uiStyles.tokenLookupPath}>
                        {result.path}
                      </span>
                      {showCopyOnRow ? (
                        <TokenLookupCopyButton
                          keyValue={result.key!}
                          copied={copiedKey === result.key}
                          onCopy={handleCopyKey}
                        />
                      ) : (
                        <span className={uiStyles.tokenLookupStatus}>
                          {lookupStatusLabel(result.status)}
                        </span>
                      )}
                    </div>
                    {showCopyOnRow ? (
                      <code className={uiStyles.tokenLookupKey}>
                        {result.key}
                      </code>
                    ) : null}
                    {result.status === "multiple" && result.matches ? (
                      <div className={uiStyles.tokenLookupMatchList}>
                        {result.matches.map(function (match) {
                          const matchCopyVisible = copiedKey === match.key;
                          const matchRowClassName = matchCopyVisible
                            ? `${uiStyles.tokenLookupKeyRow} ${uiStyles.tokenLookupKeyRowCopyVisible}`
                            : uiStyles.tokenLookupKeyRow;

                          return (
                            <div
                              key={`${match.key}-${match.collectionName}`}
                              className={matchRowClassName}
                            >
                              <code className={uiStyles.tokenLookupKey}>
                                {match.key}
                              </code>
                              <TokenLookupCopyButton
                                keyValue={match.key}
                                copied={copiedKey === match.key}
                                onCopy={handleCopyKey}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                    {result.message && result.status !== "found" ? (
                      <Text className={uiStyles.tokenLookupMessage}>
                        {result.message}
                      </Text>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      <VerticalSpace space="large" />
      <Divider />
      <VerticalSpace space="large" />

      <Text className={uiStyles.sectionTitle}>Text style key from selection</Text>
      <VerticalSpace space="extraSmall" />
      <Text>
        Select one text layer that already uses a text style, then read its
        import key for importStyleByKeyAsync
      </Text>
      <VerticalSpace space="small" />
      <Button fullWidth disabled={styleLoading} onClick={handleReadSelectedStyle}>
        {styleLoading ? "Reading…" : "Read from selection"}
      </Button>

      {styleHasRead && styleResult ? (
        <div>
          <VerticalSpace space="medium" />
          <Text className={uiStyles.sectionTitle}>Result</Text>
          <VerticalSpace space="small" />
          <div className={uiStyles.tokenLookupList}>
            <div
              className={
                styleResult.status === "found" && copiedKey === styleResult.key
                  ? `${uiStyles.tokenLookupRow} ${uiStyles.tokenLookupRowCopyVisible}`
                  : uiStyles.tokenLookupRow
              }
            >
              {styleResult.layerName ? (
                <Text className={uiStyles.tokenLookupMessage}>
                  Layer: {styleResult.layerName}
                </Text>
              ) : null}
              {styleResult.styleName ? (
                <Text className={uiStyles.tokenLookupMessage}>
                  Style: {styleResult.styleName}
                </Text>
              ) : null}
              <div className={uiStyles.tokenLookupHeader}>
                <span className={uiStyles.tokenLookupPath}>import key</span>
                {styleResult.status === "found" && styleResult.key ? (
                  <TokenLookupCopyButton
                    keyValue={styleResult.key}
                    copied={copiedKey === styleResult.key}
                    onCopy={handleCopyKey}
                  />
                ) : (
                  <span className={uiStyles.tokenLookupStatus}>
                    {lookupStatusLabel(styleResult.status)}
                  </span>
                )}
              </div>
              {styleResult.status === "found" && styleResult.key ? (
                <code className={uiStyles.tokenLookupKey}>{styleResult.key}</code>
              ) : null}
              {styleResult.message && styleResult.status !== "found" ? (
                <Text className={uiStyles.tokenLookupMessage}>
                  {styleResult.message}
                </Text>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
