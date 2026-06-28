import { useState, useCallback, useRef } from 'react';

const MAX_SIZE_MB = 10;
const ACCEPTED = ['.pdf', '.jpg', '.jpeg', '.png'];

export function useFileUpload(onToast) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const addFiles = useCallback((incoming) => {
    const arr = Array.from(incoming);
    const added = [];

    arr.forEach((f) => {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      if (!ACCEPTED.includes(ext)) {
        onToast && onToast(`${f.name}: unsupported format`);
        return;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        onToast && onToast(`${f.name}: exceeds 10 MB limit`);
        return;
      }
      added.push(f);
    });

    setFiles((prev) => {
      const existingNames = prev.map((p) => p.name);
      return [...prev, ...added.filter((f) => !existingNames.includes(f.name))];
    });
  }, [onToast]);

  const removeFile = useCallback((name) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }, []);

  const clearFiles = useCallback(() => setFiles([]), []);

  const openPicker = useCallback(() => {
    inputRef.current && inputRef.current.click();
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const onInputChange = useCallback((e) => {
    addFiles(e.target.files);
    e.target.value = '';
  }, [addFiles]);

  return {
    files,
    dragging,
    inputRef,
    addFiles,
    removeFile,
    clearFiles,
    openPicker,
    onDragOver,
    onDragLeave,
    onDrop,
    onInputChange,
    accepted: ACCEPTED.join(','),
  };
}
