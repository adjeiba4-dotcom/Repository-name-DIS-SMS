import { useEffect, useState } from "react";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import {
  getGuardianById,
  unlinkGuardianFromStudent,
} from "../../services/guardians/guardian.service";
import GuardianDetails from "./GuardianDetails";
import GuardianLinkStudentDialog from "./GuardianLinkStudentDialog";
import { getApiErrorMessage } from "./guardian.mappers";
import { toastError, toastSuccess } from "../../components/ui/Toast";

/**
 * Guardian profile drawer — loads detail and manages student relationships.
 */
export default function GuardianProfile({
  open,
  guardianId,
  onClose,
  onEdit,
  onChanged,
}) {
  const [guardian, setGuardian] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [unlinkLoadingId, setUnlinkLoadingId] = useState(null);

  const loadGuardian = async (id) => {
    setLoading(true);
    setError("");
    try {
      const response = await getGuardianById(id);
      setGuardian(response?.data ?? null);
    } catch (err) {
      setGuardian(null);
      setError(getApiErrorMessage(err, "Unable to load guardian profile."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !guardianId) {
      setGuardian(null);
      setError("");
      setLoading(false);
      setLinkOpen(false);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getGuardianById(guardianId);
        if (!cancelled) setGuardian(response?.data ?? null);
      } catch (err) {
        if (!cancelled) {
          setGuardian(null);
          setError(
            getApiErrorMessage(err, "Unable to load guardian profile.")
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, guardianId]);

  const handleUnlink = async (studentId, studentName) => {
    if (!guardian?.id) return;

    const confirmed = window.confirm(
      `Remove ${studentName || "this student"} from this guardian?`
    );
    if (!confirmed) return;

    setUnlinkLoadingId(studentId);
    try {
      const response = await unlinkGuardianFromStudent(studentId, guardian.id);
      toastSuccess(
        response?.message || "Guardian unlinked from student successfully."
      );
      await loadGuardian(guardian.id);
      onChanged?.();
    } catch (err) {
      toastError(
        getApiErrorMessage(err, "Unable to unlink student. Please try again.")
      );
    } finally {
      setUnlinkLoadingId(null);
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title="Guardian Profile"
        description="Read-only overview with linked students and audit history."
        size="xl"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-auto"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              disabled={!guardian || loading}
              onClick={() => onEdit?.(guardian)}
            >
              Edit
            </Button>
          </>
        }
      >
        {loading ? (
          <ProfileSkeleton />
        ) : error ? (
          <Alert variant="error" title="Profile unavailable" message={error} />
        ) : (
          <GuardianDetails
            guardian={guardian}
            onLinkStudent={() => setLinkOpen(true)}
            onUnlinkStudent={handleUnlink}
            unlinkLoadingId={unlinkLoadingId}
          />
        )}
      </Drawer>

      <GuardianLinkStudentDialog
        open={linkOpen}
        guardian={guardian}
        onClose={() => setLinkOpen(false)}
        onSuccess={async () => {
          setLinkOpen(false);
          if (guardian?.id) {
            await loadGuardian(guardian.id);
            onChanged?.();
          }
        }}
      />
    </>
  );
}
