import React from "react";

const ORANGE = "#F5821F";
const DARK = "#22262B";
const GRAY_BORDER = "#E4E7EB";
const GRAY_TEXT = "#6B7280";

// Composant générique : colonnes + lignes + callbacks d'action.
// Réutilisé tel quel par chaque page de module (Équipements, PDR,
// Fournisseurs, DA/CMD, Entrées/Sorties...).
export function DataTable({
  columns, rows, total, page, pageSize, onPageChange, search, onSearchChange,
  onEdit, onDelete, onDuplicate, loading, readOnly, deleteLabel = "Supprimer",
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 25)));

  return (
    <div style={{ background: "#fff", border: `1px solid ${GRAY_BORDER}`, borderRadius: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderBottom: `1px solid ${GRAY_BORDER}` }}>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher..."
          style={{ border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, padding: "6px 10px", fontSize: 13, width: 260 }}
        />
        <div style={{ fontSize: 12, color: GRAY_TEXT }}>{total ?? 0} résultat(s)</div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: DARK, color: "#fff" }}>
              {columns.map((c) => <th key={c.key} style={{ textAlign: "left", padding: "8px 10px" }}>{c.label}</th>)}
              {!readOnly && <th style={{ padding: "8px 10px" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={columns.length + (readOnly ? 0 : 1)} style={{ padding: 16, textAlign: "center", color: GRAY_TEXT }}>Chargement...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={columns.length + (readOnly ? 0 : 1)} style={{ padding: 16, textAlign: "center", color: GRAY_TEXT }}>Aucun résultat</td></tr>}
            {rows.map((row, i) => (
              <tr key={row.id ?? i} style={{ borderBottom: `1px solid ${GRAY_BORDER}`, background: i % 2 ? "#FAFBFC" : "#fff" }}>
                {columns.map((c) => <td key={c.key} style={{ padding: "8px 10px" }}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}
                {!readOnly && (
                  <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>
                    {onEdit && <button onClick={() => onEdit(row)} style={btnStyle}>Modifier</button>}
                    {onDuplicate && <button onClick={() => onDuplicate(row)} style={btnStyle}>Dupliquer</button>}
                    <button onClick={() => onDelete(row)} style={{ ...btnStyle, color: "#DC2626" }}>{deleteLabel}</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, padding: 10 }}>
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} style={btnStyle}>Précédent</button>
        <span style={{ fontSize: 12, color: GRAY_TEXT }}>Page {page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} style={btnStyle}>Suivant</button>
      </div>
    </div>
  );
}

const btnStyle = {
  border: `1px solid ${GRAY_BORDER}`, background: "#fff", borderRadius: 4, padding: "4px 8px",
  fontSize: 11.5, cursor: "pointer", marginRight: 6,
};
