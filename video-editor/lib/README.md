# Outside code in this folder

Ready-made files from a free project, saved here unchanged. The only change: `mediabunny.min.cjs` was renamed `mediabunny.min.js`, so the website sends it as JavaScript. The page loads them with plain `<script>` tags, with no npm (the website's rule, kept on November 2, 2026: see the root `DECISIONS.md`).

- `mediabunny.min.js`: Mediabunny 1.65.0 (published October 30, 2026), the library that reads and writes video files. From the npm package `mediabunny@1.65.0`, file `dist/bundles/mediabunny.min.cjs`. Source: https://github.com/Vanilagy/mediabunny. License: Mozilla Public License 2.0 (`LICENSE` in this folder).
- `mediabunny-aac-encoder.min.js`: Mediabunny's AAC add-on, 1.65.0, which makes AAC sound (the usual sound for MP4 videos) when Chrome can't. The page loads it only then. From the npm package `@mediabunny/aac-encoder@1.65.0`, file `dist/bundles/mediabunny-aac-encoder.min.js`. Source: https://github.com/Vanilagy/mediabunny/tree/main/packages/aac-encoder. License: Mozilla Public License 2.0 (`LICENSE`). It contains FFmpeg's AAC encoder, unmodified, under the GNU Lesser General Public License 2.1 or later (`licenses/ffmpeg/`). FFmpeg's source for that build: https://github.com/FFmpeg/FFmpeg/commit/60a2818f76dcd1fee3155b1791304af104a0fc1b, and the steps to build it are in the add-on's README (https://github.com/Vanilagy/mediabunny/blob/main/packages/aac-encoder/README.md).

Checked by Claude on November 2, 2026: both downloads matched the npm registry's integrity hashes. SHA-256 of the files here:
- `mediabunny.min.js`: e3277201c2c7c1351fd74402c93962cad3ba1c49f50091733465430c97903935
- `mediabunny-aac-encoder.min.js`: 0efbcb6d9f945b669b78fd163d80097ed3dc7a7e6af9ed6d46a8907498713e0c

To update, only on purpose and after reading the release notes (https://github.com/Vanilagy/mediabunny/releases): download both packages at the same version, copy the same two files (renaming the first again), update the versions and hashes here, raise the `?v=` numbers on the pages that load them, and run the saved checks.
