# Audio & Voice Capabilities

Diamond LLM features a high-fidelity audio system for Text-to-Speech (TTS) interactions, powered by **Kokoro**.

## 🔈 Text-to-Speech (TTS)

The application provides real-time speech synthesis for AI responses.

### Powered by Kokoro

We rely on [Kokoro](https://github.com/stylebert/kokoro-fastapi), a fast and high-quality TTS engine.

### Configuration

To enable audio capabilities, you must configure the `KOKORO_API_URL` environment variable. The system automatically detects if the service is reachable at startup.

```bash
# .env
KOKORO_API_URL="http://localhost:8880"
```

### Usage

1. **Auto-Play**: When enabled, new messages can be automatically read aloud.
2. **Manual Playback**: Users can play/pause specific messages.
3. **Queue System**: Audio segments are queued to ensure smooth playback of streaming responses.
