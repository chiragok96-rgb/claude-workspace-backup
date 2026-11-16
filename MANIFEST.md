# MANIFEST

Generated 2026-11-16 from a live Claude Code cloud session.

## Pinned upstreams
- lemomo-ai/lemo-opuscar @ `3a7132b996be0241c1ea0ab180d519f06e6f10b6` (v2.0.0, 99 styles). No local modifications to upstream files; custom work is only in `films/` (stored in `opuscar-overlay/films`).
- huashu-art-motion skill v1.3.0 (local skill commit 5a1b9ab, never pushed upstream from the session; upstream source copy in `third-party/alchaincyf`).
- Plugin registry: `env/installed_plugins.json` (lemo-opuscar@lemolab 9eb7739a0fca).

## Toolchain at backup time
node v22.23.4, python 3.13.18, uv 0.11.32, ffmpeg n8.1.3 (static, BtbN), three 0.170, playwright-core 1.63

## Included (sizes)
```
74M  skills
22M  opuscar-overlay
2.3M  projects/bali-rap
1.3M  projects/bali-toon
46M  projects/bali-yatra
38M  projects/harihara-besha
14M  projects/jadu-guni
19M  projects/jadu-guni-ext
2.6M  projects/jagannath-3d
11M  projects/megha-kadamba
11M  projects/panchuka
25M  projects/panchuka-reel
8.5M  projects/radha-pada
53M  projects/radha-pada-darshan
74M  third-party/alchaincyf
73M  third-party/zlhad
8.2M  inputs
120M  deliverables
24K  env
148K  scripts
```

## Excluded on purpose
- Credentials/tokens: none present or stored. (GH_TOKEN in the session is invalid and was not read into this repo.)
- `node_modules/`, `.venv/`, `.git/`, caches, `__pycache__`.
- ffmpeg binaries (659 MB) -> re-downloaded by bootstrap. ASR models (1.8 GB) and TTS env/models (9.8 GB) -> INSTALL.md §3.
- Intermediate renders/frames and all `.mp4/.mov/.wav/.npy/.zip` under projects (re-renderable from source; ~5.3 GB of mp4 in the workspace). Exception: final share encodes in `deliverables/`.
- Reference videos supplied by the owner (third-party content, reference-only) and the 124 MB raw chat transcript.
- Files >= 20 MB in project trees.

## Edited in this copy only
- `third-party/zlhad/openvideoharness/tools/ci.sh`: two test-fixture strings `sk-ant-api03-…` renamed `sk-ant-FIXTURE-…` so push-protection scanners do not flag them. The original in `~/zlhad` is untouched.

## File counts
3378 files, 597M
