import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eraser, Save } from "lucide-react";

import { ExportButtons } from "../../components/export";
import { TextField } from "../../components/form";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { Skeleton } from "../../components/ui/Skeleton";
import { Body, Caption } from "../../components/ui/Typography";
import {
  bulkAssessmentScores,
  getAssessmentRoster,
} from "../../services/assessments/assessment.service";
import {
  exportScoresToExcel,
  exportScoresToPdf,
  printScores,
} from "./assessment.export";
import {
  formatAssessmentType,
  formatClassLabel,
  formatSubjectLabel,
  getApiErrorMessage,
  mapRosterStudentToRow,
} from "./assessment.mappers";

export default function AssessmentScores({
  open,
  assessmentId,
  onClose,
  onSaved,
}) {
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const rosterQuery = useQuery({
    queryKey: ["assessments", "roster", assessmentId],
    queryFn: async () => {
      const response = await getAssessmentRoster(assessmentId);
      return response?.data ?? null;
    },
    enabled: Boolean(open && assessmentId),
  });

  const assessment = rosterQuery.data?.assessment ?? null;
  const summary = rosterQuery.data?.summary ?? null;

  const rows = useMemo(() => {
    const students = rosterQuery.data?.students ?? [];
    return students.map((student) =>
      mapRosterStudentToRow(student, assessment || {})
    );
  }, [rosterQuery.data, assessment]);

  useEffect(() => {
    if (!open || !rows.length) return;
    const next = {};
    for (const row of rows) {
      next[row.studentId] = {
        marks: row.marks,
        remarks: row.remarks,
      };
    }
    setDrafts(next);
    setError("");
  }, [open, rows]);

  const loading = rosterQuery.isLoading || rosterQuery.isFetching;
  const loadError = rosterQuery.isError
    ? getApiErrorMessage(rosterQuery.error, "Unable to load score roster.")
    : "";

  const updateDraft = (studentId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { marks: "", remarks: "" }),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!assessmentId) return;
    setSaving(true);
    setError("");
    try {
      const entries = rows.map((row) => {
        const draft = drafts[row.studentId] || {};
        const marks =
          draft.marks === "" || draft.marks == null
            ? null
            : Number(draft.marks);
        return {
          studentId: Number(row.studentId),
          marks,
          remarks: draft.remarks?.trim() || null,
        };
      });

      const response = await bulkAssessmentScores(assessmentId, {
        action: "UPSERT",
        entries,
      });
      onSaved?.(response?.message || "Assessment scores saved.");
      await rosterQuery.refetch();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save assessment scores."));
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!assessmentId) return;
    setSaving(true);
    setError("");
    try {
      const response = await bulkAssessmentScores(assessmentId, {
        action: "CLEAR",
      });
      onSaved?.(response?.message || "Assessment scores cleared.");
      await rosterQuery.refetch();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to clear assessment scores."));
    } finally {
      setSaving(false);
    }
  };

  const exportRows = rows.map((row) => ({
    ...row,
    marks: drafts[row.studentId]?.marks ?? row.marks,
    remarks: drafts[row.studentId]?.remarks ?? row.remarks,
  }));

  return (
    <Drawer
      open={open}
      onClose={saving ? undefined : onClose}
      title="Student Scores"
      description={
        assessment
          ? `${formatClassLabel(assessment.schoolClass)} · ${formatSubjectLabel(assessment.subject)} · ${formatAssessmentType(assessment.assessmentType)} (Max ${assessment.maxMarks})`
          : "Enter marks for enrolled students."
      }
      size="xl"
      footer={
        <div className="flex flex-wrap justify-end gap-[var(--space-2)]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-auto"
            onClick={onClose}
            disabled={saving}
          >
            Close
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-auto"
            onClick={handleClear}
            loading={saving}
            disabled={loading || !rows.length}
          >
            <Eraser size={16} aria-hidden />
            Clear Scores
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="w-auto"
            onClick={handleSave}
            loading={saving}
            disabled={loading || !rows.length}
          >
            <Save size={16} aria-hidden />
            Save Scores
          </Button>
        </div>
      }
    >
      {open && loading ? (
        <div className="space-y-[var(--space-3)]">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-14 w-full rounded-[var(--radius-md)]"
            />
          ))}
        </div>
      ) : null}

      {open && !loading && loadError ? (
        <Alert variant="danger" title="Roster unavailable">
          {loadError}
        </Alert>
      ) : null}

      {open && !loading && !loadError ? (
        <div className="space-y-[var(--space-4)]">
          {error ? (
            <Alert variant="danger" title="Save failed">
              {error}
            </Alert>
          ) : null}

          {summary ? (
            <div className="grid grid-cols-2 gap-[var(--space-3)] md:grid-cols-4">
              {[
                ["Enrolled", summary.enrolled],
                ["Marked", summary.marked],
                ["Average", summary.averageMarks],
                ["Pass (≥40%)", summary.passCount],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border-muted)] p-[var(--space-3)]"
                >
                  <Caption variant="muted" size="sm" className="m-0">
                    {label}
                  </Caption>
                  <Body
                    size="lg"
                    className="m-0 font-[number:var(--font-weight-semibold)]"
                  >
                    {value}
                  </Body>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex justify-end">
            <ExportButtons
              onExportExcel={() =>
                exportScoresToExcel(
                  exportRows,
                  `assessment-${assessmentId}-scores.xlsx`
                )
              }
              onExportPdf={() =>
                exportScoresToPdf(
                  exportRows,
                  `assessment-${assessmentId}-scores.pdf`
                )
              }
              onPrint={() => printScores(exportRows)}
              disabled={!exportRows.length}
            />
          </div>

          {!rows.length ? (
            <Body variant="muted" size="sm" className="m-0">
              No enrolled students found for this class, year, and term.
            </Body>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border-muted)] text-left">
                    {["Student", "Marks", "Remarks"].map((heading) => (
                      <th
                        key={heading}
                        className="px-[var(--space-3)] py-[var(--space-2)]"
                      >
                        <Caption variant="muted" size="sm" className="m-0">
                          {heading}
                        </Caption>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.studentId}
                      className="border-b border-[var(--color-border-muted)] last:border-b-0"
                    >
                      <td className="px-[var(--space-3)] py-[var(--space-3)]">
                        <Body
                          size="sm"
                          className="m-0 font-[number:var(--font-weight-semibold)]"
                        >
                          {row.firstName} {row.lastName}
                        </Body>
                        <Caption variant="muted" size="sm" className="m-0">
                          {row.admissionNo}
                        </Caption>
                      </td>
                      <td className="px-[var(--space-3)] py-[var(--space-3)]">
                        <TextField
                          label=""
                          name={`marks-${row.studentId}`}
                          type="number"
                          min="0"
                          max={assessment?.maxMarks}
                          step="0.01"
                          value={drafts[row.studentId]?.marks ?? ""}
                          onChange={(event) =>
                            updateDraft(
                              row.studentId,
                              "marks",
                              event.target.value
                            )
                          }
                          disabled={saving}
                        />
                      </td>
                      <td className="px-[var(--space-3)] py-[var(--space-3)]">
                        <TextField
                          label=""
                          name={`remarks-${row.studentId}`}
                          value={drafts[row.studentId]?.remarks ?? ""}
                          onChange={(event) =>
                            updateDraft(
                              row.studentId,
                              "remarks",
                              event.target.value
                            )
                          }
                          disabled={saving}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </Drawer>
  );
}
