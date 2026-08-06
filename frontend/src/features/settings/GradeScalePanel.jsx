import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Plus, Star } from "lucide-react";

import { Panel } from "../../components/dashboard";
import {
  FormGridFull,
  FormSection,
  SelectField,
  SubmitButton,
  TextField,
} from "../../components/form";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import { Body, Caption } from "../../components/ui/Typography";
import {
  createGrade,
  createGradeScale,
  deactivateGrade,
  getGradeScales,
  setDefaultGradeScale,
  updateGrade,
} from "../../services/settings/grade.service";
import { getApiErrorMessage } from "./settings.mappers";

const emptyBand = {
  grade: "",
  minimumScore: "",
  maximumScore: "",
  gradePoint: "",
  remarks: "",
  isPass: true,
  sortOrder: "0",
};

/**
 * Admin UI for grade scales and score bands used by the Results Engine.
 */
export default function GradeScalePanel() {
  const queryClient = useQueryClient();
  const [selectedScaleId, setSelectedScaleId] = useState("");
  const [scaleForm, setScaleForm] = useState({
    name: "",
    description: "",
    isDefault: false,
  });
  const [bandForm, setBandForm] = useState(emptyBand);
  const [editingBandId, setEditingBandId] = useState(null);
  const [savingScale, setSavingScale] = useState(false);
  const [savingBand, setSavingBand] = useState(false);
  const [error, setError] = useState("");

  const scalesQuery = useQuery({
    queryKey: ["grades", "scales"],
    queryFn: async () => {
      const response = await getGradeScales();
      return response?.data ?? [];
    },
  });

  const scales = scalesQuery.data || [];
  const selectedScale = useMemo(
    () =>
      scales.find((scale) => String(scale.id) === String(selectedScaleId)) ||
      scales.find((scale) => scale.isDefault) ||
      scales[0] ||
      null,
    [scales, selectedScaleId]
  );

  useEffect(() => {
    if (!selectedScaleId && selectedScale) {
      setSelectedScaleId(String(selectedScale.id));
    }
  }, [selectedScale, selectedScaleId]);

  const bands = selectedScale?.grades || [];

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["grades"] });
    queryClient.invalidateQueries({ queryKey: ["results", "weightings"] });
  };

  const handleCreateScale = async (event) => {
    event.preventDefault();
    if (!scaleForm.name.trim()) {
      setError("Grade scale name is required.");
      return;
    }
    setSavingScale(true);
    setError("");
    try {
      const response = await createGradeScale({
        name: scaleForm.name.trim(),
        description: scaleForm.description.trim() || null,
        isDefault: Boolean(scaleForm.isDefault),
      });
      toastSuccess(response?.message || "Grade scale created.");
      setScaleForm({ name: "", description: "", isDefault: false });
      refresh();
      if (response?.data?.id) setSelectedScaleId(String(response.data.id));
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to create grade scale.");
      setError(message);
      toastError(message);
    } finally {
      setSavingScale(false);
    }
  };

  const handleSetDefault = async () => {
    if (!selectedScale) return;
    try {
      const response = await setDefaultGradeScale(selectedScale.id);
      toastSuccess(response?.message || "Default grade scale updated.");
      refresh();
    } catch (err) {
      toastError(getApiErrorMessage(err, "Unable to set default scale."));
    }
  };

  const startEditBand = (band) => {
    setEditingBandId(band.id);
    setBandForm({
      grade: band.grade || "",
      minimumScore: String(band.minimumScore ?? ""),
      maximumScore: String(band.maximumScore ?? ""),
      gradePoint: band.gradePoint != null ? String(band.gradePoint) : "",
      remarks: band.remarks || "",
      isPass: Boolean(band.isPass),
      sortOrder: String(band.sortOrder ?? 0),
    });
  };

  const resetBandForm = () => {
    setEditingBandId(null);
    setBandForm(emptyBand);
  };

  const handleSaveBand = async (event) => {
    event.preventDefault();
    if (!selectedScale) {
      setError("Select or create a grade scale first.");
      return;
    }
    if (!bandForm.grade.trim()) {
      setError("Grade letter is required.");
      return;
    }
    setSavingBand(true);
    setError("");
    const payload = {
      gradeScaleId: selectedScale.id,
      grade: bandForm.grade.trim().toUpperCase(),
      minimumScore: Number(bandForm.minimumScore),
      maximumScore: Number(bandForm.maximumScore),
      gradePoint:
        bandForm.gradePoint === "" ? null : Number(bandForm.gradePoint),
      remarks: bandForm.remarks.trim() || null,
      isPass: Boolean(bandForm.isPass),
      sortOrder: Number(bandForm.sortOrder) || 0,
      status: "ACTIVE",
    };
    try {
      const response = editingBandId
        ? await updateGrade(editingBandId, payload)
        : await createGrade(payload);
      toastSuccess(
        response?.message ||
          (editingBandId ? "Grade band updated." : "Grade band created.")
      );
      resetBandForm();
      refresh();
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to save grade band.");
      setError(message);
      toastError(message);
    } finally {
      setSavingBand(false);
    }
  };

  const handleDeactivateBand = async (band) => {
    try {
      const response = await deactivateGrade(band.id);
      toastSuccess(response?.message || "Grade band deactivated.");
      if (editingBandId === band.id) resetBandForm();
      refresh();
    } catch (err) {
      toastError(getApiErrorMessage(err, "Unable to deactivate grade band."));
    }
  };

  if (scalesQuery.isLoading) {
    return (
      <Panel className="p-[var(--space-6)]">
        <Caption variant="muted">Loading grade scales…</Caption>
      </Panel>
    );
  }

  return (
    <div className="space-y-[var(--space-6)]">
      {error ? (
        <Alert variant="error" message={error} className="ds-radius-none mb-0" />
      ) : null}

      <Panel
        title="Active grading scale"
        description="Results Engine uses the default scale’s bands for grade letters, remarks, and pass flags. Schools can adapt bands without code changes."
        actions={
          selectedScale && !selectedScale.isDefault ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-auto"
              onClick={handleSetDefault}
            >
              <Star size={14} aria-hidden />
              Set as default
            </Button>
          ) : null
        }
      >
        <div className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2">
          <SelectField
            label="Grade scale"
            name="gradeScaleId"
            value={selectedScaleId}
            onChange={(event) => setSelectedScaleId(event.target.value)}
            options={scales.map((scale) => ({
              value: String(scale.id),
              label: `${scale.name}${scale.isDefault ? " (default)" : ""}`,
            }))}
          />
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-[var(--space-3)]">
            <Caption variant="muted" size="sm" className="m-0">
              Selected scale
            </Caption>
            <Body
              size="md"
              className="m-0 mt-[var(--space-1)] font-[number:var(--font-weight-semibold)]"
            >
              {selectedScale?.name || "—"}
            </Body>
            <Caption variant="muted" className="m-0 mt-[var(--space-1)]">
              {selectedScale?.description || "No description"} ·{" "}
              {bands.length} band{bands.length === 1 ? "" : "s"}
            </Caption>
          </div>
        </div>
      </Panel>

      <Panel title="Create grade scale" description="Add an alternative banding scheme for your school.">
        <form className="space-y-[var(--space-4)]" onSubmit={handleCreateScale}>
          <FormSection title="Scale details">
            <FormGridFull>
              <TextField
                label="Name"
                value={scaleForm.name}
                onChange={(event) =>
                  setScaleForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
              <TextField
                label="Description"
                value={scaleForm.description}
                onChange={(event) =>
                  setScaleForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
              <Checkbox
                id="new-scale-default"
                label="Set as default scale for Results generation"
                checked={scaleForm.isDefault}
                onChange={(event) =>
                  setScaleForm((prev) => ({
                    ...prev,
                    isDefault: event.target.checked,
                  }))
                }
              />
            </FormGridFull>
          </FormSection>
          <div className="flex justify-end">
            <SubmitButton loading={savingScale}>
              <Plus size={14} aria-hidden />
              Create scale
            </SubmitButton>
          </div>
        </form>
      </Panel>

      <Panel
        title={editingBandId ? "Edit grade band" : "Add grade band"}
        description="Define letter, score range, remark, and whether the band counts as a pass."
      >
        <form className="space-y-[var(--space-4)]" onSubmit={handleSaveBand}>
          <FormSection title="Band">
            <FormGridFull>
              <TextField
                label="Grade letter"
                value={bandForm.grade}
                onChange={(event) =>
                  setBandForm((prev) => ({ ...prev, grade: event.target.value }))
                }
                required
              />
              <TextField
                label="Minimum score"
                type="number"
                value={bandForm.minimumScore}
                onChange={(event) =>
                  setBandForm((prev) => ({
                    ...prev,
                    minimumScore: event.target.value,
                  }))
                }
                required
              />
              <TextField
                label="Maximum score"
                type="number"
                value={bandForm.maximumScore}
                onChange={(event) =>
                  setBandForm((prev) => ({
                    ...prev,
                    maximumScore: event.target.value,
                  }))
                }
                required
              />
              <TextField
                label="Grade point"
                type="number"
                value={bandForm.gradePoint}
                onChange={(event) =>
                  setBandForm((prev) => ({
                    ...prev,
                    gradePoint: event.target.value,
                  }))
                }
              />
              <TextField
                label="Remark"
                value={bandForm.remarks}
                onChange={(event) =>
                  setBandForm((prev) => ({
                    ...prev,
                    remarks: event.target.value,
                  }))
                }
              />
              <TextField
                label="Sort order"
                type="number"
                value={bandForm.sortOrder}
                onChange={(event) =>
                  setBandForm((prev) => ({
                    ...prev,
                    sortOrder: event.target.value,
                  }))
                }
              />
              <Checkbox
                id="band-is-pass"
                label="Counts as pass"
                checked={bandForm.isPass}
                onChange={(event) =>
                  setBandForm((prev) => ({
                    ...prev,
                    isPass: event.target.checked,
                  }))
                }
              />
            </FormGridFull>
          </FormSection>
          <div className="flex justify-end gap-[var(--space-2)]">
            {editingBandId ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-auto"
                onClick={resetBandForm}
              >
                Cancel edit
              </Button>
            ) : null}
            <SubmitButton loading={savingBand}>
              {editingBandId ? "Update band" : "Add band"}
            </SubmitButton>
          </div>
        </form>
      </Panel>

      <Panel
        title="Configured bands"
        description="Active bands on the selected scale. Deactivate unused letters instead of deleting historical result links."
      >
        {!bands.length ? (
          <Caption variant="muted">No bands on this scale yet.</Caption>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[length:var(--font-size-sm)]">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                  <th className="px-[var(--space-2)] py-[var(--space-2)]">Grade</th>
                  <th className="px-[var(--space-2)] py-[var(--space-2)]">Range</th>
                  <th className="px-[var(--space-2)] py-[var(--space-2)]">GP</th>
                  <th className="px-[var(--space-2)] py-[var(--space-2)]">Remark</th>
                  <th className="px-[var(--space-2)] py-[var(--space-2)]">Pass</th>
                  <th className="px-[var(--space-2)] py-[var(--space-2)] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bands.map((band) => (
                  <tr
                    key={band.id}
                    className="border-b border-[var(--color-border-muted)]"
                  >
                    <td className="px-[var(--space-2)] py-[var(--space-2)] font-[number:var(--font-weight-semibold)]">
                      <span className="inline-flex items-center gap-[var(--space-1)]">
                        <Award size={14} aria-hidden />
                        {band.grade}
                      </span>
                    </td>
                    <td className="px-[var(--space-2)] py-[var(--space-2)]">
                      {band.minimumScore} – {band.maximumScore}
                    </td>
                    <td className="px-[var(--space-2)] py-[var(--space-2)]">
                      {band.gradePoint ?? "—"}
                    </td>
                    <td className="px-[var(--space-2)] py-[var(--space-2)]">
                      {band.remarks || "—"}
                    </td>
                    <td className="px-[var(--space-2)] py-[var(--space-2)]">
                      {band.isPass ? "Yes" : "No"}
                    </td>
                    <td className="px-[var(--space-2)] py-[var(--space-2)] text-right">
                      <div className="inline-flex gap-[var(--space-2)]">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="w-auto"
                          onClick={() => startEditBand(band)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          className="w-auto"
                          onClick={() => handleDeactivateBand(band)}
                        >
                          Deactivate
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
