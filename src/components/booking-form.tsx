"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDuration, cn } from "@/lib/utils";
import { TIMEZONE } from "@/lib/constants";

interface ServiceProps {
  id: string;
  name: string;
  durationMinutes: number;
  price: number | string;
  currency: string;
  description?: string;
}

interface BookingFormProps {
  service: ServiceProps;
}

export function BookingForm({ service }: BookingFormProps) {
  const router = useRouter();

  // Multi-step progress state (1: Date, 2: Time slot, 3: Details & Confirmation)
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1);

  // Form states
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = React.useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState<string>("");

  // Loading & error states
  const [isFetchingSlots, setIsFetchingSlots] = React.useState<boolean>(false);
  const [slotsError, setSlotsError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Format date helper for API YYYY-MM-DD
  const formatDateToParam = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format ISO time to readable string
  const formatSlotDisplay = (isoStr: string): string => {
    const d = new Date(isoStr);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  };

  // Disabled date rules: only future dates, no Sundays (closed), max 60 days
  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Disable past dates
    if (date < today) return true;

    // Disable Sundays (closed)
    if (date.getDay() === 0) return true;

    // Limit to next 60 days
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    if (date > maxDate) return true;

    return false;
  };

  // Fetch slots whenever date changes
  const fetchSlotsForDate = React.useCallback(
    async (date: Date) => {
      setIsFetchingSlots(true);
      setSlotsError(null);
      setSelectedSlot(null);

      try {
        const dateStr = formatDateToParam(date);
        const res = await fetch(
          `/api/availability?serviceId=${encodeURIComponent(
            service.id
          )}&date=${encodeURIComponent(dateStr)}`
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to load available slots.");
        }

        const data = await res.json();
        const slots: string[] = Array.isArray(data) ? data : data.slots || [];
        setAvailableSlots(slots);
      } catch (err) {
        console.error("Availability error:", err);
        setSlotsError(
          err instanceof Error ? err.message : "Error loading slots."
        );
        setAvailableSlots([]);
      } finally {
        setIsFetchingSlots(false);
      }
    },
    [service.id]
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    fetchSlotsForDate(date);
    setCurrentStep(2);
  };

  const handleSlotSelect = (slotIso: string) => {
    setSelectedSlot(slotIso);
    setCurrentStep(3);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot) {
      toast.error("Please select an appointment time slot.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: service.id,
          scheduledAt: selectedSlot,
          notes: notes.trim() || undefined,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please log in to complete your booking.");
          router.push(`/login?callbackUrl=/book/${service.id}`);
          return;
        }

        const message =
          result.error ||
          (result.details
            ? Object.values(result.details).flat().join(", ")
            : "Failed to confirm booking.");
        throw new Error(message);
      }

      toast.success("Booking request received! A confirmation email has been sent.");
      router.push("/dashboard/bookings");
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "An unexpected error occurred.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Progress Steps Header */}
      <div className="grid grid-cols-3 gap-2 border-b border-border/70 pb-4">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={cn(
            "flex items-center gap-2 text-left text-xs sm:text-sm font-semibold transition-colors pb-1",
            currentStep === 1
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              currentStep === 1
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            1
          </span>
          <span className="hidden sm:inline">Choose Date</span>
          <span className="sm:hidden">Date</span>
        </button>

        <button
          type="button"
          disabled={!selectedDate}
          onClick={() => selectedDate && setCurrentStep(2)}
          className={cn(
            "flex items-center gap-2 text-left text-xs sm:text-sm font-semibold transition-colors pb-1 disabled:opacity-50 disabled:cursor-not-allowed",
            currentStep === 2
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              currentStep === 2
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            2
          </span>
          <span className="hidden sm:inline">Select Time</span>
          <span className="sm:hidden">Time</span>
        </button>

        <button
          type="button"
          disabled={!selectedSlot}
          onClick={() => selectedSlot && setCurrentStep(3)}
          className={cn(
            "flex items-center gap-2 text-left text-xs sm:text-sm font-semibold transition-colors pb-1 disabled:opacity-50 disabled:cursor-not-allowed",
            currentStep === 3
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              currentStep === 3
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            3
          </span>
          <span className="hidden sm:inline">Confirm Booking</span>
          <span className="sm:hidden">Confirm</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Steps Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: DATE SELECTION */}
          {currentStep === 1 && (
            <Card className="shadow-sm border-border/70">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <span>Step 1: Select Appointment Date</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Choose a weekday within the next 60 days. Open slots will load automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={isDateDisabled}
                  className="rounded-lg border border-border/60 p-4 shadow-sm"
                />
              </CardContent>
              {selectedDate && (
                <CardFooter className="pt-2 border-t border-border/50 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Selected:{" "}
                    <strong className="text-foreground">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </strong>
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    className="gap-1.5"
                  >
                    <span>View Slots</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}

          {/* STEP 2: TIME SLOT SELECTION */}
          {currentStep === 2 && (
            <Card className="shadow-sm border-border/70">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Step 2: Choose Time Slot</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Change Date</span>
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Available appointment times for{" "}
                  <strong>
                    {selectedDate?.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </strong>{" "}
                  in {TIMEZONE}.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pb-6">
                {isFetchingSlots ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">
                      Checking live slot availability...
                    </p>
                  </div>
                ) : slotsError ? (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Unable to load slots</p>
                      <p className="mt-0.5">{slotsError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectedDate && fetchSlotsForDate(selectedDate)}
                        className="mt-2 text-xs h-7"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-12 space-y-3 rounded-lg border border-dashed border-border p-6">
                    <CalendarCheck className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="font-medium text-sm text-foreground">
                      No open slots on this date
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      All available appointment times for this day have already been booked. Please pick another day.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                      className="mt-2"
                    >
                      Pick Another Date
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {availableSlots.map((slotIso) => {
                      const isSelected = selectedSlot === slotIso;
                      const timeLabel = formatSlotDisplay(slotIso);

                      return (
                        <button
                          key={slotIso}
                          type="button"
                          onClick={() => handleSlotSelect(slotIso)}
                          className={cn(
                            "flex flex-col items-center justify-center py-3 px-2 rounded-lg border text-sm font-semibold transition-all",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-sm scale-102 ring-2 ring-primary/20"
                              : "border-border/80 bg-background hover:border-primary/50 hover:bg-primary/5 text-foreground"
                          )}
                        >
                          <span>{timeLabel}</span>
                          <span
                            className={cn(
                              "text-[10px] font-normal mt-0.5",
                              isSelected
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            )}
                          >
                            {service.durationMinutes} mins
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>

              {selectedSlot && (
                <CardFooter className="pt-2 border-t border-border/50 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Selected time:{" "}
                    <strong className="text-foreground">
                      {formatSlotDisplay(selectedSlot)}
                    </strong>
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                    className="gap-1.5"
                  >
                    <span>Proceed to Confirm</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}

          {/* STEP 3: NOTES & SUBMISSION */}
          {currentStep === 3 && (
            <Card className="shadow-sm border-border/70">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Step 3: Review & Finalize Booking</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Change Slot</span>
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Review your appointment details, provide any special instructions, and confirm your booking.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleFormSubmit}>
                <CardContent className="space-y-5 pb-6">
                  {submitError && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Unable to submit booking</p>
                        <p className="mt-0.5">{submitError}</p>
                      </div>
                    </div>
                  )}

                  {/* Summary of Chosen Date/Time */}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Appointment Summary
                    </div>
                    <div className="text-base font-bold text-foreground">
                      {service.name}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          {selectedDate?.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          {selectedSlot ? formatSlotDisplay(selectedSlot) : "—"} (
                          {formatDuration(service.durationMinutes)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Optional Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="booking-notes" className="text-sm font-medium">
                      Special Requests or Notes{" "}
                      <span className="text-muted-foreground text-xs">(optional)</span>
                    </Label>
                    <Textarea
                      id="booking-notes"
                      placeholder="Add any information or questions you would like your specialist to know beforehand..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      maxLength={500}
                      rows={3}
                      className="resize-none text-sm"
                      disabled={isSubmitting}
                    />
                    <div className="text-right text-[11px] text-muted-foreground">
                      {notes.length}/500
                    </div>
                  </div>

                  {/* Cancellation Policy Reminder */}
                  <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground flex items-start gap-2 border border-border/50">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <span>
                      Free cancellation or rescheduling is available up to 24 hours prior to appointment time. A confirmation email will be sent immediately upon submission.
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-border/50 flex justify-between items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCurrentStep(2)}
                    disabled={isSubmitting}
                    className="text-xs"
                  >
                    Back to Times
                  </Button>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !selectedSlot}
                    className="gap-2 font-semibold shadow-md shadow-primary/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Confirming Booking...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Booking</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>

        {/* Sidebar Summary Card (1 col) */}
        <div className="space-y-4">
          <Card className="shadow-sm border-border/70 sticky top-20">
            <CardHeader className="pb-3 border-b border-border/50">
              <Badge variant="secondary" className="w-fit mb-1 text-[11px]">
                Service Details
              </Badge>
              <CardTitle className="text-base font-bold text-foreground">
                {service.name}
              </CardTitle>
              {service.description && (
                <CardDescription className="text-xs line-clamp-3">
                  {service.description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-3 pt-4 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Duration
                </span>
                <span className="font-semibold text-foreground">
                  {formatDuration(service.durationMinutes)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-primary" />
                  Price
                </span>
                <span className="font-bold text-foreground text-sm">
                  {formatCurrency(service.price, service.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                  Timezone
                </span>
                <span className="font-mono text-muted-foreground text-[11px]">
                  {TIMEZONE}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
