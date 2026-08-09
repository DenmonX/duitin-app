import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  open, 
  onOpenChange, 
  title, 
  description, 
  onConfirm, 
  confirmText = "Ya, Hapus", 
  cancelText = "Batal", 
  variant = "destructive"
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[85vw] sm:max-w-md rounded-3xl p-6 border-border/50 bg-background/95 backdrop-blur-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
        </DialogHeader>
        {description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>}
        <DialogFooter className="mt-6 flex flex-row gap-3 w-full">
          <Button variant="secondary" className="flex-1 rounded-xl h-11 font-semibold" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button variant={variant} className="flex-1 rounded-xl h-11 font-semibold" onClick={() => { onConfirm(); onOpenChange(false); }}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
