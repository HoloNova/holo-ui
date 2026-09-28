"use client";

import type { ChangeEvent, DragEvent, KeyboardEvent } from "react";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion, useTransform, type HTMLMotionProps, type MotionProps, type TargetAndTransition, type Transition } from "motion/react";
import { File, FileArchive, FileImage, FileText, RotateCw, UploadCloud, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

// ── Motion Tokens Presets ──
export const motionTokens = {
  duration: { instant: 0.12, fast: 0.16, exit: 0.18, standard: 0.24, considered: 0.48 },
  ease: {
    enter: [0.16, 1, 0.3, 1],
    exit: [0.7, 0, 0.84, 0],
    standard: [0.22, 1, 0.36, 1],
    inOut: [0.65, 0, 0.35, 1],
  },
  spring: {
    responsive: { type: "spring", stiffness: 520, damping: 38 },
    gentle: { type: "spring", stiffness: 340, damping: 34 },
    snappy: { type: "spring", visualDuration: 0.26, bounce: 0.12 },
    smooth: { type: "spring", visualDuration: 0.4, bounce: 0 },
    morph: { type: "spring", visualDuration: 0.42, bounce: 0.16 },
  },
  stagger: { char: 0.016, word: 0.04, line: 0.08, item: 0.035 },
  blur: { subtle: 2, soft: 4, text: 8 },
} as const;

// ── Scoped CSS & Styles Proxy ──
const ARC_FILE_UPLOAD_STYLES = `.arc-file-upload-root { display: grid; width: 100%; min-width: 0; color: var(--foreground); }
.arc-file-upload-input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; clip-path: inset(50%); }
/* A full-width drop target: press feedback is color only, never a scale. */
.arc-file-upload-dropzone { display: flex; min-height: 92px; align-items: center; gap: 12px; padding: 16px; border: 1px dashed var(--border-strong); border-radius: var(--radius-panel); background: var(--surface); cursor: pointer; transition: border-color var(--duration-standard) var(--ease-standard), background-color var(--duration-standard) var(--ease-standard); }
.arc-file-upload-dropzone.dragging, .arc-file-upload-dropzone:not(.arc-file-upload-disabled):active { border-color: var(--accent); background: var(--accent-subtle); }
.arc-file-upload-dropzone:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 3px; }
.arc-file-upload-dropzone.disabled { cursor: not-allowed; opacity: .52; }
.arc-file-upload-uploadIcon, .arc-file-upload-fileIcon { display: grid; flex: 0 0 auto; place-items: center; color: var(--accent-strong); }
/* The cloud lifts toward the file while it hovers over the drop target. */
.arc-file-upload-uploadIcon { width: 24px; height: 24px; transition: transform var(--duration-spring) var(--ease-spring); }
.arc-file-upload-dragging .arc-file-upload-uploadIcon { transform: translateY(-3px); }
.arc-file-upload-copy { display: grid; min-width: 0; gap: 3px; flex: 1; }
.arc-file-upload-copy strong { font-size: var(--text-sm); font-weight: 500; }
.arc-file-upload-label { position: relative; display: block; min-width: 0; }
.arc-file-upload-labelText { display: block; }
.arc-file-upload-copy > span { overflow: hidden; color: var(--text-muted); font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }
.arc-file-upload-browse { flex: 0 0 auto; color: var(--accent-strong); font-size: var(--text-xs); font-weight: 500; }
.arc-file-upload-statusFrame { overflow: hidden; }
.arc-file-upload-status { position: relative; min-height: 16px; margin: 0; padding-top: 8px; color: var(--text-muted); font-size: var(--text-xs); }
.arc-file-upload-statusText { display: block; }
.arc-file-upload-fileList { display: grid; margin: 0; padding: 0; list-style: none; }
/* The gap lives inside the clipped row, so a collapsing row reaches zero height instead of stopping at its padding. */
.arc-file-upload-fileRow { overflow: hidden; }
.arc-file-upload-fileItem { display: flex; margin-top: 6px; min-width: 0; align-items: center; gap: 9px; padding: 9px 10px; border: 1px solid var(--border-subtle); border-radius: var(--radius-control); background: var(--surface-muted); }
.arc-file-upload-fileIcon { width: 24px; height: 24px; color: var(--text-secondary); }
.arc-file-upload-fileCopy { display: grid; min-width: 0; flex: 1; gap: 2px; }
.arc-file-upload-fileCopy strong { overflow: hidden; font-size: var(--text-xs); font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.arc-file-upload-fileCopy > span { color: var(--text-muted); font-size: 11px; }
.arc-file-upload-meta { display: flex; min-width: 0; white-space: nowrap; font-variant-numeric: tabular-nums; }
.arc-file-upload-phase { position: relative; display: inline-block; }
.arc-file-upload-phaseText { display: block; }
.arc-file-upload-percent { display: inline-block; min-width: 4ch; }
.arc-file-upload-fileCopy .arc-file-upload-error { color: var(--danger); }
.arc-file-upload-barFrame { display: block; }
.arc-file-upload-bar { display: block; height: 3px; margin: 5px 0 1px; overflow: hidden; border-radius: 99px; background: var(--border); }
.arc-file-upload-barFill { display: block; width: 100%; height: 100%; border-radius: inherit; background: var(--accent); }
.arc-file-upload-statusSlot { position: relative; display: grid; width: 26px; height: 26px; flex: 0 0 auto; place-items: center; }
.arc-file-upload-retrySlot { display: grid; place-items: center; }
.arc-file-upload-ready { display: grid; width: 22px; height: 22px; place-items: center; color: var(--success); }
.arc-file-upload-remove, .arc-file-upload-retry { display: grid; width: 26px; height: 26px; flex: 0 0 auto; place-items: center; border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--text-muted); cursor: pointer; transition: transform var(--duration-spring) var(--ease-spring), background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard); }
.arc-file-upload-retry { color: var(--danger); }
/* Quick press, spring release. */
.arc-file-upload-remove:active, .arc-file-upload-retry:active { transform: scale(.96); transition-duration: var(--duration-instant); transition-timing-function: var(--ease-standard); }
.arc-file-upload-remove:focus-visible, .arc-file-upload-retry:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
@media (hover: hover) and (pointer: fine) {
  .arc-file-upload-dropzone:not(.arc-file-upload-disabled):hover { border-color: var(--accent); background: var(--accent-subtle); }
  .arc-file-upload-remove:hover, .arc-file-upload-retry:hover { background: var(--surface); color: var(--foreground); }
}
.arc-file-upload-srOnly { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (prefers-reduced-motion: reduce) { .arc-file-upload-dropzone, .arc-file-upload-uploadIcon, .arc-file-upload-remove, .arc-file-upload-retry { transition: none; } .arc-file-upload-dragging .arc-file-upload-uploadIcon, .arc-file-upload-remove:active, .arc-file-upload-retry:active { transform: none; } }
`;

const styles: Record<string, string> = new Proxy({
  "bar": "arc-file-upload-bar",
  "barFill": "arc-file-upload-barFill",
  "barFrame": "arc-file-upload-barFrame",
  "browse": "arc-file-upload-browse",
  "copy": "arc-file-upload-copy",
  "disabled": "arc-file-upload-disabled",
  "dragging": "arc-file-upload-dragging",
  "dropzone": "arc-file-upload-dropzone",
  "error": "arc-file-upload-error",
  "fileCopy": "arc-file-upload-fileCopy",
  "fileIcon": "arc-file-upload-fileIcon",
  "fileItem": "arc-file-upload-fileItem",
  "fileList": "arc-file-upload-fileList",
  "fileRow": "arc-file-upload-fileRow",
  "input": "arc-file-upload-input",
  "label": "arc-file-upload-label",
  "labelText": "arc-file-upload-labelText",
  "meta": "arc-file-upload-meta",
  "percent": "arc-file-upload-percent",
  "phase": "arc-file-upload-phase",
  "phaseText": "arc-file-upload-phaseText",
  "ready": "arc-file-upload-ready",
  "remove": "arc-file-upload-remove",
  "retry": "arc-file-upload-retry",
  "retrySlot": "arc-file-upload-retrySlot",
  "root": "arc-file-upload-root",
  "srOnly": "arc-file-upload-srOnly",
  "status": "arc-file-upload-status",
  "statusFrame": "arc-file-upload-statusFrame",
  "statusSlot": "arc-file-upload-statusSlot",
  "statusText": "arc-file-upload-statusText",
  "uploadIcon": "arc-file-upload-uploadIcon"
}, {
  get: (target: any, prop: string) => target[prop] || `arc-file-upload-${prop}`,
});



export type FileUploadItem = { id: string; file: File; error?: string };

export interface FileUploadProps {
  accept?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
  multiple?: boolean;
  maxSize?: number;
  value?: FileUploadItem[];
  onChange?: (files: FileUploadItem[]) => void;
  /** Uploads each accepted file. Report progress from 0 to 100, resolve when done, or reject to mark the file as failed. Removing a file aborts its signal. */
  onUpload?: (file: File, options: { onProgress: (percent: number) => void; signal: AbortSignal }) => Promise<void>;
}

type Upload = { status: "uploading" | "done" | "failed"; progress: number };

const enter: Transition = { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
const exitFast: Transition = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
const instant: Transition = { duration: 0 };
const textIn: TargetAndTransition = { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: exitFast };
const iconIn: TargetAndTransition = { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)` };
const shown: TargetAndTransition = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };

function FileTypeIcon({ file }: { file: File }) {
  const props = { size: 16, strokeWidth: 1.8, "aria-hidden": true } as const;
  if (file.type.startsWith("image/")) return <FileImage {...props} />;
  if (file.type.startsWith("text/")) return <FileText {...props} />;
  if (file.type.includes("zip") || file.name.endsWith(".gz")) return <FileArchive {...props} />;
  return <File {...props} />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Outgoing copies are hidden from assistive tech while they fade, so live text reads only the current message. */
function Swap(props: HTMLMotionProps<"span">) {
  const present = useIsPresent();
  return <motion.span {...props} aria-hidden={present ? props["aria-hidden"] : true} />;
}

function FileRow({ item, upload, reduce, onRemove, onRetry, removeRef }: { item: FileUploadItem; upload?: Upload; reduce: boolean | null; onRemove: () => void; onRetry: () => void; removeRef: (node: HTMLButtonElement | null) => void }) {
  const phase = item.error ? "invalid" : upload?.status ?? "ready";
  // One spring drives the bar and the counted percentage, so both always agree.
  const progress = useMotionValue(upload?.progress ?? 0);
  // The fill slides in from the left instead of scaling, so its rounded end keeps its shape at every value.
  const x = useTransform(progress, latest => `${Math.min(Math.max(latest, 0), 100) - 100}%`);
  const percent = useTransform(progress, latest => `${Math.round(Math.min(Math.max(latest, 0), 100))}%`);
  const target = upload?.status === "done" ? 100 : upload?.progress ?? 0;
  useEffect(() => {
    if (reduce) { progress.jump(target); return; }
    const controls = animate(progress, target, motionTokens.spring.smooth);
    return () => controls.stop();
  }, [target, progress, reduce]);
  const swap: MotionProps = { initial: reduce ? { opacity: 0 } : textIn, animate: shown, exit: reduce ? fadeOut : textOut, transition: reduce ? instant : enter };
  return <div className={styles.fileItem}>
    <span className={styles.fileIcon}><FileTypeIcon file={item.file} /></span>
    <span className={styles.fileCopy}>
      <strong title={item.file.name}>{item.file.name}</strong>
      <span className={styles.meta}>{formatSize(item.file.size)}{upload ? <><span aria-hidden="true"> · </span><span className={styles.phase}><AnimatePresence mode="popLayout" initial={false}>
        <Swap key={upload.status} className={upload.status === "failed" ? `${styles.phaseText} ${styles.error}` : styles.phaseText} {...swap}>{upload.status === "uploading" ? <>Uploading <motion.span className={styles.percent}>{percent}</motion.span></> : upload.status === "done" ? "Uploaded" : "Upload failed"}</Swap>
      </AnimatePresence></span></> : null}</span>
      {item.error && <span className={styles.error}>{item.error}</span>}
      {/* The bar fills on a spring, then folds away once the file lands. */}
      <AnimatePresence initial={false}>{upload?.status === "uploading" && <motion.span key="bar" className={styles.barFrame} initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? fadeOut : { height: 0, opacity: 0, transition: { height: { ...motionTokens.spring.smooth, delay: .24 }, opacity: { ...exitFast, delay: .24 } } }} transition={reduce ? instant : { height: motionTokens.spring.smooth, opacity: enter }}>
        <span className={styles.bar}><motion.span className={styles.barFill} style={{ x }} /></span>
      </motion.span>}</AnimatePresence>
    </span>
    <span className={styles.statusSlot}>
      <AnimatePresence mode="popLayout" initial={false}>
        {(phase === "ready" || phase === "done") && <motion.span key="ready" className={styles.ready} initial={reduce ? { opacity: 0 } : { opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={fadeOut} transition={reduce ? instant : motionTokens.spring.snappy}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><motion.path d="M4 12.5l5 5L20 6.5" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ ...enter, delay: .08 }} /></svg>
          <span className={styles.srOnly}>{phase === "done" ? "Uploaded" : "Ready"}</span>
        </motion.span>}
        {/* The wrapper carries the entrance, so the button's own press scale never competes with it. */}
        {phase === "failed" && <motion.span key="retry" className={styles.retrySlot} initial={reduce ? { opacity: 0 } : iconIn} animate={shown} exit={reduce ? fadeOut : { ...iconIn, transition: exitFast }} transition={reduce ? instant : motionTokens.spring.snappy}>
          <button type="button" className={styles.retry} aria-label={`Retry ${item.file.name}`} onClick={onRetry}><RotateCw size={14} strokeWidth={1.8} aria-hidden="true" /></button>
        </motion.span>}
      </AnimatePresence>
    </span>
    <button ref={removeRef} type="button" className={styles.remove} aria-label={`Remove ${item.file.name}`} onClick={onRemove}><X size={15} aria-hidden="true" /></button>
  </div>;
}

export function FileUpload({
  accept,
  disabled = false,
  label = "Upload files",
  description = "Drop files here or browse from your device.",
  multiple = true,
  maxSize,
  value,
  onChange,
  onUpload,
}: FileUploadProps) {
  const inputId = useId();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [internalFiles, setInternalFiles] = useState<FileUploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("");
  const [uploads, setUploads] = useState<Record<string, Upload>>({});
  const dragDepth = useRef(0);
  const nextId = useRef(0);
  const controllers = useRef(new Map<string, AbortController>());
  const removeRefs = useRef(new Map<string, HTMLButtonElement>());
  const files = value ?? internalFiles;

  useEffect(() => {
    const active = controllers.current;
    return () => active.forEach(controller => controller.abort());
  }, []);

  function update(next: FileUploadItem[]) {
    if (value === undefined) setInternalFiles(next);
    onChange?.(next);
  }

  function startUpload(item: FileUploadItem) {
    if (!onUpload) return;
    controllers.current.get(item.id)?.abort();
    const controller = new AbortController();
    controllers.current.set(item.id, controller);
    const set = (next: (current?: Upload) => Upload) => setUploads(current => ({ ...current, [item.id]: next(current[item.id]) }));
    set(() => ({ status: "uploading", progress: 0 }));
    onUpload(item.file, {
      signal: controller.signal,
      onProgress: percent => { if (!controller.signal.aborted) set(current => ({ status: "uploading", progress: Math.min(Math.max(percent, current?.progress ?? 0), 100) })); },
    }).then(() => {
      if (controller.signal.aborted) return;
      set(() => ({ status: "done", progress: 100 }));
      setStatus(`${item.file.name} uploaded.`);
    }, () => {
      if (controller.signal.aborted) return;
      set(current => ({ status: "failed", progress: current?.progress ?? 0 }));
      setStatus(`${item.file.name} could not be uploaded.`);
    }).finally(() => { if (controllers.current.get(item.id) === controller) controllers.current.delete(item.id); });
  }

  function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList).slice(0, multiple ? undefined : 1);
    const acceptedTypes = accept?.split(",").map(type => type.trim().toLowerCase()).filter(Boolean) ?? [];
    const matchesAccept = (file: File) => acceptedTypes.length === 0 || acceptedTypes.some(type => type.startsWith(".")
      ? file.name.toLowerCase().endsWith(type)
      : type.endsWith("/*") ? file.type.startsWith(type.slice(0, -1)) : file.type === type);
    const accepted = incoming.map(file => ({
      id: `${file.name}-${file.lastModified}-${nextId.current++}`,
      file,
      error: !matchesAccept(file)
        ? "This file type is not accepted."
        : maxSize && file.size > maxSize ? `File is larger than ${formatSize(maxSize)}.` : undefined,
    }));
    if (!multiple) controllers.current.forEach(controller => controller.abort());
    update(multiple ? [...files, ...accepted] : accepted);
    const invalidCount = accepted.filter(item => item.error).length;
    setStatus(invalidCount ? `${accepted.length - invalidCount} file${accepted.length - invalidCount === 1 ? "" : "s"} added. ${invalidCount} needs attention.` : `${accepted.length} file${accepted.length === 1 ? "" : "s"} added.`);
    accepted.filter(item => !item.error).forEach(startUpload);
  }

  function removeFile(item: FileUploadItem) {
    controllers.current.get(item.id)?.abort();
    controllers.current.delete(item.id);
    // Keep keyboard focus in the list: the next row's remove button, else the previous one, else the dropzone.
    const index = files.findIndex(file => file.id === item.id);
    const neighbor = files[index + 1] ?? files[index - 1];
    update(files.filter(file => file.id !== item.id));
    setStatus(`${item.file.name} removed.`);
    requestAnimationFrame(() => (neighbor ? removeRefs.current.get(neighbor.id) : dropzoneRef.current)?.focus());
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (!disabled && event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!disabled) {
      dragDepth.current += 1;
      setDragging(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  const height: Transition = reduce ? instant : { height: motionTokens.spring.smooth, opacity: enter };
  return <div className={styles.root}>
    <input ref={inputRef} id={inputId} className={styles.input} type="file" accept={accept} multiple={multiple} disabled={disabled} onChange={handleInput} />
    <div
      ref={dropzoneRef}
      className={[styles.dropzone, dragging ? styles.dragging : "", disabled ? styles.disabled : ""].filter(Boolean).join(" ")}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-describedby={`${inputId}-description`}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragOver={event => event.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className={styles.uploadIcon}><UploadCloud size={20} strokeWidth={1.8} aria-hidden="true" /></span>
      {/* While a file hovers over the target the label says what releasing it will do. */}
      <span className={styles.copy}><strong className={styles.label}><AnimatePresence mode="popLayout" initial={false}><Swap key={dragging ? "drop" : "idle"} className={styles.labelText} initial={reduce ? { opacity: 0 } : textIn} animate={shown} exit={reduce ? fadeOut : textOut} transition={reduce ? instant : enter}>{dragging ? `Drop to add ${multiple ? "files" : "a file"}` : label}</Swap></AnimatePresence></strong><span id={`${inputId}-description`}>{description}</span></span>
      <span className={styles.browse}>Browse</span>
    </div>
    {/* The live region stays mounted; its frame opens on the first message and each new message rises in. */}
    <motion.div className={styles.statusFrame} initial={false} animate={{ height: status ? "auto" : 0 }} transition={height}>
      <p className={styles.status} aria-live="polite" aria-atomic="true"><AnimatePresence mode="popLayout" initial={false}>{status ? <Swap key={status} className={styles.statusText} initial={reduce ? { opacity: 0 } : textIn} animate={shown} exit={reduce ? fadeOut : textOut} transition={reduce ? instant : enter}>{status}</Swap> : null}</AnimatePresence></p>
    </motion.div>
    {/* Rows open and close their own height, so the list closes the gap when a file is removed. */}
    <motion.ul className={styles.fileList} aria-label="Selected files" aria-hidden={files.length === 0 ? true : undefined} initial={false} animate={{ paddingTop: files.length ? 6 : 0 }} transition={reduce ? instant : motionTokens.spring.smooth}>
      <AnimatePresence initial={false}>
        {files.map(item => <motion.li key={item.id} className={styles.fileRow} initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? fadeOut : { height: 0, opacity: 0, transition: { height: motionTokens.spring.smooth, opacity: exitFast } }} transition={height}>
          <FileRow item={item} upload={uploads[item.id]} reduce={reduce} onRemove={() => removeFile(item)} onRetry={() => startUpload(item)} removeRef={node => { if (node) removeRefs.current.set(item.id, node); else removeRefs.current.delete(item.id); }} />
        </motion.li>)}
      </AnimatePresence>
    </motion.ul>
  </div>;
}

export default FileUpload;
