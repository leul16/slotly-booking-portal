"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function BookingsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "ALL";

  const [searchTerm, setSearchTerm] = React.useState(currentSearch);

  // Sync internal state if URL changes externally
  React.useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const updateFilters = (newSearch: string, newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSearch.trim()) {
      params.set("search", newSearch.trim());
    } else {
      params.delete("search");
    }

    if (newStatus && newStatus !== "ALL") {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }

    // Reset page to 1 whenever filters change
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(searchTerm, currentStatus);
  };

  const handleStatusChange = (status: string) => {
    updateFilters(searchTerm, status);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(currentSearch || (currentStatus && currentStatus !== "ALL"));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Bar Form */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex-1 max-w-md flex items-center gap-2"
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by customer name, email, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                updateFilters("", currentStatus);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>
        <Button type="submit" size="sm" variant="secondary" className="h-9 px-3">
          Search
        </Button>
      </form>

      {/* Status Filter Tabs / Chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Status:</span>
        </div>
        {STATUS_OPTIONS.map((option) => {
          const isActive = currentStatus === option.value;
          return (
            <Button
              key={option.value}
              size="sm"
              variant={isActive ? "default" : "outline"}
              className={`h-8 text-xs font-medium px-3 rounded-full ${
                !isActive ? "bg-background hover:bg-muted" : ""
              }`}
              onClick={() => handleStatusChange(option.value)}
            >
              {option.label}
            </Button>
          );
        })}

        {hasActiveFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearFilters}
            className="h-8 text-xs text-muted-foreground hover:text-foreground px-2 ml-1"
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
