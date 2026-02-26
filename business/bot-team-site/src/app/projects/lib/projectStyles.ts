export function statusBadge(status: string) {
  switch (status) {
    case "active":
      return { label: "ACTIVE", bg: "rgba(74, 222, 128, 0.15)", border: "rgba(74, 222, 128, 0.25)" };
    case "building":
      return { label: "BUILDING", bg: "rgba(116, 167, 255, 0.16)", border: "rgba(116, 167, 255, 0.28)" };
    case "paused":
      return { label: "PAUSED", bg: "rgba(251, 191, 36, 0.12)", border: "rgba(251, 191, 36, 0.22)" };
    case "archived":
      return { label: "ARCHIVED", bg: "rgba(148, 163, 184, 0.12)", border: "rgba(148, 163, 184, 0.22)" };
    default:
      return { label: status.toUpperCase(), bg: "rgba(148, 163, 184, 0.12)", border: "rgba(148, 163, 184, 0.22)" };
  }
}
