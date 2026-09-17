import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Download } from "lucide-react";

interface Transaction {
  id: string;
  name: string;
  nim: string;
  bill: number;
  amount_paid: number;
  paid_at: string | null;
  due_date: string;
  status: "unpaid" | "pending" | "paid";
  receipt: string;
  paidFor?: number; // Added the paidFor property
}

interface ViewReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export function ViewReceiptDialog({ 
  open, 
  onOpenChange, 
  transaction 
}: ViewReceiptDialogProps) {
  const [loading, setLoading] = useState(true);
  const [fileType, setFileType] = useState<"pdf" | "image" | "other" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && transaction) {
      setLoading(true);
      setError(null);
      
      // Only attempt to load if there's a receipt
      if (transaction.receipt) {
        // Detect the receipt type based on URL or extension
        detectFileType(transaction.receipt);
        
        // Try to preload the image if it's an image type
        if (fileType === "image") {
          const img = new Image();
          img.onload = () => setLoading(false);
          img.onerror = () => {
            setError("Gambar tidak dapat dimuat");
            setLoading(false);
          };
          img.src = transaction.receipt;
        } else {
          // For PDFs and other types, we'll just set loading to false after a delay
          setTimeout(() => setLoading(false), 500);
        }
      } else {
        setError("Bukti pembayaran tidak tersedia");
        setLoading(false);
      }
    }
  }, [open, transaction, fileType]);

  const detectFileType = (url: string) => {
    const lowerUrl = url.toLowerCase();
    
    // Check if it's a PDF
    if (
      lowerUrl.endsWith('.pdf') || 
      lowerUrl.includes('/pdf/') || 
      lowerUrl.includes('application/pdf') ||
      lowerUrl.includes('/raw/upload/') // Cloudinary raw uploads are typically PDFs
    ) {
      setFileType("pdf");
      return;
    }
    
    // Check if it's an image
    if (
      lowerUrl.endsWith('.jpg') || 
      lowerUrl.endsWith('.jpeg') || 
      lowerUrl.endsWith('.png') || 
      lowerUrl.endsWith('.gif') || 
      lowerUrl.endsWith('.webp') || 
      lowerUrl.includes('/image/') ||
      lowerUrl.includes('data:image/') ||
      lowerUrl.includes('/upload/') // Most Cloudinary uploads without /raw/ are images
    ) {
      setFileType("image");
      return;
    }
    
    // Default to other
    setFileType("other");
  };

  const openInNewTab = () => {
    if (!transaction?.receipt) return;
    window.open(transaction.receipt, '_blank');
  };

  const downloadFile = () => {
    if (!transaction?.receipt) return;
    
    const link = document.createElement('a');
    link.href = transaction.receipt;
    link.download = `bukti_pembayaran_${transaction.nim || 'mahasiswa'}.${fileType === 'pdf' ? 'pdf' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-dark">
            Bukti Pembayaran
          </DialogTitle>
          <DialogDescription>
            Bukti pembayaran untuk mahasiswa {transaction.name} ({transaction.nim})
            {transaction.paidFor && (
              <span className="ml-1">untuk {transaction.paidFor} bulan</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto min-h-[300px] border rounded-md">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-700 animate-spin mb-2" />
              <p>Memuat bukti pembayaran...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <p>{error}</p>
            </div>
          ) : fileType === "pdf" ? (
            <iframe 
              src={`${transaction.receipt}#toolbar=0&navpanes=0&scrollbar=0`} 
              className="w-full h-[60vh] border-none"
              title={`Bukti pembayaran ${transaction.name}`}
              onError={() => setError("Tidak dapat menampilkan dokumen PDF")}
            />
          ) : fileType === "image" ? (
            <div className="flex items-center justify-center p-4 h-[60vh]">
              <img
                src={transaction.receipt}
                alt={`Bukti pembayaran ${transaction.name}`}
                className="max-w-full max-h-full object-contain"
                onError={() => setError("Tidak dapat menampilkan gambar")}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <FileText className="h-16 w-16 text-blue-700 mb-4" />
              <p className="text-center">
                File tidak dapat ditampilkan di browser.<br />
                Silahkan buka di tab baru.
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={openInNewTab}>
                  Buka di Tab Baru
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={downloadFile}
            className="flex gap-2 items-center"
          >
            <Download className="h-4 w-4" />
            Unduh
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}