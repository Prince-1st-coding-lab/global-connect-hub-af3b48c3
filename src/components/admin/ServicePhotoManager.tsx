import { useEffect, useMemo, useState } from "react";
import { Loader2, Trash2, Upload, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { SERVICES } from "@/data/services";

type Photo = {
  id: string;
  service_slug: string;
  storage_path: string;
  created_at: string;
  signedUrl?: string;
};

const humanize = (slug: string) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

async function signBatch(paths: string[]) {
  if (!paths.length) return {} as Record<string, string>;
  const { data, error } = await supabase.storage
    .from("service-photos")
    .createSignedUrls(paths, 60 * 60 * 24 * 7);
  if (error) return {};
  const map: Record<string, string> = {};
  (data ?? []).forEach((r) => {
    if (r.path && r.signedUrl) map[r.path] = r.signedUrl;
  });
  return map;
}

export const ServicePhotoManager = () => {
  const [slug, setSlug] = useState<string>(SERVICES[0]?.slug ?? "");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async (s: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("service_photos")
      .select("id,service_slug,storage_path,created_at")
      .eq("service_slug", s)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load photos", description: error.message, variant: "destructive" });
      setPhotos([]);
      setLoading(false);
      return;
    }
    const list = (data ?? []) as Photo[];
    const urlMap = await signBatch(list.map((p) => p.storage_path));
    setPhotos(list.map((p) => ({ ...p, signedUrl: urlMap[p.storage_path] })));
    setLoading(false);
  };

  useEffect(() => {
    if (slug) load(slug);
  }, [slug]);

  const onUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    let failed = 0;
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${slug}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("service-photos")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (upErr) {
        failed++;
        continue;
      }
      const { error: dbErr } = await supabase.from("service_photos").insert({
        service_slug: slug,
        storage_path: path,
        public_url: path, // signed URLs generated on read
      });
      if (dbErr) {
        failed++;
        await supabase.storage.from("service-photos").remove([path]);
      }
    }
    setUploading(false);
    if (failed) toast({ title: `${failed} file(s) failed to upload`, variant: "destructive" });
    else toast({ title: "Photos uploaded" });
    load(slug);
  };

  const removePhoto = async (p: Photo) => {
    setDeleting(p.id);
    const [{ error: sErr }, { error: dErr }] = await Promise.all([
      supabase.storage.from("service-photos").remove([p.storage_path]),
      supabase.from("service_photos").delete().eq("id", p.id),
    ]);
    setDeleting(null);
    if (sErr || dErr) {
      toast({
        title: "Delete failed",
        description: sErr?.message || dErr?.message,
        variant: "destructive",
      });
      return;
    }
    setPhotos((prev) => prev.filter((x) => x.id !== p.id));
  };

  return (
    <div className="mt-10">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Service photos</h2>
          <p className="text-xs text-muted-foreground">
            Upload extra photos that appear in each service's gallery on the site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={slug} onValueChange={setSlug}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-72">
              {SERVICES.map((s) => (
                <SelectItem key={s.slug} value={s.slug}>{humanize(s.slug)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onUpload(e.target.files)}
              disabled={uploading}
            />
            <span className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gold/40 bg-gold px-3 py-2 text-sm text-primary-foreground hover:bg-gold/90">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload photos
            </span>
          </label>
        </div>
      </div>

      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : photos.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-gold/20 p-6 text-sm text-muted-foreground">
          <ImagePlus className="h-4 w-4" />
          No custom photos yet for {humanize(slug)}. Uploaded photos will appear on the service page.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-lg border border-gold/15">
              {p.signedUrl ? (
                <img src={p.signedUrl} alt="" className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-secondary/40 text-xs text-muted-foreground">
                  Preview unavailable
                </div>
              )}
              <Button
                size="icon"
                variant="destructive"
                className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                disabled={deleting === p.id}
                onClick={() => removePhoto(p)}
              >
                {deleting === p.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
