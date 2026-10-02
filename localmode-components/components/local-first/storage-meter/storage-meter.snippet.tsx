"use client";

import { HardDrive } from "lucide-react";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Inlined cn utility ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// --- Inlined browser-utils ---
/**
 * Generic, dependency-free browser utilities shared by LocalMode UI
 * components. These are plain DOM/File/FileReader helpers with no AI and no
 * `@localmode/*` dependency, so the components that use them install and
 * compile in any React app.
 *
 * Ported from the equivalent helpers in `@localmode/core` (`formatBytes`) and
 * `@localmode/react` (`useObjectUrl`, `validateFile`, `readFileAsDataUrl`,
 * `downloadBlob`); copy-owned here so the registry stays portable.
 */


/**
 * Format a byte count into a human-readable string (e.g. `1.5 MB`).
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

/** A recoverable file-validation failure. */
export interface FileValidationError {
  /** Human-readable message for display. */
  message: string;
  /** Always `true` — the user can pick a different file and retry. */
  recoverable?: boolean;
}

/** Options for {@link validateFile}. */
export interface ValidateFileOptions {
  /** The file to validate. */
  file: File;
  /** Accepted MIME types (e.g. `['image/png', 'image/jpeg']`). */
  accept?: string[];
  /** Maximum file size in bytes. */
  maxSize?: number;
}

/**
 * Validate a file against type and size constraints. Returns a
 * {@link FileValidationError} if invalid, or `null` if valid.
 */
export function validateFile(options: ValidateFileOptions): FileValidationError | null {
  const { file, accept, maxSize } = options;

  if (accept && !accept.includes(file.type)) {
    return {
      message: `Unsupported file type "${file.type}". Accepted types: ${accept.join(', ')}`,
      recoverable: true,
    };
  }

  if (maxSize !== undefined && file.size > maxSize) {
    const maxMB = (maxSize / 1_000_000).toFixed(0);
    return {
      message: `File too large (${(file.size / 1_000_000).toFixed(1)}MB). Maximum size: ${maxMB}MB`,
      recoverable: true,
    };
  }

  return null;
}

/**
 * Read a browser `File` as a base64 data URL string (e.g.
 * `data:image/png;base64,...`). Rejects with the `FileReader` error on failure.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Trigger a file download from in-memory content. Creates a temporary object
 * URL, clicks a synthetic anchor, and revokes the URL.
 *
 * @param content - String or `Blob` to download.
 * @param filename - The download filename.
 * @param mimeType - MIME type when `content` is a string (default `text/plain`).
 */
export function downloadBlob(
  content: string | Blob,
  filename: string,
  mimeType = 'text/plain'
): void {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Derive a stable object URL from a `Blob`, revoking it automatically when the
 * blob changes or the component unmounts. Returns `null` for a null/undefined
 * blob, during SSR, and on the first render after a change (the URL is created
 * in an effect so server and client markup match).
 */
export function useObjectUrl(blob: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const supported = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
    const objectUrl = blob && supported ? URL.createObjectURL(blob) : null;

    // The object URL is an external resource created here rather than during
    // render, so SSR and the first client render both emit null. Reflecting it
    // back into React state is the only way to render it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(objectUrl);

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [blob]);

  return url;
}

/* Image / canvas helpers (transparent-background compositing, result → data URL). */

/** A plain RGBA / single-channel byte buffer — DOM-free so the kernel node-tests. */
type PixelBuffer = Uint8ClampedArray | Uint8Array;

/** Load an image element from a data URL / URL. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

/** Resolve an image's natural width/height from a data URL / URL. */
export async function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  const img = await loadImage(src);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

/**
 * Nearest-neighbour mask → alpha compositing on plain typed arrays (no DOM):
 * writes each pixel's alpha from the nearest mask cell, RGB untouched. The mask
 * stride (RGBA vs single-channel) is inferred from its length, so `ImageData.data`
 * and flat masks map identically. Mutates and returns `pixels`.
 */
export function compositeMaskAlpha(
  pixels: PixelBuffer,
  imgW: number,
  imgH: number,
  mask: PixelBuffer,
  maskW: number,
  maskH: number
): PixelBuffer {
  const stride = mask.length === maskW * maskH * 4 ? 4 : 1;
  for (let y = 0; y < imgH; y++) {
    for (let x = 0; x < imgW; x++) {
      const mx = Math.floor((x / imgW) * maskW);
      const my = Math.floor((y / imgH) * maskH);
      pixels[(y * imgW + x) * 4 + 3] = mask[(my * maskW + mx) * stride];
    }
  }
  return pixels;
}

