import React, { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

const GRAY_BORDER = "#E4E7EB";
const GREEN = "#16A34A";
const RED = "#DC2626";

// Bouton d'import Excel générique : un seul composant pour tous les
// modules qui exposent un endpoint POST /<resource>/import. Le résultat
// ({ created, updated?, errors }) est affiché tel quel, quel que soit le
// module — pas besoin d'adapter ce composant à chaque nouveau import.
export function ImportButton({ resource, invalidateKey, label = "Importer Excel" }) {
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const [resultat, setResultat] = useState(null);

  const importer = useMutation({
    mutationFn: async (file) => {
      const form = new FormData();
      form.append("file", file);
      return api.post(`/${resource}/import`, form, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: (res) => {
      setResultat(res.data);
      queryClient.invalidateQueries({ queryKey: [invalidateKey] });
    },
  });

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) importer.mutate(file);
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleChange}
        style={{ display: "none" }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={importer.isPending}
        style={{ background: "#fff", color: "#22262B", border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}
      >
        {importer.isPending ? "Import en cours..." : label}
      </button>

      {resultat && (
        <span style={{ fontSize: 12, color: resultat.errors?.length ? RED : GREEN }}>
          {resultat.created ?? 0} créé(s)
          {typeof resultat.updated === "number" ? `, ${resultat.updated} mis à jour` : ""}
          {resultat.errors?.length ? `, ${resultat.errors.length} ligne(s) en erreur` : ""}
        </span>
      )}

      {resultat?.errors?.length > 0 && (
        <details style={{ fontSize: 11, color: RED, width: "100%" }}>
          <summary style={{ cursor: "pointer" }}>Voir le détail des erreurs</summary>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {resultat.errors.map((e, i) => (
              <li key={i}>Ligne {e.row} : {e.error}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
