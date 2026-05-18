import {
  Button,
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
import type { TokenVarKeyLookupResult } from "../types";
import { copyTextToClipboard } from "../utils/copyToClipboard";
import uiStyles from "../ui.css";

function lookupStatusLabel(result: TokenVarKeyLookupResult): string {
  if (result.status === "multiple") {
    return "Multiple matches";
  }
  if (result.status === "error") {
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

/** Batch lookup Figma variable import keys by token path (Design system Util tab). */
export function TokenKeyLookupPanel() {
  const [tokenPaths, setTokenPaths] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<TokenVarKeyLookupResult[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
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

  useEffect(function subscribeLookupResults() {
    return on("TOKEN_VAR_KEY_LOOKUP_RESULTS", function (payload) {
      setResults(payload);
      setLoading(false);
      setHasSearched(true);
    });
  }, []);

  const handleLookup = useCallback(
    function () {
      const paths = parseTokenPathLines(tokenPaths);
      if (paths.length === 0) {
        setResults([]);
        setHasSearched(true);
        return;
      }
      setLoading(true);
      emit("LOOKUP_TOKEN_VAR_KEYS", paths);
    },
    [tokenPaths],
  );

  return (
    <div>
      <Text className={uiStyles.sectionTitle}>Token key lookup</Text>
      <VerticalSpace space="extraSmall" />
      <Text>Lookup variable import keys (one path per line)</Text>
      <VerticalSpace space="small" />
      <Stack space="extraSmall">
        <TextboxMultiline
          grow
          value={tokenPaths}
          onValueInput={setTokenPaths}
          placeholder={"token/path/1\ntoken/path/2\ntoken/path/3"}
        />
        <Button fullWidth disabled={loading} onClick={handleLookup}>
          {loading ? "Looking up…" : "Lookup"}
        </Button>
      </Stack>

      {hasSearched ? (
        <div>
          <VerticalSpace space="medium" />
          <Text className={uiStyles.sectionTitle}>Results</Text>
          <VerticalSpace space="small" />
          {results.length === 0 ? (
            <Text>Enter at least one token path.</Text>
          ) : (
            <div className={uiStyles.tokenLookupList}>
              {results.map(function (result) {
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
                          {lookupStatusLabel(result)}
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
    </div>
  );
}