/**
 * Composite a segmentation mask onto an image as its alpha channel, producing a
 * transparent-background PNG data URL (foreground opaque, background transparent).
 * Handles `ImageData` and flat `Uint8Array` masks, resampling via
 * {@link compositeMaskAlpha} when the mask resolution differs from the image.
 */
export async function applyMaskToImage(
  imageDataUrl: string,
  mask: ImageData | Uint8Array
): Promise<string> {
  const img = await loadImage(imageDataUrl);
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create a 2D canvas context');
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, w, h);
  const isImageData = mask instanceof ImageData;
  compositeMaskAlpha(
    imageData.data,
    w,
    h,
    isImageData ? mask.data : mask,
    isImageData ? mask.width : w,
    isImageData ? mask.height : h
  );

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Convert an image-to-image result (`ImageData` or `Blob`) to a PNG data URL.
 */
export async function imageResultToDataUrl(image: ImageData | Blob): Promise<string> {
  if (image instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to convert image blob'));
      reader.readAsDataURL(image);
    });
  }
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create a 2D canvas context');
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

/** Download a PNG data URL to disk via the copy-owned {@link downloadBlob} helper. */
export async function downloadDataUrl(dataUrl: string, filename: string): Promise<void> {
  const blob = await (await fetch(dataUrl)).blob();
  downloadBlob(blob, filename);
}

// --- Inlined use-environment ---
/**
 * Copy-owned environment hooks for LocalMode UI components. These read only
 * browser APIs (`navigator`, `navigator.storage`, `navigator.onLine`,
 * WebAssembly/WebGL feature detection) — no AI, no `@localmode/*` dependency —
 * so the environment-aware components install and compile in any React app.
 *
 * Ported from `@localmode/react` (`useCapabilities`, `useStorageQuota`,
 * `useNetworkStatus`) and the `@localmode/core` detection helpers they call
 * (`detectCapabilities`, `getStorageQuota`). Behavior matches the originals,
 * plus a copy-owned extension: `features.camera` / `features.microphone`
 * media-input AVAILABILITY detection (secure context + `getUserMedia` present
 * + `enumerateDevices()` reports a device of that kind — never prompts).
 * Runtime permission state is deliberately NOT part of the detection; permission
 * prompts and denial handling belong to the consuming surface.
 */


const IS_SERVER = typeof window === 'undefined';

// ============================================================================
// Types (mirror @localmode/core DeviceCapabilities / StorageQuota)
// ============================================================================

/** Comprehensive device + browser capability information. */
export interface DeviceCapabilities {
  browser: { name: string; version: string; engine: string };
  device: { type: 'desktop' | 'mobile' | 'tablet' | 'unknown'; os: string; osVersion: string };
  hardware: { cores: number; memory?: number; gpu?: string };
  features: {
    webgpu: boolean;
    webnn: boolean;
    wasm: boolean;
    simd: boolean;
    threads: boolean;
    indexeddb: boolean;
    opfs: boolean;
    webworkers: boolean;
    sharedarraybuffer: boolean;
    crossOriginisolated: boolean;
    serviceworker: boolean;
    broadcastchannel: boolean;
    weblocks: boolean;
    chromeAI: boolean;
    chromeAISummarizer: boolean;
    chromeAITranslator: boolean;
    /** A video-input device is available (availability only — never prompts). */
    camera: boolean;
    /** An audio-input device is available (availability only — never prompts). */
    microphone: boolean;
  };
  storage: { quotaBytes: number; usedBytes: number; availableBytes: number; isPersisted: boolean };
}

/** Browser storage quota snapshot. */
export interface StorageQuota {
  usedBytes: number;
  quotaBytes: number;
  /** Percentage of quota used (0–100). */
  percentUsed: number;
  isPersisted: boolean;
  availableBytes: number;
}

// ============================================================================
// Feature detection (navigator / WebAssembly / WebGL — no AI)
// ============================================================================

async function isWebGPUSupported(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('gpu' in navigator)) return false;
  try {
    const adapter = await (navigator as { gpu?: { requestAdapter(): Promise<unknown> } }).gpu?.requestAdapter();
    return !!adapter;
  } catch {
    return false;
  }
}

function isWebNNSupported(): boolean {
  return typeof navigator !== 'undefined' && 'ml' in navigator;
}

