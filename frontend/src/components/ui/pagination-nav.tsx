import React from "react";
import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem } from "./pagination";

interface PaginationNavProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export const PaginationNav: React.FC<PaginationNavProps> = ({
  page,
  total,
  limit,
  onPageChange,
}) => {
  const pageCount = Math.ceil(total / limit);
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </PaginationItem>
        {Array.from({ length: pageCount }, (_, i) => (
          <PaginationItem key={i}>
            <Button
              variant={page === i + 1 ? "outline" : "ghost"}
              size="icon"
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </Button>
          </PaginationItem>
        ))}
        <PaginationItem>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(Math.min(pageCount, page + 1))}
            disabled={page === pageCount}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
