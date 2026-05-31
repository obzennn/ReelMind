import fs from "fs";
import path from "path";
import { execa } from "execa";
import { generateAssFile } from "./whisper";
import { getYtDlp, getFfmpegPath } from "./ffmpegUtils";

export async function processBrollVideo({
  url, brollUrl, startSeconds, endSeconds, duration, includeSubtitles, captionsEnabled, tempDir, sessionId, openai
}: any) {
  const ytdlp = getYtDlp();
  const ffmpegPath = getFfmpegPath();
  const mainVideoPath = path.join(tempDir, `main_${sessionId}.mp4`);
  const brollVideoPath = path.join(tempDir, `broll_${sessionId}.mp4`);
  const finalOutputPath = path.join(tempDir, `final_${sessionId}.mp4`);

  const ytDlpOptionsMain: any = {
    format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4",
    downloadSections: `*${startSeconds}-${endSeconds}`,
    forceKeyframesAtCuts: true,
    ffmpegLocation: ffmpegPath,
    output: mainVideoPath,
    noPlaylist: true,
    ignoreErrors: true,
  };

  if (includeSubtitles) {
    ytDlpOptionsMain.writeAutoSubs = true;
    ytDlpOptionsMain.subLangs = 'en.*,id.*';
    ytDlpOptionsMain.embedSubs = true;
  }

  const ytDlpOptionsBroll: any = {
    format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4",
    downloadSections: `*0-${duration}`,
    forceKeyframesAtCuts: true,
    ffmpegLocation: ffmpegPath,
    output: brollVideoPath,
    noPlaylist: true,
    ignoreErrors: true,
  };

  try {
    await Promise.all([
      ytdlp.exec(url, ytDlpOptionsMain),
      ytdlp.exec(brollUrl, ytDlpOptionsBroll)
    ]);
  } catch (e: any) {
    console.error("yt-dlp error during split-screen:", e);
  }

  if (!fs.existsSync(mainVideoPath) || !fs.existsSync(brollVideoPath)) {
    if (fs.existsSync(mainVideoPath)) fs.unlinkSync(mainVideoPath);
    if (fs.existsSync(brollVideoPath)) fs.unlinkSync(brollVideoPath);
    throw new Error("Failed to download main or B-Roll video.");
  }

  let filterComplex = "[0:v]scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960[top];[1:v]scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960[bottom];[top][bottom]vstack=inputs=2";
  let audioPath = path.join(tempDir, `audio_${sessionId}.mp3`);
  let assPath = path.join(tempDir, `subs_${sessionId}.ass`);

  if (captionsEnabled) {
    try {
      await execa(ffmpegPath, ["-y", "-i", mainVideoPath, "-q:a", "0", "-map", "a", audioPath]);
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: 'whisper-1',
        timestamp_granularities: ['word'],
        response_format: 'verbose_json'
      });
      if (transcription.words) {
        generateAssFile(transcription.words, assPath);
        const escapedAssPath = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
        filterComplex += `,ass='${escapedAssPath}'`;
      }
    } catch (err) {
      console.error("Caption generation error:", err);
    }
  }

  filterComplex += "[v]";

  const bgmPath = path.join(process.cwd(), "public", "bgm.mp3");
  const hasBgm = fs.existsSync(bgmPath);

  try {
    const args = ["-y", "-i", mainVideoPath, "-i", brollVideoPath];
    if (hasBgm) {
      args.push("-stream_loop", "-1", "-i", bgmPath);
      filterComplex += `;[0:a]volume=1.0[a1];[2:a]volume=0.1[a2];[a1][a2]amix=inputs=2:duration=first:dropout_transition=2[aout]`;
    }

    args.push("-filter_complex", filterComplex);
    args.push("-map", "[v]");
    
    if (hasBgm) args.push("-map", "[aout]");
    else args.push("-map", "0:a?");
    
    args.push(finalOutputPath);
    await execa(ffmpegPath, args);
  } catch (e: any) {
    console.error("ffmpeg merge error:", e);
    throw new Error("Failed to merge B-Roll.");
  } finally {
    if (fs.existsSync(mainVideoPath)) fs.unlinkSync(mainVideoPath);
    if (fs.existsSync(brollVideoPath)) fs.unlinkSync(brollVideoPath);
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (fs.existsSync(assPath)) fs.unlinkSync(assPath);
  }
  
  return finalOutputPath;
}

