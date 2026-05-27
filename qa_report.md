# QA Report: YouTube Clipper

## 1. Overview
The current implementation establishes a foundational MVP, successfully rendering a Next.js frontend with Tailwind CSS and a functional Next.js API route that interfaces with `yt-dlp`. However, the codebase falls short of several constraints outlined in the `prd.md` and `design_spec.md`, particularly regarding input validation, robust edge-case handling, and styling parity.

## 2. Findings & Edge Case Analysis

### 2.1. URL Validation & Error Handling
- **Missing URL Regex/Parsing (Frontend & Backend):** 
  - *PRD Requirement:* "Validates the input to ensure it is a recognized YouTube URL format."
  - *Current State:* The frontend (`page.tsx`) only verifies that the input is not empty. The backend (`route.ts`) blindly passes the URL to `yt-dlp`. 
  - *Edge Case Risk:* Passing an arbitrary string or non-YouTube URL causes a generic 500 server error, not a user-friendly error.

### 2.2. Timestamp Validation
- **Missing Logic for Timestamps (Frontend & Backend):**
  - *PRD Requirement:* "Validates that the Start Time is less than the End Time" and does not exceed total duration.
  - *Current State:* Neither the frontend nor the backend validates the timestamps. They are injected straight into `yt-dlp`'s `--download-sections` argument.
  - *Edge Case Risk:* Reversing start/end times or providing malformed timestamps leads to silent `yt-dlp` failures or unpredictable clipping.

### 2.3. Video Length & Memory Allocation
- **Out-Of-Memory (OOM) Vulnerability:**
  - *Current State:* The API route utilizes `fs.readFileSync(outputPath)` to load the complete generated `.mp4` into Node.js memory before returning it as a response buffer.
  - *Edge Case Risk:* If a user requests a 1-hour clip, reading a potentially massive file entirely into memory will crash the Vercel/Next.js environment. 

### 2.4. Binary Management & Cross-Platform Issues
- **Hardcoded Executables:**
  - *Current State:* The backend manually fetches `yt-dlp.exe` and stores it locally if absent. 
  - *Edge Case Risk:* This strictly limits deployment to Windows environments. Vercel and standard Docker containers use Linux. 
- **FFmpeg Integration Flaws:**
  - *Current State:* `ffmpeg-static` is dynamically required inside a `try/catch`. If missing, the script logs a warning but proceeds. `yt-dlp` will subsequently fail because it relies on `ffmpeg` to stitch/cut segments.

### 2.5. Design Spec Adherence
- **Typography & Metadata:**
  - *Design Spec Requirement:* Use `Outfit`/`Plus Jakarta Sans` and `JetBrains Mono`.
  - *Current State:* `layout.tsx` still uses the default `Geist` fonts provided by `create-next-app`, and the page metadata reads "Create Next App".
- **Glassmorphism:**
  - *Current State:* Implemented decently via `globals.css`, but the layout lacks the "video preview" (optional but recommended) and the smooth folding animations.

### 2.6. Virality Score Filtering & Empty States
- **API Returning 0 Clips:**
  - *Context:* The API will filter clips by virality score > 80.
  - *Edge Case Risk:* This means the API might legitimately return 0 clips if no segments meet the threshold.
  - *Required Handling:* If `res.json()` returns `clips: []`, the frontend MUST NOT treat this as a backend crash or error. It is a valid response. The UI should display a user-friendly "Empty State" message (e.g., "No highly viral clips found for this video") rather than throwing an exception or hanging indefinitely.

## 3. Automated Testing
An automated integration test script (`qa_test.mjs`) has been written to the project root. It verifies API behavior across normal and edge cases (missing fields, invalid URLs, malformed timestamps, and empty clip responses).

**To run the test:**
1. Start the dev server: `npm run dev`
2. In a new terminal, run: `node qa_test.mjs`

## 4. Recommendations for the Engineer
1. **Sanitize & Validate Input:** Implement robust Regex validation for YouTube URLs on both client and server. Parse timestamps to ensure `start < end`.
2. **Stream the Response:** Refactor the API route to use `fs.createReadStream()` wrapped in a `ReadableStream` instead of `readFileSync` to prevent memory limits from being exceeded.
3. **Use yt-dlp-exec properly:** Since `yt-dlp-exec` is already in `package.json`, use it instead of manually downloading `.exe` binaries. This ensures cross-platform support.
4. **Fix Typography:** Update `layout.tsx` to import the correct Google Fonts and remove the boilerplate Next.js metadata.
5. **Handle Errors Gracefully:** Map `yt-dlp` exit codes and validation failures to appropriate HTTP status codes (400) and return user-friendly strings.
6. **Implement Empty State UI:** When `clips: []` is received from the `/api/analyze` endpoint, render an informative empty state instead of failing.
