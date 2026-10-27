"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  CheckCheck,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { BookingStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BookingActionsProps {
  bookingId: string;
  currentStatus: BookingStatus | string;
  customerName?: string;
  serviceName?: string;
  onStatusChange?: (newStatus: BookingStatus) => void;
}

export function BookingActions({
  bookingId,
  currentStatus,
  customerName,
  serviceName,
  onStatusChange,
}: BookingActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<BookingStatus | null>(null);

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [cancellationReason, setCancellationReason] = React.useState("");

  // Confirmation dialog for Complete
  const [completeDialogOpen, setCompleteDialogOpen] = React.useState(false);

  const normalizedStatus = currentStatus?.toUpperCase() as BookingStatus;

  const handleUpdateStatus = async (
    targetStatus: BookingStatus,
    reason?: string
  ) => {
    setIsLoading(targetStatus);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: targetStatus,
          reason: reason?.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update booking status");
      }

      toast.success(
        `Booking ${targetStatus.toLowerCase()} successfully`,
        {
          description: customerName
            ? `${customerName}'s appointment for ${serviceName || "service"} updated.`
            : "Customer has been notified via email.",
        }
      );

      setCancelDialogOpen(false);
      setCompleteDialogOpen(false);
      setCancellationReason("");

      if (onStatusChange) {
        onStatusChange(targetStatus);
      }

      router.refresh();
    } catch (error) {
      console.error("Booking status update error:", error);
      toast.error(
        error instanceof Error ? error.message : "An error occurred while updating status"
      );
    } finally {
      setIsLoading(null);
    }
  };

  if (normalizedStatus === BookingStatus.CANCELLED) {
    return (
      <span className="text-xs font-medium text-muted-foreground italic">
        No actions available
      </span>
    );
  }

  if (normalizedStatus === BookingStatus.COMPLETED) {
    return (
      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
        Completed
      </span>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* PENDING -> CONFIRMED */}
        {normalizedStatus === BookingStatus.PENDING && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 border-emerald-500/30 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-700/50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            disabled={isLoading !== null}
            onClick={() => handleUpdateStatus(BookingStatus.CONFIRMED)}
          >
            {isLoading === BookingStatus.CONFIRMED ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            <span>Confirm</span>
          </Button>
        )}

        {/* CONFIRMED -> COMPLETED */}
        {normalizedStatus === BookingStatus.CONFIRMED && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 border-blue-500/30 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-700/50 dark:text-blue-400 dark:hover:bg-blue-950/40"
            disabled={isLoading !== null}
            onClick={() => setCompleteDialogOpen(true)}
          >
            {isLoading === BookingStatus.COMPLETED ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            <span>Complete</span>
          </Button>
        )}

        {/* CANCEL (Allowed for PENDING or CONFIRMED) */}
        {(normalizedStatus === BookingStatus.PENDING ||
          normalizedStatus === BookingStatus.CONFIRMED) && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={isLoading !== null}
            onClick={() => setCancelDialogOpen(true)}
          >
            {isLoading === BookingStatus.CANCELLED ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            <span>Cancel</span>
          </Button>
        )}
      </div>

      {/* Cancellation Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Cancel Booking</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to cancel this booking? This will immediately
              notify the customer via email. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="cancel-reason" className="text-sm font-medium">
              Cancellation Reason (Optional)
            </Label>
            <Textarea
              id="cancel-reason"
              placeholder="e.g. Scheduling conflict, customer requested cancellation, provider unavailable..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This note will be included in the cancellation email sent to the customer.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading !== null}
              onClick={() => setCancelDialogOpen(false)}
            >
              Keep Booking
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isLoading !== null}
              onClick={() =>
                handleUpdateStatus(BookingStatus.CANCELLED, cancellationReason)
              }
            >
              {isLoading === BookingStatus.CANCELLED ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Confirmation Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <CheckCheck className="h-5 w-5" />
              <DialogTitle>Mark Booking as Completed</DialogTitle>
            </div>
            <DialogDescription>
              Marking this appointment as completed will record the service as
              delivered and include its revenue in your earnings reports.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-sm text-muted-foreground">
            {customerName && (
              <p>
                <strong>Customer:</strong> {customerName}
              </p>
            )}
            {serviceName && (
              <p>
                <strong>Service:</strong> {serviceName}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading !== null}
              onClick={() => setCompleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading !== null}
              onClick={() => handleUpdateStatus(BookingStatus.COMPLETED)}
            >
              {isLoading === BookingStatus.COMPLETED ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Mark as Completed"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
