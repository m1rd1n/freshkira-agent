import { useCallback, useEffect, useRef, useState } from 'react';
import { AGENT_ENDPOINT } from '../constants/api';
import { AgentRequest, AgentStreamChunk, AgentStatus } from '../types';
import { useHistory } from './useHistory';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useAgent() {
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const { saveItem } = useHistory();
  const abortRef = useRef<AbortController | null>(null);

  // Cancel any in-flight request on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setOutput('');
    setStatus('idle');
    setError(null);
  }, []);

  const runAgent = useCallback(
    async (request: AgentRequest) => {
      // Cancel previous request if still running
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setOutput('');
      setError(null);
      setStatus('loading');

      let fullOutput = '';

      try {
        const response = await fetch(AGENT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        if (!response.ok) {
          const detail = await response.text().catch(() => '');
          throw new Error(
            response.status === 413
              ? 'Input is too long. Please shorten your text and try again.'
              : response.status === 422
                ? 'Invalid request. Please check your inputs.'
                : `Server error (${response.status})${detail ? ': ' + detail : ''}`,
          );
        }

        if (!response.body) {
          throw new Error('Streaming not supported by this browser/client.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        setStatus('streaming');

        // Buffer to handle chunks split across reads
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process all complete SSE lines in the buffer
          const lines = buffer.split('\n');
          // Keep the last (potentially incomplete) line in the buffer
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;

            let chunk: AgentStreamChunk;
            try {
              chunk = JSON.parse(trimmed.slice(6));
            } catch {
              continue; // malformed JSON — skip
            }

            if (chunk.done) {
              if (chunk.content) {
                // Backend sent an error message as the terminal event
                setError(chunk.content);
                setStatus('error');
              } else if (fullOutput.trim()) {
                // Clean stream end with real content — auto-save
                setStatus('done');
                await saveItem({
                  id: generateId(),
                  mode: request.mode,
                  timestamp: new Date().toISOString(),
                  input: request.userInput.slice(0, 200),
                  output: fullOutput,
                });
              } else {
                // Stream ended but nothing was produced
                setError('The agent did not return a response. Please try again.');
                setStatus('error');
              }
              return;
            }

            if (chunk.content) {
              fullOutput += chunk.content;
              setOutput(fullOutput);
            }
          }
        }

        // Stream ended without a done event — treat as complete if we have output
        if (fullOutput.trim()) {
          setStatus('done');
          await saveItem({
            id: generateId(),
            mode: request.mode,
            timestamp: new Date().toISOString(),
            input: request.userInput.slice(0, 200),
            output: fullOutput,
          });
        } else {
          setError('The agent did not return a response. Please try again.');
          setStatus('error');
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Intentional cancellation (reset() or unmount) — stay silent
          return;
        }

        let message = 'An unexpected error occurred. Please try again.';
        if (err instanceof TypeError && err.message === 'Network request failed') {
          message = 'No internet connection. Please check your connection and try again.';
        } else if (err instanceof Error) {
          message = err.message;
        }

        setError(message);
        setStatus('error');
      }
    },
    [saveItem],
  );

  return { output, status, error, runAgent, reset };
}
