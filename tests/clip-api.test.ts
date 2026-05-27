import { NextRequest } from "next/server";
import { POST } from "../src/app/api/clip/route";

// A simple mock test runner for the API route.
// In a real scenario, this would be executed via Jest or Vitest.

async function runTests() {
  console.log("Running API Tests...");

  // Mock Request helper
  const createMockReq = (body: any) => {
    return new NextRequest("http://localhost:3000/api/clip", {
      method: "POST",
      body: JSON.stringify(body),
    });
  };

  try {
    // 1. Test Duration Limit
    const req1 = createMockReq({
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      startTime: "00:00",
      endTime: "15:00", // 15 mins > 10 mins
      includeSubtitles: false,
    });
    const res1 = await POST(req1);
    const body1 = await res1.json();
    if (res1.status === 400 && body1.error.includes("Clip duration cannot exceed")) {
      console.log("✅ Passed: Duration limit enforced.");
    } else {
      console.error("❌ Failed: Duration limit not enforced.", body1);
    }

    // 2. Test Invalid URL
    const req2 = createMockReq({
      url: "https://vimeo.com/123456",
      startTime: "00:00",
      endTime: "01:00",
      includeSubtitles: true,
    });
    const res2 = await POST(req2);
    const body2 = await res2.json();
    if (res2.status === 400 && body2.error === "Invalid YouTube URL") {
      console.log("✅ Passed: Invalid URL correctly rejected.");
    } else {
      console.error("❌ Failed: Invalid URL was not rejected.", body2);
    }

    // 3. Test Invalid Timestamps (start > end)
    const req3 = createMockReq({
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      startTime: "05:00",
      endTime: "01:00",
      includeSubtitles: false,
    });
    const res3 = await POST(req3);
    const body3 = await res3.json();
    if (res3.status === 400 && body3.error.includes("Start time must be before end time")) {
      console.log("✅ Passed: Invalid timestamps safely caught.");
    } else {
      console.error("❌ Failed: Invalid timestamps not caught.", body3);
    }

    console.log("Done running API Tests.");
  } catch (error) {
    console.error("Test execution failed:", error);
  }
}

// export for test runners, or execute directly if it were a script
export { runTests };
