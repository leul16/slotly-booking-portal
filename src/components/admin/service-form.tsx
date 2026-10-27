"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Pencil } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const serviceFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Service name must be at least 2 characters")
    .max(100, "Service name cannot exceed 100 characters"),
  slug: z
    .string()
    .trim()
    .max(100, "Slug cannot exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase alphanumeric characters separated by single hyphens"
    )
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  durationMinutes: z.coerce
    .number()
    .int("Duration must be a whole number of minutes")
    .min(15, "Duration must be at least 15 minutes")
    .max(480, "Duration cannot exceed 480 minutes (8 hours)"),
  price: z.coerce
    .number()
    .positive("Price must be greater than zero")
    .max(100000, "Price cannot exceed $100,000"),
  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter currency code")
    .toUpperCase()
    .default("USD"),
  isActive: z.boolean().default(true),
});

export type ServiceFormData = z.infer<typeof serviceFormSchema>;

export interface ExistingService {
  id: string;
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  price: unknown;
  currency: string;
  isActive: boolean;
}

interface ServiceFormDialogProps {
  service?: ExistingService;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ServiceFormDialog({
  service,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onSuccess,
}: ServiceFormDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isEditing = Boolean(service);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const [formData, setFormData] = React.useState<ServiceFormData>({
    name: service?.name || "",
    slug: service?.slug || "",
    description: service?.description || "",
    durationMinutes: service?.durationMinutes || 60,
    price: service ? Number(service.price) : 50,
    currency: service?.currency || "USD",
    isActive: service?.isActive !== undefined ? service.isActive : true,
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof ServiceFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(Boolean(service?.slug));

  // Reset form when service prop changes or modal opens
  React.useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        slug: service.slug,
        description: service.description,
        durationMinutes: service.durationMinutes,
        price: Number(service.price),
        currency: service.currency,
        isActive: service.isActive,
      });
      setSlugManuallyEdited(true);
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        durationMinutes: 60,
        price: 50,
        currency: "USD",
        isActive: true,
      });
      setSlugManuallyEdited(false);
    }
    setErrors({});
  }, [service, open]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: !slugManuallyEdited ? generateSlug(newName) : prev.slug,
    }));
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
    }));
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with zod
    const result = serviceFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ServiceFormData, string>> = {};
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as keyof ServiceFormData;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);
      toast.error("Please fix the validation errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/admin/services/${service!.id}`
        : "/api/admin/services";

      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        name: result.data.name,
        slug: result.data.slug || generateSlug(result.data.name),
        description: result.data.description,
        durationMinutes: result.data.durationMinutes,
        price: result.data.price,
        currency: result.data.currency,
        isActive: result.data.isActive,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save service");
      }

      toast.success(
        isEditing
          ? `Service "${result.data.name}" updated successfully`
          : `Service "${result.data.name}" created successfully`
      );

      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
      router.refresh();
    } catch (error) {
      console.error("Service submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : isEditing ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Add Service</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Service: ${service?.name}` : "Create New Service"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update service details, pricing, duration, and availability status."
              : "Define a new service for clients to book through the portal."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Service Name */}
          <div className="space-y-1.5">
            <Label htmlFor="service-name" className="text-sm font-medium">
              Service Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="service-name"
              placeholder="e.g. 60-Minute Deep Tissue Massage"
              value={formData.name}
              onChange={handleNameChange}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Service Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="service-slug" className="text-sm font-medium">
                URL Slug
              </Label>
              <span className="text-xs text-muted-foreground">
                Auto-generated from name
              </span>
            </div>
            <div className="flex items-center rounded-md border border-input bg-muted/30 px-3">
              <span className="text-xs text-muted-foreground select-none">
                /services/
              </span>
              <input
                id="service-slug"
                className="w-full bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="deep-tissue-massage"
                value={formData.slug}
                onChange={handleSlugChange}
                disabled={isSubmitting}
              />
            </div>
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="service-desc" className="text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="service-desc"
              placeholder="Detailed description of what the client can expect during this service session..."
              rows={3}
              value={formData.description}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, description: e.target.value }));
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: undefined }));
                }
              }}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Duration & Pricing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration */}
            <div className="space-y-1.5">
              <Label htmlFor="service-duration" className="text-sm font-medium">
                Duration (minutes) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="service-duration"
                type="number"
                min={15}
                max={480}
                step={15}
                value={formData.durationMinutes}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    durationMinutes: parseInt(e.target.value, 10) || 0,
                  }));
                  if (errors.durationMinutes) {
                    setErrors((prev) => ({ ...prev, durationMinutes: undefined }));
                  }
                }}
                disabled={isSubmitting}
              />
              {errors.durationMinutes && (
                <p className="text-xs text-destructive">{errors.durationMinutes}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor="service-price" className="text-sm font-medium">
                Price ({formData.currency}) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="service-price"
                  type="number"
                  min={0.01}
                  step={0.01}
                  className="pl-7"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }));
                    if (errors.price) {
                      setErrors((prev) => ({ ...prev, price: undefined }));
                    }
                  }}
                  disabled={isSubmitting}
                />
              </div>
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Active Status Checkbox */}
          <div className="rounded-lg border border-border p-3.5 bg-muted/20 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Active Service
              </p>
              <p className="text-xs text-muted-foreground">
                When enabled, clients can discover and book this service online.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                disabled={isSubmitting}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Service"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