export async function processStandardVideo({
  url, startSeconds, endSeconds, includeSubtitles, captionsEnabled, aspectRatio, tempDir, sessionId, openai
}: any) {
  const ytdlp = getYtDlp();
  const ffmpegPath = getFfmpegPath();
  const needsPostProcess = captionsEnabled || aspectRatio !== "original";
  let outputPath = path.join(tempDir, `clip_${sessionId}.mp4`);
  let subtitleWarning = false;

  if (needsPostProcess) {
    const rawVideoPath = path.join(tempDir, `raw_${sessionId}.mp4`);
    const ytDlpOptions: any = {
      format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4",
      downloadSections: `*${startSeconds}-${endSeconds}`,
      forceKeyframesAtCuts: true,
      ffmpegLocation: ffmpegPath,
      output: rawVideoPath,
      noPlaylist: true,
      ignoreErrors: true,
    };

    if (includeSubtitles) {
      ytDlpOptions.writeAutoSubs = true;
      ytDlpOptions.subLangs = 'en.*,id.*';
      ytDlpOptions.embedSubs = true;
    }

    try {
      await ytdlp.exec(url, ytDlpOptions);
    } catch (e: any) {
      console.error("yt-dlp error:", e);
    }

    if (!fs.existsSync(rawVideoPath)) {
      throw new Error("Failed to download clip.");
    }

    let vfFilters = [];
    if (aspectRatio === "9:16") vfFilters.push('crop=trunc(min(iw\\,ih*9/16)/2)*2:trunc(min(ih\\,iw*16/9)/2)*2');
    else if (aspectRatio === "4:3") vfFilters.push('crop=trunc(min(iw\\,ih*4/3)/2)*2:trunc(min(ih\\,iw*3/4)/2)*2');
    else if (aspectRatio === "1:1") vfFilters.push('crop=trunc(min(iw\\,ih)/2)*2:trunc(min(ih\\,iw)/2)*2');

    let audioPath = path.join(tempDir, `audio_${sessionId}.mp3`);
    let assPath = path.join(tempDir, `subs_${sessionId}.ass`);

    if (captionsEnabled) {
      try {
        await execa(ffmpegPath, ["-y", "-i", rawVideoPath, "-q:a", "0", "-map", "a", audioPath]);
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(audioPath),
          model: 'whisper-1',
          timestamp_granularities: ['word'],
          response_format: 'verbose_json'
        });
        if (transcription.words) {
          generateAssFile(transcription.words, assPath);
          const escapedAssPath = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
          vfFilters.push(`ass='${escapedAssPath}'`);
        }
      } catch (err) {
        console.error("Caption generation error:", err);
      }
    }

    try {
      const args = ["-y", "-i", rawVideoPath];
      if (vfFilters.length > 0) args.push("-vf", vfFilters.join(","));
      args.push("-c:v", "libx264", "-c:a", "copy", outputPath);
      
      await execa(ffmpegPath, args);
    } catch (e: any) {
      console.error("ffmpeg post-process error:", e);
      throw new Error("Failed to process video.");
    } finally {
      if (fs.existsSync(rawVideoPath)) fs.unlinkSync(rawVideoPath);
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      if (fs.existsSync(assPath)) fs.unlinkSync(assPath);
    }
  } else {
    const ytDlpOptions: any = {
      format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4",
      downloadSections: `*${startSeconds}-${endSeconds}`,
      forceKeyframesAtCuts: true,
      ffmpegLocation: ffmpegPath,
      output: outputPath,
      noPlaylist: true,
      ignoreErrors: true,
    };

    if (includeSubtitles) {
      ytDlpOptions.writeAutoSubs = true;
      ytDlpOptions.subLangs = 'en.*,id.*';
      ytDlpOptions.embedSubs = true;
    }

    let stderrStr = "";
    try {
      const { stderr } = await ytdlp.exec(url, ytDlpOptions);
      stderrStr = stderr || "";
    } catch (e: any) {
      console.error("yt-dlp error:", e);
      stderrStr = (e && e.stderr) ? String(e.stderr) : "";
      const isSubtitleError = stderrStr.includes("Unable to download video subtitles") || stderrStr.includes("HTTP Error 429");
      
      if (!(isSubtitleError && fs.existsSync(outputPath))) {
        let errorMessage = "Failed to download clip.";
        if (e && typeof e === 'object') errorMessage = e.stderr || e.shortMessage || e.message || String(e);
        throw new Error(errorMessage);
      }
    }

    if ((stderrStr.includes("Unable to download video subtitles") || stderrStr.includes("HTTP Error 429")) && fs.existsSync(outputPath)) {
      subtitleWarning = true;
    }
  }

  return { outputPath, subtitleWarning };
}
