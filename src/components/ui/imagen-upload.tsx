"use client";

import { ImageIcon, X } from "lucide-react";
import { useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type ImagenUploadProps = {
  defaultValue?: string | null;
};

export function ImagenUpload({ defaultValue }: ImagenUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultValue ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5MB.");
      return;
    }

    setError(null);
    setUploading(true);
    setPreview(URL.createObjectURL(file));

    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Debes estar autenticado para subir imágenes.");
      setPreview(defaultValue ?? null);
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop();
    // Store under {user_id}/{uuid}.ext to enforce per-user RLS
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("torneos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("Error al subir la imagen. Intenta nuevamente.");
      setPreview(defaultValue ?? null);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("torneos").getPublicUrl(path);
    setUrl(data.publicUrl);
    setUploading(false);
  }

  function handleRemove() {
    setPreview(null);
    setUrl("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-700">Imagen del torneo</span>

      {preview ? (
        <div className="relative w-full overflow-hidden rounded-xl border border-zinc-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="h-48 w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
          >
            <X size={14} />
          </button>
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="text-sm font-medium text-white">Subiendo…</span>
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 text-zinc-500 transition hover:border-zinc-400 hover:bg-zinc-50"
        >
          <ImageIcon size={24} />
          <span className="text-sm">Haz clic para subir una imagen</span>
          <span className="text-xs text-zinc-400">PNG, JPG, WEBP — máx. 5MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {error ? <span className="text-xs text-rose-600">{error}</span> : null}

      <input type="hidden" name="imagen_url" value={url} />
    </div>
  );
}