function isWASMSupported(): boolean {
  try {
    if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
      const wasmModule = new WebAssembly.Module(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
      );
      if (wasmModule instanceof WebAssembly.Module) {
        return new WebAssembly.Instance(wasmModule) instanceof WebAssembly.Instance;
      }
    }
  } catch {
    /* unsupported */
  }
  return false;
}

function isWASMSIMDSupported(): boolean {
  try {
    new WebAssembly.Module(
      new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b,
        0x03, 0x02, 0x01, 0x00, 0x0a, 0x0a, 0x01, 0x08, 0x00, 0x41, 0x00, 0xfd, 0x0f, 0x00, 0x00,
        0x0b,
      ])
    );
    return true;
  } catch {
    return false;
  }
}

function isWASMThreadsSupported(): boolean {
  try {
    if (typeof SharedArrayBuffer === 'undefined' || typeof Atomics === 'undefined') return false;
    new WebAssembly.Module(
      new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x04, 0x01, 0x60, 0x00, 0x00, 0x03,
        0x02, 0x01, 0x00, 0x05, 0x04, 0x01, 0x03, 0x01, 0x01, 0x0a, 0x0b, 0x01, 0x09, 0x00, 0x41,
        0x00, 0xfe, 0x10, 0x02, 0x00, 0x1a, 0x0b,
      ])
    );
    return true;
  } catch {
    return false;
  }
}

function isIndexedDBSupported(): boolean {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
}

function isOPFSSupported(): boolean {
  // The Storage API predates OPFS; only getDirectory() gives access to it.
  return (
    typeof navigator !== 'undefined' &&
    typeof (navigator.storage as { getDirectory?: unknown } | undefined)?.getDirectory === 'function'
  );
}

function isWebWorkersSupported(): boolean {
  return typeof Worker !== 'undefined';
}

function isSharedArrayBufferSupported(): boolean {
  return typeof SharedArrayBuffer !== 'undefined';
}

function isCrossOriginIsolated(): boolean {
  return typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated;
}

function isServiceWorkerSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

function isBroadcastChannelSupported(): boolean {
  return typeof BroadcastChannel !== 'undefined';
}

function isWebLocksSupported(): boolean {
  return typeof navigator !== 'undefined' && 'locks' in navigator;
}

/**
 * Media-input AVAILABILITY detection (camera / microphone). True when the page
 * is a secure context, `navigator.mediaDevices.getUserMedia` exists, and
 * `enumerateDevices()` reports at least one device of the corresponding kind.
 * `enumerateDevices()` never prompts (pre-permission it returns kind-only,
 * label-less entries), so this stays a passive availability check — runtime
 * permission state is deliberately NOT detected here.
 */
async function detectMediaInputs(): Promise<{ camera: boolean; microphone: boolean }> {
  const unavailable = { camera: false, microphone: false };
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.mediaDevices?.getUserMedia !== 'function' ||
    typeof navigator.mediaDevices?.enumerateDevices !== 'function'
  ) {
    return unavailable;
  }
  if (typeof isSecureContext !== 'undefined' && !isSecureContext) return unavailable;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      camera: devices.some((d) => d.kind === 'videoinput'),
      microphone: devices.some((d) => d.kind === 'audioinput'),
    };
  } catch {
    return unavailable;
  }
}

function isChromeAISupported(): boolean {
  return typeof self !== 'undefined' && 'ai' in self;
}

function isSummarizerAPISupported(): boolean {
  return isChromeAISupported() && 'summarizer' in (self as unknown as { ai: object }).ai;
}

function isTranslatorAPISupported(): boolean {
  return isChromeAISupported() && 'translator' in (self as unknown as { ai: object }).ai;
}

// ============================================================================
// Device detection (user-agent / WebGL — no AI)
// ============================================================================

function getHardwareConcurrency(): number {
  if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
    return navigator.hardwareConcurrency;
  }
  return 1;
}

function detectBrowser(): { name: string; version: string; engine: string } {
  if (typeof navigator === 'undefined') return { name: 'unknown', version: '0', engine: 'unknown' };
  const ua = navigator.userAgent;
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    return { name: 'Chrome', version: ua.match(/Chrome\/(\d+(?:\.\d+)*)/)?.[1] ?? 'unknown', engine: 'Blink' };
  }
  if (ua.includes('Edg/')) {
    return { name: 'Edge', version: ua.match(/Edg\/(\d+(?:\.\d+)*)/)?.[1] ?? 'unknown', engine: 'Blink' };
  }
  if (ua.includes('Firefox/')) {
    return { name: 'Firefox', version: ua.match(/Firefox\/(\d+(?:\.\d+)*)/)?.[1] ?? 'unknown', engine: 'Gecko' };
  }
  if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    return { name: 'Safari', version: ua.match(/Version\/(\d+(?:\.\d+)*)/)?.[1] ?? 'unknown', engine: 'WebKit' };
  }
  return { name: 'unknown', version: '0', engine: 'unknown' };
}

