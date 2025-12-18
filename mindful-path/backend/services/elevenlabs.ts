export async function generateAudio(_text: string) {
  if (process.env.MOCK_ELEVENLABS === "true") {
    return { url: "mock://audio", cached: true };
  }
  // Real integration would call ElevenLabs; omitted for tests.
  return { url: "", cached: true };
}
