import Drawer from "../../components/ui/Drawer";
import { Body, Caption } from "../../components/ui/Typography";
import { StatusBadge } from "../../components/profile";

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-[var(--color-border)] py-2 last:border-0">
      <Caption variant="muted" className="m-0">
        {label}
      </Caption>
      <Body size="sm" className="m-0">
        {value ?? "—"}
      </Body>
    </div>
  );
}

export default function PromotionDetails({ open, promotion = null, onClose }) {
  if (!promotion) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Promotion Details"
      description={`${promotion.studentName} · ${promotion.admissionNo}`}
      size="md"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={promotion.decisionLabel} variant="info" />
          <StatusBadge
            status={promotion.workflowLabel}
            variant={
              promotion.workflowStatus === "EXECUTED" ? "success" : "neutral"
            }
          />
        </div>

        <div>
          <Row label="From class" value={promotion.fromClassLabel} />
          <Row label="To class" value={promotion.toClassLabel} />
          <Row label="From year" value={promotion.academicYearName} />
          <Row label="To year" value={promotion.toAcademicYearName} />
          <Row label="Term" value={promotion.termName} />
          <Row label="Average" value={promotion.averageScoreLabel} />
          <Row label="Grade" value={promotion.overallGrade} />
          <Row label="Position" value={promotion.classPosition} />
          <Row label="New enrollment" value={promotion.enrollmentNumber} />
          <Row label="Recommended by" value={promotion.recommendedByName} />
          <Row label="Approved by" value={promotion.approvedByName} />
          <Row label="Executed by" value={promotion.executedByName} />
        </div>

        {promotion.recommendationNotes ? (
          <div>
            <Caption variant="muted">Recommendation notes</Caption>
            <Body size="sm">{promotion.recommendationNotes}</Body>
          </div>
        ) : null}

        {promotion.remarks ? (
          <div>
            <Caption variant="muted">Remarks</Caption>
            <Body size="sm">{promotion.remarks}</Body>
          </div>
        ) : null}
      </div>
    </Drawer>
  );
}
