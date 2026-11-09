# Gitfiddle

A static web app. Serve the folder over http (for example `python3 -m http.server 8000`). YouTube embeds won't play from `file://`.

- `index.html`: home page with the setlist. You can sort it (learning order, lesson tier, difficulty easy→hard or hard→easy), filter it by technique (multi-select), and switch between a list and a tier-list view. These settings are saved in localStorage as `gitfiddle.home.v1`.

Per-song data fields for the home page, in `assets/songs.js`:
- `lessonStats`: raw counts of YouTube lessons (`songLessons`, `topViews`, `bigTeacherLessons`, `withChapters`, `withCaptions`, `slowBreakdown`). The S/A/B/C **lesson tier** is computed from these by `lessonTier()` in app.js. The score is out of 10: S ≥ 9, A ≥ 7, B ≥ 4, otherwise C.
- `difficulty` (1–5): shown as Beginner / Easy / Intermediate / Upper-intermediate / Advanced, with `diffReason` as the one-line reason.
- `techTags`: the fixed technique vocabulary (`TECHNIQUES`) used for filtering. `tags` holds the free-form detail chips.
- `stage` / `stageLabel`: the learning stage, e.g. "Stage 1 · First steps". This used to be called `tier`.
- `songs/<slug>.html`: one page per song (thin shell, everything comes from the shared assets)
- `assets/app.css`, `assets/app.js`: shared UI, synth play-along, practice tools, hard-parts looper
- `assets/songs.js`: **all song data**. To add a song: add an entry to `SONGS` (plus any new lesson videos to `VIDEOS`), then copy `songs/_template.html` to `songs/<slug>.html` and set `data-song`. `songs/song.html?id=<id>` also works with no new file.
- `over-the-hills.html`: redirect kept so the old link still works.

localStorage keys: `gitfiddle.drillHistory.v1` (drill log, same as v1), `gitfiddle.oth.v1.*` (Over the Hills hard-part tweaks, same as the prototype), `gitfiddle.hp.<song>.v1.*` (other songs).
