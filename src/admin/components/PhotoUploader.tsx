import React, { useRef, useState } from 'react';
import { supabase, storagePublicUrl } from '../../lib/supabase';
import { useToast } from './Toast';

/**
 * Single-photo upload: drag-and-drop or click, preview, replace, remove.
 * Uploads to `bucket` with a random filename; on remove, deletes from Storage
 * only when the stored value is a bucket key (not a /public asset or full URL).
 */
export const PhotoUploader: React.FC<{
  value: string | null;
  bucket: string;
  onChange: (path: string | null) => void;
}> = ({ value, bucket, onChange }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!supabase) { toast('Supabase not configured', 'error'); return; }
    setUploading(true);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false, contentType: file.type });
    setUploading(false);
    if (error) { toast(`Upload failed: ${error.message}`, 'error'); return; }
    onChange(path);
    toast('Photo uploaded', 'success');
  };

  const removePhoto = async () => {
    if (!value) return;
    if (!window.confirm('Remove this photo?')) return;
    // Only delete from Storage if it's a Supabase-managed key (not a /public asset or URL).
    if (supabase && !value.startsWith('/') && !value.startsWith('http')) {
      const { error } = await supabase.storage.from(bucket).remove([value]);
      if (error) { toast(`Storage delete failed: ${error.message}`, 'error'); return; }
    }
    onChange(null);
    toast('Photo removed', 'success');
  };

  return (
    <div>
      <div
        className="upload-area"
        onClick={() => fileInput.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
      >
        {value ? <img src={storagePublicUrl(bucket, value)} alt="" /> : <p>Click or drop a photo here</p>}
        {uploading && <p style={{ marginTop: 8 }}>Uploading…</p>}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {value && (
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button type="button" className="admin-btn secondary" onClick={(e) => { e.stopPropagation(); fileInput.current?.click(); }}>Replace photo</button>
          <button type="button" className="admin-btn danger" onClick={(e) => { e.stopPropagation(); removePhoto(); }}>Remove photo</button>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
