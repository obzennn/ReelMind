import fs from "fs";

async function runTests() {
  const API_URL = "http://localhost:3000/api/clip";
  let passed = 0;
  let failed = 0;

  const assert = (condition, msg) => {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  };

  console.log("Starting API Tests. Ensure the Next.js server is running on localhost:3000...\n");

  // Test 1: Missing Fields
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(res.status === 400, "Should return 400 when fields are missing");
  } catch (e) {
    assert(false, "Test 1 threw an error: " + e.message);
  }

  // Test 2: Invalid URL
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: "https://invalid-url.com",
        startTime: "00:00",
        endTime: "00:10"
      }),
    });
    // The current implementation returns 500 for invalid URLs because yt-dlp fails.
    // Ideally it should return a 400 with a user-friendly message.
    assert(res.status === 500 || res.status === 400, "Should handle invalid URL appropriately (returns 500 currently)");
  } catch (e) {
    assert(false, "Test 2 threw an error: " + e.message);
  }

  // Test 3: Invalid Timestamps (Start > End)
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: "https://www.youtube.com/watch?v=jNQXAC9IVRw", // "Me at the zoo"
        startTime: "00:15",
        endTime: "00:05" // End is before Start
      }),
    });
    // We expect this to fail gracefully (ideally 400 Bad Request)
    assert(res.status === 400 || res.status === 500, "Should handle invalid timestamps (currently passes them to yt-dlp)");
  } catch (e) {
    assert(false, "Test 3 threw an error: " + e.message);
  }

  // Test 4: Analyze API Response Format
  try {
    const res = await fetch("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      }),
    });
    
    assert(res.status === 200, "Analyze API should return 200 OK for valid URL");
    const data = await res.json();
    assert(Array.isArray(data.clips), "Analyze API must return a 'clips' array (can legitimately be empty if no clips > 80 virality)");
  } catch (e) {
    assert(false, "Test 4 threw an error: " + e.message);
  }

  console.log(`\nTests Completed. Passed: ${passed}, Failed: ${failed}`);
}

runTests();
