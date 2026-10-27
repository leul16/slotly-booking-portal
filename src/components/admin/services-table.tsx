"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Clock,
  Loader2,
  Trash2,
  Power,
  Pencil,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceFormDialog, ExistingService } from "@/components/admin/service-form";

export interface ServiceWithCount extends ExistingService {
  createdAt: Date | string;
  _count?: {
    bookings: number;
  };
}

interface ServicesTableProps {
  services: ServiceWithCount[];
}

export function ServicesTable({ services }: ServicesTableProps) {
  const router = useRouter();
  const [toggleLoadingId, setToggleLoadingId] = React.useState<string | null>(null);

  // Delete state
  const [serviceToDelete, setServiceToDelete] = React.useState<ServiceWithCount | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Edit dialog state
  const [serviceToEdit, setServiceToEdit] = React.useState<ServiceWithCount | null>(null);

  const handleToggleActive = async (service: ServiceWithCount) => {
    setToggleLoadingId(service.id);
    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !service.isActive,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update service status");
      }

      toast.success(
        `Service "${service.name}" ${!service.isActive ? "activated" : "deactivated"}`
      );
      router.refresh();
    } catch (error) {
      console.error("Toggle service error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle service status"
      );
    } finally {
      setToggleLoadingId(null);
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/services/${serviceToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete service");
      }

      toast.success(data.message || `Service "${serviceToDelete.name}" removed`);
      setServiceToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Delete service error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete service"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (services.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
          <Calendar className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-foreground">No services configured yet</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
          Add your first service offering so customers can book appointments with you.
        </p>
        <div className="mt-6">
          <ServiceFormDialog />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[30%]">Service</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total Bookings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => {
              const numericPrice = Number(service.price);
              const formattedPrice = isNaN(numericPrice)
                ? "$0.00"
                : `$${numericPrice.toFixed(2)}`;

              const bookingsCount = service._count?.bookings || 0;
              const isToggleLoading = toggleLoadingId === service.id;

              return (
                <TableRow key={service.id} className="group">
                  {/* Service info */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                        <span>{service.name}</span>
                        {!service.isActive && (
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                        {service.description}
                      </p>
                      <div className="text-[11px] font-mono text-muted-foreground">
                        /services/{service.slug}
                      </div>
                    </div>
                  </TableCell>

                  {/* Duration */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{service.durationMinutes} min</span>
                    </div>
                  </TableCell>

                  {/* Price */}
                  <TableCell>
                    <div className="font-semibold text-sm text-foreground">
                      {formattedPrice}{" "}
                      <span className="text-[11px] font-normal text-muted-foreground">
                        {service.currency}
                      </span>
                    </div>
                  </TableCell>

                  {/* Total Bookings */}
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                      {bookingsCount} {bookingsCount === 1 ? "booking" : "bookings"}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {service.isActive ? (
                      <Badge variant="success" className="gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Toggle Active Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`h-8 w-8 ${
                          service.isActive
                            ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title={service.isActive ? "Deactivate service" : "Activate service"}
                        disabled={isToggleLoading}
                        onClick={() => handleToggleActive(service)}
                      >
                        {isToggleLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                        <span className="sr-only">Toggle Active</span>
                      </Button>

                      {/* Edit Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-foreground hover:bg-muted"
                        title="Edit service"
                        onClick={() => setServiceToEdit(service)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>

                      {/* Delete Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        title="Delete service"
                        onClick={() => setServiceToDelete(service)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Service Modal */}
      {serviceToEdit && (
        <ServiceFormDialog
          service={serviceToEdit}
          open={Boolean(serviceToEdit)}
          onOpenChange={(open: boolean) => !open && setServiceToEdit(null)}
          onSuccess={() => setServiceToEdit(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(serviceToDelete)}
        onOpenChange={(open: boolean) => !open && setServiceToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Delete Service</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>&quot;{serviceToDelete?.name}&quot;</strong>?
              {serviceToDelete && (serviceToDelete._count?.bookings || 0) > 0 ? (
                <span className="block mt-2 text-amber-600 dark:text-amber-400">
                  Note: This service has {serviceToDelete._count?.bookings} existing
                  booking(s). It will be deactivated (soft deleted) to protect booking
                  history.
                </span>
              ) : (
                <span className="block mt-2">
                  This service has no bookings and will be permanently removed.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setServiceToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteService}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Service"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
