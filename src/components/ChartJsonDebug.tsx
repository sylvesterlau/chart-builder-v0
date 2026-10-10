import { Button, Stack, Text } from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import type { ChartEditSession } from "../utils/chartPersistence";

/** Reads the node again so this inspector never presents an unsaved UI draft as stored data. */
export default function ChartJsonDebug({ session }: { session: ChartEditSession }) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState<string | null>(null);
  const [error, setError] = useState("");
  useEffect(() => on("SPIKE_CHART_JSON", (result: { nodeId: string; raw?: string; error?: string }) => {
    if (result.nodeId !== session.nodeId) return;
    setRaw(result.raw ?? null);
    setError(result.error ?? "");
  }), [session.nodeId]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  function refresh() {
    setRaw(null);
    setError("");
    emit("SPIKE_READ_CHART_JSON", session.nodeId);
  }
  let display = raw ?? "";
  if (raw !== null) {
    try { display = JSON.stringify(JSON.parse(raw), null, 2); } catch { /* Show corrupt metadata verbatim for diagnosis. */ }
  }
  function download() {
    if (raw === null) return;
    const url = URL.createObjectURL(new Blob([raw], { type: "application/json;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `hive-${session.record.chartType}-${session.nodeId.replace(/[^a-zA-Z0-9_-]/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  return <div>
    <Button secondary fullWidth onClick={() => { setOpen(true); refresh(); }}>查看 / 导出 JSON</Button>
    {open ? <div role="dialog" aria-modal="true" aria-label="图表 JSON 调试" style={{ position: "fixed", inset: 0, zIndex: 1000, background: "var(--figma-color-bg)", color: "var(--figma-color-text)", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <Text>图表 JSON 调试 · Frame {session.nodeId}</Text>
      <Text>读取的是 Frame 上已保存的 pluginData，不包含尚未保存的编辑。查看时排版缩进；导出保留原始 JSON。</Text>
      <Text>Key: hive_chart_config</Text>
      {error ? <div role="alert">{error}</div> : null}
      {raw === null && !error ? <Text>正在读取…</Text> : null}
      <textarea autoFocus readOnly aria-label="已保存的 JSON" value={display} style={{ flex: 1, minHeight: 100, width: "100%", resize: "none", fontFamily: "monospace", fontSize: 12, lineHeight: 1.5, background: "var(--figma-color-bg-secondary)", color: "var(--figma-color-text)", border: "1px solid var(--figma-color-border)", padding: 12 }} />
      <Stack space="small">
        <Button fullWidth disabled={raw === null} onClick={download}>导出 .json</Button>
        <Button secondary fullWidth onClick={refresh}>重新读取</Button>
        <Button secondary fullWidth onClick={() => setOpen(false)}>返回编辑</Button>
      </Stack>
    </div> : null}
  </div>;
}