function detectOS(): { name: string; version: string } {
  if (typeof navigator === 'undefined') return { name: 'unknown', version: '0' };
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) {
    const nt = ua.match(/Windows NT (\d+(?:\.\d+)*)/)?.[1] ?? '10';
    return { name: 'Windows', version: nt === '10.0' ? '10/11' : nt };
  }
  if (ua.includes('Mac OS X')) {
    return { name: 'macOS', version: ua.match(/Mac OS X (\d+[._]\d+(?:[._]\d+)?)/)?.[1]?.replace(/_/g, '.') ?? 'unknown' };
  }
  if (ua.includes('iPhone') || ua.includes('iPad')) {
    return { name: 'iOS', version: ua.match(/OS (\d+[._]\d+(?:[._]\d+)?)/)?.[1]?.replace(/_/g, '.') ?? 'unknown' };
  }
  if (ua.includes('Android')) {
    return { name: 'Android', version: ua.match(/Android (\d+(?:\.\d+)*)/)?.[1] ?? 'unknown' };
  }
  if (ua.includes('Linux')) return { name: 'Linux', version: 'unknown' };
  return { name: 'unknown', version: '0' };
}

function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (ua.includes('iPad') || (ua.includes('Android') && !ua.includes('Mobile'))) return 'tablet';
  if (
    ua.includes('iPhone') || ua.includes('iPod') ||
    (ua.includes('Android') && ua.includes('Mobile')) ||
    ua.includes('webOS') || ua.includes('BlackBerry') || ua.includes('IEMobile') || ua.includes('Opera Mini')
  ) {
    return 'mobile';
  }
  if (navigator.maxTouchPoints > 0 && typeof screen !== 'undefined' && screen.width < 1024) return 'tablet';
  return 'desktop';
}

function detectGPU(): { vendor: string; renderer: string } | null {
  if (typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return null;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return null;
    return {
      vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) ?? 'unknown',
      renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? 'unknown',
    };
  } catch {
    return null;
  }
}

async function getStorageEstimate(): Promise<{ quota: number; usage: number; persisted: boolean } | null> {
  if (typeof navigator === 'undefined' || !navigator.storage) return null;
  try {
    const [estimate, persisted] = await Promise.all([
      navigator.storage.estimate(),
      navigator.storage.persisted(),
    ]);
    return { quota: estimate.quota ?? 0, usage: estimate.usage ?? 0, persisted };
  } catch {
    return null;
  }
}

// ============================================================================
// Detection entry points
// ============================================================================

/** Detect all device + browser capabilities. */
export async function detectCapabilities(): Promise<DeviceCapabilities> {
  const storage = await getStorageEstimate();
  const webgpu = await isWebGPUSupported();
  const media = await detectMediaInputs();
  const gpu = detectGPU();
  const os = detectOS();
  return {
    browser: detectBrowser(),
    device: { type: detectDeviceType(), os: os.name, osVersion: os.version },
    hardware: {
      cores: getHardwareConcurrency(),
      memory: typeof navigator !== 'undefined' ? (navigator as { deviceMemory?: number }).deviceMemory : undefined,
      gpu: gpu?.renderer,
    },
    features: {
      webgpu,
      webnn: isWebNNSupported(),
      wasm: isWASMSupported(),
      simd: isWASMSIMDSupported(),
      threads: isWASMThreadsSupported(),
      indexeddb: isIndexedDBSupported(),
      opfs: isOPFSSupported(),
      webworkers: isWebWorkersSupported(),
      sharedarraybuffer: isSharedArrayBufferSupported(),
      crossOriginisolated: isCrossOriginIsolated(),
      serviceworker: isServiceWorkerSupported(),
      broadcastchannel: isBroadcastChannelSupported(),
      weblocks: isWebLocksSupported(),
      chromeAI: isChromeAISupported(),
      chromeAISummarizer: isSummarizerAPISupported(),
      chromeAITranslator: isTranslatorAPISupported(),
      camera: media.camera,
      microphone: media.microphone,
    },
    storage: {
      quotaBytes: storage?.quota ?? 0,
      usedBytes: storage?.usage ?? 0,
      availableBytes: (storage?.quota ?? 0) - (storage?.usage ?? 0),
      isPersisted: storage?.persisted ?? false,
    },
  };
}

