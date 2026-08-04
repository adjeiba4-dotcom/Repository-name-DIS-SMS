// components/export/ExportButtons.jsx

import { FileDown, FileSpreadsheet, Printer } from "lucide-react";

import Button from "../ui/Button";
import { cn } from "../../utils/cn";

/**
 * Reusable export action group: Excel, PDF, and Print.
 */
export default function ExportButtons({
  onExportExcel,
  onExportPdf,
  onPrint,
  disabled = false,
  showExcel = true,
  showPdf = true,
  showPrint = true,
  excelLabel = "Excel",
  pdfLabel = "PDF",
  printLabel = "Print",
  size = "sm",
  className = "",
}) {
  const buttonClassName = "w-auto";

  return (
    <div
      className={cn("flex flex-wrap gap-[var(--space-2)]", className)}
      role="group"
      aria-label="Export actions"
    >
      {showExcel && onExportExcel ? (
        <Button
          type="button"
          variant="outline"
          size={size}
          className={buttonClassName}
          onClick={onExportExcel}
          disabled={disabled}
          title="Export to Excel"
        >
          <FileSpreadsheet size={16} aria-hidden />
          {excelLabel}
        </Button>
      ) : null}

      {showPdf && onExportPdf ? (
        <Button
          type="button"
          variant="outline"
          size={size}
          className={buttonClassName}
          onClick={onExportPdf}
          disabled={disabled}
          title="Export to PDF"
        >
          <FileDown size={16} aria-hidden />
          {pdfLabel}
        </Button>
      ) : null}

      {showPrint && onPrint ? (
        <Button
          type="button"
          variant="outline"
          size={size}
          className={buttonClassName}
          onClick={onPrint}
          disabled={disabled}
          title="Print"
        >
          <Printer size={16} aria-hidden />
          {printLabel}
        </Button>
      ) : null}
    </div>
  );
}
