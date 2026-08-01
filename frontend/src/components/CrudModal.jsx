import React, { useState } from "react";

const GRAY_BORDER = "#E4E7EB";
const ORANGE = "#F5821F";
const DARK = "#22262B";

// fields: [{ key, label, type: 'text'|'number'|'date'|'select', options? }]
// Un seul composant pour tous les formulaires de création/édition —
// chaque module ne fournit que sa liste de champs.
export function CrudModal({ title, fields, initialValues, onSubmit, onClose, saving }) {
  const [values, setValues] = useState(initialValues || {});

  const handleChange = (key, val) => setValues((v) => ({ ...v, [key]: val }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,22,26,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#fff", borderRadius: 8, width: 480, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY_BORDER}`, fontWeight: 700, color: DARK }}>{title}</div>
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          {fields.map((f) => (
            <label key={f.key} style={{ fontSize: 12.5, color: DARK }}>
              {f.label}
              {f.type === "select" ? (
                <select
                  value={values[f.key] ?? ""}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  style={inputStyle}
                >
                  <option value="">--</option>
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={f.type || "text"}
                  value={values[f.key] ?? ""}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  style={inputStyle}
                />
              )}
            </label>
          ))}
        </div>
        <div style={{ padding: 14, borderTop: `1px solid ${GRAY_BORDER}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "8px 14px", borderRadius: 4, border: `1px solid ${GRAY_BORDER}`, background: "#fff" }}>Annuler</button>
          <button
            onClick={() => onSubmit(values)}
            disabled={saving}
            style={{ padding: "8px 14px", borderRadius: 4, border: "none", background: ORANGE, color: "#fff", fontWeight: 700 }}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  display: "block", width: "100%", marginTop: 4, padding: "7px 8px",
  border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box",
};
