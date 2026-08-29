import { Badge } from "@/components/ui/badge";
import { REPORT_STATUS_LABEL, ReportStatus } from "@/types";

export function StatusBadge({ status }: { status: ReportStatus }) {
  const variant = status==="FOUND"?"default": status==="ACTIVE"?"secondary": "outline";
  return <Badge variant={variant as any}>{REPORT_STATUS_LABEL[status]}</Badge>;
}
