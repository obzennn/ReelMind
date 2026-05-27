# Product Requirements Document: YouTube Clipper

## 1. Product Overview
**Name**: YouTube Clipper (AI Video Analyzer)
**Description**: An AI-powered web application (similar to OpusClip) that allows users to paste a YouTube link, automatically identify potential viral clips using AI, and view/download the suggested segments.
**Target Audience**: Content creators, social media managers, and general users looking to efficiently repurpose long-form YouTube content into engaging, short-form viral clips.

## 2. Goals & Success Metrics
**Goals**:
- Provide a fast, seamless user experience for clipping videos.
- Eliminate the need for complex local video editing software.
- Ensure high reliability in downloading the correct video segment.

**Success Metrics**:
- High success rate for clip generation.
- Low average time to generate and download a clip.
- Low error rate for invalid links or failed processing.

## 3. Core Features & Requirements (MVP)

### 3.1. Video URL Input & AI Analysis (Phase 1)
- **Requirement**: A prominent text input field for the YouTube URL.
- **Behavior**: 
  - Validates the input to ensure it is a recognized YouTube URL format.
  - Displays clear error messaging if the URL is invalid or unsupported.
  - Upon submission, triggers the **Analysis Phase**: the backend extracts subtitles and uses AI to identify potential viral clips.
  - **AI Prompting Rule**: The LLM must be explicitly prompted to ONLY output metadata for clips scoring 80 or above on the virality score. If no clips meet this threshold, it must return an empty array `[]`, and the frontend must display an elegant "Empty State".
  - Displays a visual loading state indicating that AI is analyzing the video.
  - *Note for MVP*: The AI analysis is currently **"Simulated/Mocked"** to return hardcoded distinct clip segments. This validates the UX without requiring an active OpenAI/Gemini API key.

### 3.2. Suggested Clips Dashboard (Phase 2)
- **Requirement**: A UI dashboard displaying the suggested viral clips.
- **Behavior**:
  - Displays the AI-suggested clips in distinct cards.
  - Each clip card must display the following data:
    - `title`
    - `description`
    - `tags`
    - `startTime`
    - `endTime`
    - `viralityScore` (e.g., 0-100 score to represent predicted virality)
  - Provides a basic preview or timeline representation of the clip.

### 3.3. Clip Processing & Download
- **Requirement**: A "Download Clip" or "Generate" action button for each suggested clip.
- **Behavior**:
  - Triggers the backend or client-side process to extract the specific segment defined by `startTime` and `endTime`.
  - Displays a visual loading state (spinner or progress bar) while the clip is being generated.
  - Upon completion, automatically initiates the download of the resulting video file (e.g., `.mp4`) to the user's device.
  - On failure, the application MUST capture the actual stderr output from failed binary executions and surface it directly to the user in a scrollable UI, rather than a generic error message.

### 3.4. Output Configuration (Auto-Subtitles & Aspect Ratio)
- **Requirement**: Options allowing users to configure the output format before downloading a clip.
- **Behavior**:
  - Optional toggle to include YouTube's auto-generated subtitles (soft-embedded into the video file).
  - Selection mechanism for aspect ratio ("Original", "9:16 (Vertical)", "4:3 (Classic)", "1:1 (Square)").
  - If an aspect ratio other than "Original" is chosen, the video will be center-cropped to match the selected dimensions.
  - **Graceful Degradation**: If the subtitle download fails during processing (e.g., due to HTTP 429 Too Many Requests), the application MUST still successfully deliver the video clip without subtitles. The backend must return a header or status indicating partial success, which the UI must interpret and display as a warning to the user.

## 4. User Flow
1. **Landing**: User visits the web application interface.
2. **Analysis Phase**: User pastes a YouTube URL into the main input field and submits. The system runs the (mocked) AI analysis on the video/subtitles to identify potential viral segments (filtering for virality score > 80), displaying a loading state.
3. **Dashboard Phase**: The UI transitions to the Suggested Clips Dashboard, displaying the suggested clip cards containing `title`, `description`, `tags`, `startTime`, `endTime`, and `viralityScore` (or an elegant "Empty State" if no clips met the threshold).
4. **Configure**: User reviews the suggestions, selects their preferred Aspect Ratio, and optionally toggles the "Include Auto-Subtitles" option for a specific clip.
5. **Action**: User clicks the "Download Clip" button on their chosen clip.
6. **Processing & Delivery**: System displays a loading indicator while processing the video segment, and then the cropped video file is downloaded to the user's local machine.

## 5. Non-Functional Requirements
- **Performance**: The UI should be lightweight and load quickly. The clipping operation should be optimized for speed.
- **Responsiveness**: The interface must be fully functional and visually appealing on both desktop and mobile browsers.
- **Error Handling**: 
  - **Graceful Failure**: The application MUST capture the actual stderr output from failed binary executions and surface it directly to the user in a scrollable UI, rather than a generic error message.
  - **Graceful Degradation**: For non-critical features like subtitles: if they fail to download, deliver the video anyway and issue a warning in the UI based on a partial success status/header from the backend.
  - **Backend Process Monitoring**: All backend tools (like ffmpeg/yt-dlp) must have their standard error streams monitored and explicit crashes should not be silently swallowed by features like `ignoreErrors`.
  - **Accurate Metadata**: Output videos must have strictly accurate duration metadata that matches the requested clip length.
- **Strict Compilation Checks**:
  - **Cache-Aware Debugging (Turbopack / Next.js)**: If the dev server reports a syntax or compilation error that **contradicts** the actual contents of the source file, developers **MUST** (1) delete the `.next` cache folder entirely, and (2) restart the dev server before investigating further. Stale Turbopack caches are a known source of phantom errors and must be ruled out before any code changes are made in response to such errors.
  - **Build-Gate Requirement**: All code changes — whether bug fixes, new features, or refactors — **MUST** pass a clean `npm run build` (production build) before they are considered complete. A successful dev-server compilation alone is **not sufficient**; the production build is the single source of truth for correctness.

## 6. Future Enhancements (Out of Scope for MVP)
- Format conversion (e.g., export as GIF or MP3).
- Advanced video quality selection (720p, 1080p, etc.).
- Interactive video timeline/slider for selecting start and end times visually.
- Batch processing or queuing for multiple clips.
