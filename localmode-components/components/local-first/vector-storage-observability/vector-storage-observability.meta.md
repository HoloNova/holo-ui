# Vector Storage Observability

### Description
VectorDB observability complementing StorageMeter (quota): a compression-stats badge (SQ8 ratio + before/after size, e.g. "4.0x — 15KB→3.7KB"), a three-tier storage estimate (Raw Float32 / SQ8 4x / PQ 8–32x with the active tier highlighted), and a GPU-aware search-latency badge (accented when WebGPU-accelerated). Values derive from getCompressionStats() (a core function) + search timing, passed in as props; the nearest shipped hook is useStorageQuota.

### Tokens
- scale: `standard`
- placement: `embedded`
- interaction: `output`
- lifecycle: `persistent`
- motion: `none`
- category: `content`
- runtime: `react`

### When to use
Use `vector-storage-observability` when vectordb observability complementing storagemeter (quota): a compression-stats badge (sq8 ratio + before/after size, e.g. "4.0x — 15kb→3.7kb"), a three-tier storage estimate (raw float32 / sq8 4x / pq 8–32x with the active tier highlighted), and a gpu-aware search-latency badge (accented when webgpu-accelerated). values derive from getcompressionstats() (a core function) + search timing, passed in as props; the nearest shipped hook is usestoragequota.

### When not to use
Do not use when heavy proprietary server-side orchestrators or non-React plain HTML environments are required.
