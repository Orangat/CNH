import React, { useRef, useState } from 'react';
import { supabase, storagePublicUrl } from '../../lib/supabase';
import { useToast } from './Toast';
import { moveItem } from './moveItem';

/**
 * Multi-photo gallery: pick or drop several files at once, each uploaded to
 * `bucket`; thumbnails with a position number, remove, and ↑/↓ reorder.
 * The first image is the lead. Order is persisted as an ordered string[].
 */
export const GalleryUploader: React.FC<{
  value: string[];
  bucket: string;
  onChange: (paths: string[]) => void;
}> = ({ value, bucket, onChange }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    if (!supabase) { toast('Supabase not configured', 'error'); return; }
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
      if (error) { toast(`Upload failed: ${error.message}`, 'error'); continue; }
      uploaded.push(path);
    }
    setUploading(false);
    if (uploaded.length) {
      onChange([...value, ...uploaded]);
      toast(`Added ${uploaded.length} photo${uploaded.length > 1 ? 's' : ''}`, 'success');
    }
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => onChange(moveItem(value, i, i + dir));

  return (
    <div>
      <div
        className="upload-area"
        onClick={() => fileInput.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files); }}
      >
        <p className="big">Add gallery photos</p>
        <p>Select several at once, or drop them here</p>
        {uploading && <p style={{ marginTop: 8 }}>Uploading…</p>}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => { if (e.target.files?.length) uploadFiles(e.target.files); e.target.value = ''; }}
        />
      </div>
      {value.length > 0 && (
        <div className="gallery-grid">
          {value.map((path, i) => (
            <div className="g-item" key={path}>
              <span className="g-ord">{i + 1}</span>
              <button type="button" className="g-rm" aria-label="Remove photo" onClick={() => remove(i)}>✕</button>
              <div className="g-mv">
                <button type="button" aria-label="Move earlier" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" aria-label="Move later" onClick={() => move(i, 1)} disabled={i === value.length - 1}>↓</button>
              </div>
              <img src={storagePublicUrl(bucket, path)} alt="" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryUploader;
