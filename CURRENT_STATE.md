# CURRENT_STATE.md — project dashboard (update after every delivery or feedback round)
_Last updated: 2026-11-27_

## Latest delivered films (repo ground truth)
| Film | Deliverable | Status |
|---|---|---|
| **Srimandir 3D** | `Srimandir_3D_v3.mp4` + `Srimandir_3D_v3_no_text.mp4` | most recent delivery; v4 realism work in progress (see below) |
| Plot · Right of Way | `Plot_RightOfWay_v2.mp4` | delivered 2026-11-25; open: channel name for end card, patta owner name to confirm |
| Manabasa Gurubara | `Manabasa_Gurubara_final_v7.mp4` | done unless owner sends more notes |
| Aa Ka Ma Bai / Danga | `AaKaMaBai_BoitaBandana_final_v2.mp4` | done |
| Kartika Wind | `KartikaWind_BaliJatra_v3.mp4` | done (3rd most viewed) |
| Bali Jatra VO | `BaliJatra_VO_final_v3.mp4` | done |
| Bali Jatra rap | `bali-jatra-rap_share.mp4` | done (owner adds captions) |

## Srimandir v4 — work in progress
**Goal:** realism improvements only; no new temple geometry.

**Pending fix (owner approved, not yet applied):**
- `flag_small` z: change `z_pole + 6.75` → `z_pole + 8.1` in `build.py` so both flags cluster near the top of the pole with a clear gap above the Nilachakra wheel. `flag_big` stays at `z_pole + 9.7`.
- File: `/home/user/srimandir/build.py` AND `projects/srimandir/build.py` (both must be updated)
- After edit: rebuild `srimandir.blend`, re-render frame 403, send still for owner approval.

**Planned realism improvements (not yet started):**
- Rain-streak weathering in stone material (`mat_stone()` in `geo.py`)
- Brighter sky: increase `Background Strength` from 0.08 → ~0.12 in `world.py`
- Sun energy cap: raise peak from ~4.8 to ~6.0
- Singhadwara lion sculptures at the main gate
- Better flag visibility at distance

**Test stills sent (approved frame quality):**
- `still_test/f_00403.png` — full vimana from sea (t=16.8 s)
- `still_test/f_02025.png` — final aerial (t=84.4 s)

## context-mode
- Cloned to `/home/user/context-mode` (ephemeral — will be lost on container restart)
- Not yet wired into `.claude/settings.json` as an MCP server
- Action needed: add it to MCP config if owner wants it persistent

## Srimandir RESUME.md known error
`projects/srimandir/RESUME.md` says "python seg.py # writes scene.blend" — this is WRONG.
- `seg.py` = VO phrase segmenter (audio only)
- `build.py` = actual scene assembler → `srimandir.blend`
- Needs correction in RESUME.md
