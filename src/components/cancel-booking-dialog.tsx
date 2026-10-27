"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CancelBookingDialogProps {
  bookingId: string;
  serviceName: string;
  scheduledAt: string | Date;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CancelBookingDialog({
  bookingId,
  serviceName,
  scheduledAt,
  trigger,
  onSuccess,
}: CancelBookingDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const formattedDate = new Date(scheduledAt).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const handleCancelBooking = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: reason.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking.");
      }

      toast.success("Your booking has been cancelled.");
      setIsOpen(false);
      setReason("");
      if (onSuccess) {
        onSuccess();
      }
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel booking.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
            Cancel Booking
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Cancel Booking</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to cancel your appointment for{" "}
            <span className="font-semibold text-foreground">{serviceName}</span> on{" "}
            <span className="font-semibold text-foreground">{formattedDate}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400">
            <strong>Policy:</strong> Appointments can only be cancelled up to 24 hours prior to the scheduled time. Once cancelled, your slot will become available for others.
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancel-reason" className="text-sm font-medium">
              Reason for cancellation <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="cancel-reason"
              placeholder="e.g. Schedule conflict, feeling unwell, rescheduled..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              className="resize-none h-20 text-sm"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Keep Appointment
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancelBooking}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
