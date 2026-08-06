import { useEffect, useMemo, useState } from "react";

import {
  FormSection,
  SubmitButton,
  TextField,
  FormGridFull,
} from "../../components/form";
import Alert from "../../components/ui/Alert";
import { Panel } from "../../components/dashboard";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import {
  getSettings,
  upsertSettings,
} from "../../services/settings/settings.service";
import {
  CONFIG_FIELD_META,
  getApiErrorMessage,
} from "./settings.mappers";

export default function GlobalConfigForm() {
  const [settings, setSettings] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await getSettings();
        const rows = response?.data || [];
        if (!active) return;
        setSettings(rows);
        setValues(
          rows.reduce((acc, row) => {
            acc[row.settingKey] = row.settingValue ?? "";
            return acc;
          }, {})
        );
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err, "Unable to load configuration."));
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const groups = {};
    for (const row of settings) {
      const meta = CONFIG_FIELD_META[row.settingKey] || {
        label: row.settingKey,
        group: row.category || "General",
      };
      if (!groups[meta.group]) groups[meta.group] = [];
      groups[meta.group].push({ ...row, label: meta.label });
    }
    return groups;
  }, [settings]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const caWeight = Number(values["academic.ca_weight"]);
    const examWeight = Number(values["academic.exam_weight"]);
    if (
      values["academic.ca_weight"] != null &&
      values["academic.exam_weight"] != null &&
      !Number.isNaN(caWeight) &&
      !Number.isNaN(examWeight)
    ) {
      const total = Math.round((caWeight + examWeight) * 100) / 100;
      if (total !== 100) {
        const message =
          "CA weight and Exam weight must add up to 100% for the Results Engine.";
        setError(message);
        toastError(message);
        setSaving(false);
        return;
      }
    }

    const passMark = Number(values["academic.pass_mark"]);
    if (
      values["academic.pass_mark"] != null &&
      values["academic.pass_mark"] !== "" &&
      (Number.isNaN(passMark) || passMark < 0 || passMark > 100)
    ) {
      const message = "Pass mark must be a number between 0 and 100.";
      setError(message);
      toastError(message);
      setSaving(false);
      return;
    }

    try {
      const payload = settings.map((row) => ({
        settingKey: row.settingKey,
        settingValue: values[row.settingKey] ?? row.settingValue,
        description: row.description,
        category: row.category,
        dataType: row.dataType,
        isSystem: row.isSystem,
      }));
      const response = await upsertSettings(payload);
      setSettings(response?.data || payload);
      toastSuccess(response?.message || "Configuration saved.");
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to save configuration.");
      setError(message);
      toastError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Panel className="p-[var(--space-6)]">
        <p className="text-[var(--color-text-muted)]">Loading configuration…</p>
      </Panel>
    );
  }

  return (
    <Panel className="p-[var(--space-6)]">
      <form className="space-y-[var(--space-6)]" onSubmit={handleSubmit}>
        {error && (
          <Alert variant="error" message={error} className="ds-radius-none mb-0" />
        )}

        {Object.entries(grouped).map(([group, rows]) => (
          <FormSection
            key={group}
            title={group}
            description={`Platform ${group.toLowerCase()} defaults used across modules.`}
          >
            {rows.map((row) => (
              <TextField
                key={row.settingKey}
                label={row.label}
                value={values[row.settingKey] ?? ""}
                helperText={row.description || row.settingKey}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [row.settingKey]: e.target.value,
                  }))
                }
              />
            ))}
            {rows.length % 2 === 1 ? <FormGridFull /> : null}
          </FormSection>
        ))}

        <div className="flex justify-end">
          <SubmitButton loading={saving} className="w-auto min-w-[10rem]">
            Save configuration
          </SubmitButton>
        </div>
      </form>
    </Panel>
  );
}
