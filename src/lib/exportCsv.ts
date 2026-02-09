/**
 * Generic CSV export utility.
 * @param data - Array of objects to export
 * @param columns - Column definitions: { key, label }
 * @param filename - Name of the downloaded file (without extension)
 */
export function exportToCsv(
  data: Record<string, any>[],
  columns: { key: string; label: string }[],
  filename: string
) {
  if (data.length === 0) return;

  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((c) => escape(c.label)).join(",");
  const rows = data.map((row) =>
    columns.map((c) => escape(row[c.key])).join(",")
  );

  const bom = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const csv = bom + [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
