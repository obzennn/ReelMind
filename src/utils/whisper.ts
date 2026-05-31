import fs from "fs";

export function formatAssTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds * 100) % 100);
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
}

export function generateAssFile(words: any[], outputPath: string) {
  const header = `[Script Info]
Title: Animated Captions
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 1

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,84,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,3,2,20,20,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const CHUNK_SIZE = 5;
  const chunks = [];
  for (let i = 0; i < words.length; i += CHUNK_SIZE) {
    chunks.push(words.slice(i, i + CHUNK_SIZE));
  }

  const dialogueLines = [];
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length; i++) {
      const activeWord = chunk[i];
      const startTimestamp = formatAssTime(activeWord.start);
      let endTimestamp = formatAssTime(activeWord.end);
      if (i < chunk.length - 1 && chunk[i + 1].start > activeWord.end) {
        endTimestamp = formatAssTime(chunk[i + 1].start);
      }
      const styledWords = chunk.map((w: any, index: number) => {
        const cleanText = (w.word || w.text || "").trim();
        if (index === i) {
          return `{\\c&H00FFFF&}${cleanText}{\\c&HFFFFFF&}`;
        }
        return cleanText;
      });
      const lineText = styledWords.join(" ");
      dialogueLines.push(`Dialogue: 0,${startTimestamp},${endTimestamp},Default,,0,0,0,,${lineText}`);
    }
  }

  fs.writeFileSync(outputPath, header + dialogueLines.join("\n") + "\n");
}
