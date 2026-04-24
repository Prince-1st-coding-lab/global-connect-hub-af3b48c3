import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Upload, Image as ImageIcon, Save, LogOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  ADMIN_TOKEN,
  API_URL,
  createService,
  deleteImage,
  deleteService,
  isBackendConfigured,
  listImages,
  listServices,
  updateService,
  uploadImage,
  type ApiService,
  type Availability,
} from "@/lib/api";

const STORAGE_KEY = "noble_admin_token";

const blank = (): ApiService => ({
  slug: "",
  title: "",
  description: "",
  icon: "Sparkles",
  availability: "custom" as Availability,
  leadTimeMinDays: 7,
  leadTimeMaxDays: 14,
  coverUrl: "",
  gallery: [],
  sortOrder: 999,
});

const Admin = () => {
  const [authed, setAuthed] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  useEffect(() => {
    document.title = "Admin — Noble Spaces";
    // If env token matches what user previously entered, auto-auth.
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (ADMIN_TOKEN && stored === ADMIN_TOKEN) setAuthed(true);
  }, []);

  if (!isBackendConfigured()) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-40 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-gold" />
        <h1 className="mt-6 font-display text-3xl">Backend not configured</h1>
        <p className="mt-3 text-muted-foreground">
          Set <code className="rounded bg-muted px-1">VITE_API_URL</code> and{" "}
          <code className="rounded bg-muted px-1">VITE_ADMIN_TOKEN</code> in your{" "}
          <code>.env</code>, then restart the dev server. See{" "}
          <a className="text-gold underline" href="/docs/API.md">docs/API.md</a> for the
          REST contract you need to implement.
        </p>
      </section>
    );
  }

  if (!authed) {
    return (
      <section className="mx-auto max-w-md px-6 py-40">
        <h1 className="font-display text-3xl">Admin access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the admin token (must match <code>VITE_ADMIN_TOKEN</code>).
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (tokenInput && tokenInput === ADMIN_TOKEN) {
              sessionStorage.setItem(STORAGE_KEY, tokenInput);
              setAuthed(true);
            } else {
              toast({ title: "Wrong token", variant: "destructive" });
            }
          }}
        >
          <Input
            type="password"
            placeholder="Admin token"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
      </section>
    );
  }

  return <AdminPanel onSignOut={() => { sessionStorage.removeItem(STORAGE_KEY); setAuthed(false); }} />;
};

