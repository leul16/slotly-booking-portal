import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  XCircle,
  CheckCheck,
  HelpCircle,
} from "lucide-react";

export type BookingStatusType =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | string;

interface BookingStatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: BookingStatusType;
  showIcon?: boolean;
}

export function BookingStatusBadge({
  status,
  showIcon = true,
  className,
  ...props
}: BookingStatusBadgeProps) {
  const normalizedStatus = status?.toUpperCase() || "PENDING";

  switch (normalizedStatus) {
    case "PENDING":
      return (
        <Badge
          variant="warning"
          className={cn("gap-1 font-medium capitalize", className)}
          {...props}
        >
          {showIcon && <Clock className="h-3 w-3" />}
          <span>Pending</span>
        </Badge>
      );
    case "CONFIRMED":
      return (
        <Badge
          variant="success"
          className={cn("gap-1 font-medium capitalize", className)}
          {...props}
        >
          {showIcon && <CheckCircle2 className="h-3 w-3" />}
          <span>Confirmed</span>
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge
          variant="destructive"
          className={cn("gap-1 font-medium capitalize", className)}
          {...props}
        >
          {showIcon && <XCircle className="h-3 w-3" />}
          <span>Cancelled</span>
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge
          className={cn(
            "gap-1 font-medium capitalize border-blue-500/20 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 hover:bg-blue-100",
            className
          )}
          {...props}
        >
          {showIcon && <CheckCheck className="h-3 w-3" />}
          <span>Completed</span>
        </Badge>
      );
    default:
      return (
        <Badge
          variant="secondary"
          className={cn("gap-1 font-medium", className)}
          {...props}
        >
          {showIcon && <HelpCircle className="h-3 w-3" />}
          <span>{status}</span>
        </Badge>
      );
  }
}
