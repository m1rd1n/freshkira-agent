import { useCallback, useState } from 'react';

export interface KnowledgeFile {
  name: string;
  content: string;
  sizeKB: number;
}

const MAX_FILE_SIZE_KB = 500;
const MAX_FILES = 10;

export function useKnowledgeFiles() {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback((incoming: KnowledgeFile[]) => {
    setError(null);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const toAdd = incoming
        .filter((f) => {
          if (existingNames.has(f.name)) return false;
          if (f.sizeKB > MAX_FILE_SIZE_KB) {
            setError(`"${f.name}" is too large (max ${MAX_FILE_SIZE_KB} KB)`);
            return false;
          }
          return true;
        })
        .slice(0, MAX_FILES - prev.length);

      if (prev.length + toAdd.length >= MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed.`);
      }

      return [...prev, ...toAdd];
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setError(null);
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setError(null);
  }, []);

  // Returns a formatted block to append to userInput
  const buildContext = useCallback(() => {
    if (files.length === 0) return '';
    const block = files
      .map((f) => `### ${f.name}\n${f.content}`)
      .join('\n\n');
    return `\n\n---\n## ADDITIONAL KNOWLEDGE (user-provided)\n\n${block}`;
  }, [files]);

  const totalSizeKB = files.reduce((sum, f) => sum + f.sizeKB, 0);

  return { files, error, addFiles, removeFile, clearFiles, buildContext, totalSizeKB };
}
