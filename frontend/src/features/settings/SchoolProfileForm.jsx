import { useEffect, useState } from "react";

import {
  FormSection,
  FormGridFull,
  SubmitButton,
  TextField,
  UploadField,
} from "../../components/form";
import Alert from "../../components/ui/Alert";
import { Panel } from "../../components/dashboard";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import {
  getSchoolSettings,
  updateSchoolSettings,
} from "../../services/settings/schoolSettings.service";
import { uploadFile } from "../../services/settings/upload.service";
import {
  buildSchoolPayload,
  getApiErrorMessage,
  mapSchoolToForm,
  validateSchoolForm,
} from "./settings.mappers";

const INITIAL = mapSchoolToForm();

export default function SchoolProfileForm() {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await getSchoolSettings();
        if (!active) return;
        setForm(mapSchoolToForm(response?.data || {}));
      } catch (error) {
        if (active) {
          setSubmitError(
            getApiErrorMessage(error, "Unable to load school settings.")
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await uploadFile(file, {
        category: "LOGO",
        entityType: "SchoolProfile",
      });
      updateField("logoUrl", response?.data?.url || "");
      toastSuccess(response?.message || "Logo uploaded.");
    } catch (error) {
      toastError(getApiErrorMessage(error, "Logo upload failed."));
    } finally {
      setUploading(false);
      if (event?.target) event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateSchoolForm(form);
    setErrors(nextErrors);
    setSubmitError("");
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const response = await updateSchoolSettings(buildSchoolPayload(form));
      setForm(mapSchoolToForm(response?.data || {}));
      toastSuccess(response?.message || "School settings saved.");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to save school settings."
      );
      setSubmitError(message);
      toastError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Panel className="p-[var(--space-6)]">
        <p className="text-[var(--color-text-muted)]">Loading school profile…</p>
      </Panel>
    );
  }

  return (
    <Panel className="p-[var(--space-6)]">
      <form className="space-y-[var(--space-6)]" onSubmit={handleSubmit}>
        {submitError && (
          <Alert
            variant="error"
            message={submitError}
            className="ds-radius-none mb-0"
          />
        )}

        <FormSection
          title="Institution identity"
          description="Official school name and branding used across the platform."
        >
          <TextField
            label="School name"
            value={form.schoolName}
            error={errors.schoolName}
            onChange={(e) => updateField("schoolName", e.target.value)}
            required
          />
          <TextField
            label="School code"
            value={form.schoolCode}
            onChange={(e) => updateField("schoolCode", e.target.value)}
          />
          <FormGridFull>
            <TextField
              label="Motto"
              value={form.motto}
              onChange={(e) => updateField("motto", e.target.value)}
            />
          </FormGridFull>
          <TextField
            label="Established year"
            value={form.establishedYear}
            error={errors.establishedYear}
            onChange={(e) => updateField("establishedYear", e.target.value)}
          />
          <TextField
            label="Website"
            value={form.website}
            onChange={(e) => updateField("website", e.target.value)}
          />
        </FormSection>

        <FormSection
          title="Contact & location"
          description="Address and contact details for correspondence."
        >
          <FormGridFull>
            <TextField
              label="Address"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </FormGridFull>
          <TextField
            label="City"
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
          />
          <TextField
            label="Region"
            value={form.region}
            onChange={(e) => updateField("region", e.target.value)}
          />
          <TextField
            label="Country"
            value={form.country}
            onChange={(e) => updateField("country", e.target.value)}
          />
          <TextField
            label="Postal code"
            value={form.postalCode}
            onChange={(e) => updateField("postalCode", e.target.value)}
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
          <TextField
            label="Email"
            value={form.email}
            error={errors.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </FormSection>

        <FormSection
          title="Branding assets"
          description="Upload a school logo for reports and the application shell."
        >
          <FormGridFull>
            <UploadField
              label="School logo"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              valueName={form.logoUrl ? "Logo selected" : ""}
              previewSrc={form.logoUrl || ""}
              previewName="School logo"
              helperText={uploading ? "Uploading…" : "PNG, JPG, WEBP or SVG"}
              onChange={handleLogoUpload}
              onClear={() => updateField("logoUrl", "")}
              disabled={uploading}
            />
          </FormGridFull>
          <FormGridFull>
            <TextField
              label="Accreditation info"
              value={form.accreditationInfo}
              onChange={(e) => updateField("accreditationInfo", e.target.value)}
            />
          </FormGridFull>
        </FormSection>

        <div className="flex justify-end">
          <SubmitButton loading={saving} className="w-auto min-w-[10rem]">
            Save school settings
          </SubmitButton>
        </div>
      </form>
    </Panel>
  );
}
