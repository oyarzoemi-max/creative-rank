import type { SupabaseClient } from "@supabase/supabase-js";

export async function uploadCompanyLogo(
  supabase: SupabaseClient,
  userId: string,
  file: File,
) {
  if (!file.type.startsWith("image/")) throw new Error("El logo debe ser una imagen.");
  if (file.size > 2 * 1024 * 1024) throw new Error("El logo no puede superar 2 MB.");

  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("company-logos")
    .upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (error) throw error;

  const { data } = supabase.storage.from("company-logos").getPublicUrl(path);
  return data.publicUrl;
}