const AdminPanel = ({ onSignOut }: { onSignOut: () => void }) => {
  const qc = useQueryClient();
  const services = useQuery({ queryKey: ["services"], queryFn: listServices });
  const [editing, setEditing] = useState<ApiService | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["services"] });

  const removeMut = useMutation({
    mutationFn: (slug: string) => deleteService(slug),
    onSuccess: () => { toast({ title: "Service deleted" }); refresh(); },
    onError: (e: Error) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-32">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Services admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connected to <code className="rounded bg-muted px-1">{API_URL}</code>
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" /> New service
          </Button>
          <Button variant="outline" onClick={onSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>

      {services.isLoading && (
        <div className="mt-12 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading services…
        </div>
      )}
      {services.error && (
        <div className="mt-12 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load services: {(services.error as Error).message}
        </div>
      )}

      <div className="mt-10 grid gap-3">
        {(services.data ?? []).map((svc) => (
          <div
            key={svc.slug}
            className="flex items-center gap-4 rounded-xl border border-gold/20 bg-card p-3"
          >
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
              {svc.coverUrl ? (
                <img src={svc.coverUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-base">{svc.title || svc.slug}</div>
              <div className="truncate text-xs text-muted-foreground">/{svc.slug}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              {svc.gallery?.length ?? 0} image{svc.gallery?.length === 1 ? "" : "s"}
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditing(svc)}>Edit</Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (confirm(`Delete "${svc.title || svc.slug}"? This cannot be undone.`)) {
                  removeMut.mutate(svc.slug);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <ServiceFormDialog
        open={creating}
        onOpenChange={setCreating}
        initial={blank()}
        mode="create"
        onSaved={refresh}
      />
      {editing && (
        <ServiceFormDialog
          open
          onOpenChange={(o) => { if (!o) setEditing(null); }}
          initial={editing}
          mode="edit"
          onSaved={refresh}
        />
      )}
    </section>
  );
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const ServiceFormDialog = ({
  open, onOpenChange, initial, mode, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: ApiService;
  mode: "create" | "edit";
  onSaved: () => void;
}) => {
  const [form, setForm] = useState<ApiService>(initial);
  useEffect(() => { setForm(initial); }, [initial, open]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        slug: form.slug || slugify(form.title),
        title: form.title,
        description: form.description,
        icon: form.icon || "Sparkles",
        availability: form.availability,
        leadTimeMinDays: Number(form.leadTimeMinDays) || 0,
        leadTimeMaxDays: Number(form.leadTimeMaxDays) || 0,
        coverUrl: form.coverUrl,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (mode === "create") return createService(payload);
      return updateService(initial.slug, payload);
    },
    onSuccess: () => {
      toast({ title: mode === "create" ? "Service created" : "Service updated" });
      onSaved();
      onOpenChange(false);
    },
    onError: (e: Error) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New service" : `Edit: ${initial.title || initial.slug}`}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })}
              placeholder="Sofa Manufacturing"
            />
          </Field>
          <Field label="Slug (URL)">
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              placeholder="sofa-manufacturing"
              disabled={mode === "edit"}
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Icon (lucide name)">
              <Input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="Sofa"
              />
            </Field>
            <Field label="Availability">
              <Select
                value={form.availability}
                onValueChange={(v) => setForm({ ...form, availability: v as Availability })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Ready stock + Custom</SelectItem>
                  <SelectItem value="custom">Custom only</SelectItem>
                  <SelectItem value="service">On-site service</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Lead time min (days)">
              <Input
                type="number"
                value={form.leadTimeMinDays}
                onChange={(e) => setForm({ ...form, leadTimeMinDays: Number(e.target.value) })}
              />
            </Field>
            <Field label="Lead time max (days)">
              <Input
                type="number"
                value={form.leadTimeMaxDays}
                onChange={(e) => setForm({ ...form, leadTimeMaxDays: Number(e.target.value) })}
              />
            </Field>
            <Field label="Sort order">
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="Cover image URL (optional — first uploaded image is used if empty)">
            <Input
              value={form.coverUrl}
              onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
              placeholder="https://…"
            />
          </Field>

          {mode === "edit" && <ImagesManager slug={initial.slug} />}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
            {saveMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid gap-1.5">
    <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const ImagesManager = ({ slug }: { slug: string }) => {
  const qc = useQueryClient();
  const images = useQuery({ queryKey: ["images", slug], queryFn: () => listImages(slug) });

  const uploadMut = useMutation({
    mutationFn: (file: File) => uploadImage(slug, file),
    onSuccess: () => {
      toast({ title: "Image uploaded" });
      qc.invalidateQueries({ queryKey: ["images", slug] });
      qc.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (e: Error) => toast({ title: "Upload failed", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteImage(slug, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["images", slug] });
      qc.invalidateQueries({ queryKey: ["services"] });
    },
  });

  return (
    <div className="rounded-lg border border-gold/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium">Gallery images</div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gold/40 px-3 py-1.5 text-xs hover:bg-gold/10">
          <Upload className="h-3.5 w-3.5" />
          {uploadMut.isPending ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadMut.mutate(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {images.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : images.data?.length ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.data.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-md bg-muted">
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => { if (confirm("Delete this image?")) deleteMut.mutate(img.id); }}
                className="absolute right-1 top-1 rounded bg-background/90 p-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No images yet.</div>
      )}
    </div>
  );
};

export default Admin;
