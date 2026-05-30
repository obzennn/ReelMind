const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runTikTokBot(videoPath, title, description, tags) {
  console.log("Launching TikTok Stealth Bot...");
  
  // Create a persistent context to store login cookies
  const userDataDir = path.join(__dirname, '..', '.tiktok_session');
  
  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: process.env.HEADLESS !== "false", // Run headful once to scan QR code
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = await browser.newPage();
  
  // Set realistic user agent
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9'
  });

  try {
    await page.goto('https://www.tiktok.com/creator-center/upload', { waitUntil: 'networkidle' });
    
    // Check if we need to login
    const loginIframe = await page.$('iframe[src*="login"]');
    if (loginIframe) {
      console.log("LOGIN REQUIRED: Please run with HEADLESS=false to scan the QR code, then rerun.");
      await browser.close();
      process.exit(1);
    }

    // Wait for the file input element
    console.log("Uploading video...");
    const fileInput = await page.waitForSelector('input[type="file"]', { state: 'attached' });
    await fileInput.setInputFiles(videoPath);

    // Wait for upload progress to complete (very simplified logic)
    console.log("Waiting for video to process...");
    await page.waitForTimeout(10000); // Hacky sleep, a real bot would check DOM elements

    // Type description
    console.log("Typing caption...");
    const editor = await page.waitForSelector('.public-DraftEditor-content');
    await editor.click();
    await page.keyboard.type(`${title} - ${description} ${tags}`);

    // Click Post
    console.log("Publishing...");
    const postButton = await page.waitForSelector('button:has-text("Post")');
    await postButton.click();

    console.log("Success! Video uploaded to TikTok.");
    
    // Wait for success modal
    await page.waitForTimeout(5000);
    
  } catch (err) {
    console.error("TikTok Bot Error:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Extract args
const [,, videoPath, title, description, tags] = process.argv;

if (!videoPath || !fs.existsSync(videoPath)) {
  console.error("Video file not found:", videoPath);
  process.exit(1);
}

runTikTokBot(videoPath, title || "", description || "", tags || "").catch(console.error);