/** Query the browser storage quota; returns null when unavailable. */
export async function getStorageQuota(): Promise<StorageQuota | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null;
  try {
    const estimate = await navigator.storage.estimate();
    const persisted = (await navigator.storage.persisted?.()) ?? false;
    const usedBytes = estimate.usage ?? 0;
    const quotaBytes = estimate.quota ?? 0;
    return {
      usedBytes,
      quotaBytes,
      percentUsed: quotaBytes > 0 ? (usedBytes / quotaBytes) * 100 : 0,
      isPersisted: persisted,
      availableBytes: Math.max(0, quotaBytes - usedBytes),
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Hooks
// ============================================================================

/** Detect device capabilities once on mount; `refresh()` re-detects. */
export function useCapabilities() {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const detect = useCallback(async () => {
    if (IS_SERVER) return;
    setIsDetecting(true);
    setError(null);
    try {
      const caps = await detectCapabilities();
      if (mountedRef.current) setCapabilities(caps);
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (mountedRef.current) setIsDetecting(false);
    }
  }, []);

  useEffect(() => {
    void detect();
  }, [detect]);

  if (IS_SERVER) {
    return { capabilities: null, isDetecting: false, error: null, refresh: async () => {} };
  }
  return { capabilities, isDetecting, error, refresh: detect };
}

/** Monitor browser storage quota; queries on mount, exposes `refresh()`. */
export function useStorageQuota() {
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchQuota = useCallback(async () => {
    if (IS_SERVER) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getStorageQuota();
      if (mountedRef.current && result) setQuota(result);
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchQuota();
  }, [fetchQuota]);

  if (IS_SERVER) {
    return { quota: null, isLoading: false, error: null, refresh: async () => {} };
  }
  return { quota, isLoading, error, refresh: fetchQuota };
}

function getOnlineStatus() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

/** Reactively track online/offline status (tear-free via useSyncExternalStore). */
export function useNetworkStatus() {
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineStatus, () => true);
  return { isOnline, isOffline: !isOnline };
}




/** Props for {@link StorageMeter}. */
export interface StorageMeterProps {
  /**
   * Fraction (0–1) at which the meter enters its warning state.
   * @default 0.8
   */
  warnThreshold?: number;
  /**
   * Override the live quota source (used / total bytes). When omitted the
   * component reads `useStorageQuota()`.
   */
  quota?: { usedBytes: number; quotaBytes: number };
  /** Additional class names merged onto the root element. */
  className?: string;
}

/**
 * Shows origin / IndexedDB storage usage against quota as a meter, with a
 * warning state past a configurable threshold. Storage estimates are
 * approximate and blocked in some browsers (e.g. Safari private mode), so the
 * component degrades to a graceful "unavailable" state rather than erroring.
 *
 * Bind it to `useStorageQuota` (the default) or pass an explicit `quota`.
 *
 * @example
 * ```tsx
 * <StorageMeter warnThreshold={0.9} />
 * ```
 */
export function StorageMeter({
  warnThreshold = 0.8,
  quota,
  className,
}: StorageMeterProps) {
  const live = useStorageQuota();
  const source = quota ?? live.quota;
  const loading = quota ? false : live.isLoading;

  if (!source || source.quotaBytes <= 0) {
    return (
      <div
        role="status"
        className={cn(
          'flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground',
          className,
        )}
      >
        <HardDrive className="size-4" aria-hidden="true" />
        {loading ? 'Estimating storage…' : 'Storage estimate unavailable'}
      </div>
    );
  }

  const fraction = Math.max(0, Math.min(1, source.usedBytes / source.quotaBytes));
  const percent = Math.round(fraction * 100);
  const warning = fraction >= warnThreshold;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex w-full max-w-xs flex-col gap-2 rounded-lg border border-border bg-card p-3 text-card-foreground',
        className,
      )}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium">
          <HardDrive className="size-3.5" aria-hidden="true" />
          Storage
        </span>
        <span
          className={cn(
            'tabular-nums',
            warning ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
          )}
        >
          {formatBytes(source.usedBytes)} / {formatBytes(source.quotaBytes)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            warning ? 'bg-amber-500' : 'bg-primary',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {warning && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Storage is {percent}% full - consider clearing cached models.
        </p>
      )}
    </div>
  );
}

export default StorageMeter;
