"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RotateCcw, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/redux/hooks";
import { reopenIssue } from "@/redux";
import { toast } from "sonner";

interface ReopenButtonProps {
  issueId: string;
  onSuccess?: () => void;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function ReopenButton({
  issueId,
  onSuccess,
  className,
  variant = "outline",
  size = "sm"
}: ReopenButtonProps) {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReopen = async () => {
    if (!comment.trim()) {
      toast.error("Please provide a reason for reopening this issue");
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(reopenIssue({
        issueId,
        comment: comment.trim()
      })).unwrap();

      toast.success("Issue reopened successfully");
      setIsOpen(false);
      setComment("");
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reopen issue';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reopen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reopen Issue</DialogTitle>
          <DialogDescription>
            This will change the issue status back to &quot;Assigned&quot; and delete all after images. 
            The engineer will need to start work again.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment">Reason for reopening *</Label>
            <Textarea
              id="comment"
              placeholder="Please explain why this issue needs to be reopened..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReopen}
            disabled={isLoading || !comment.trim()}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Reopen Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}