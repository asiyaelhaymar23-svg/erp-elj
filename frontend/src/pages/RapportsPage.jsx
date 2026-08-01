import React, { useState } from "react";
import { api } from "../lib/api";

const ORANGE = "#F5821F";
const GRAY_BORDER = "#E4E7EB";

export default function RapportsPage() {
  const [downloading, setDownloading] = useState(null); // null | "xlsx" | "pdf"

  const download = async (format) => {
    setDownloading(format);
    try {
      const res = await api.get(`/rapports/synthese.${format}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport-synthese-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 16, color: "#22262B", marginBottom: 12 }}>Rapports</h2>
      <div style={{ background: "#fff", border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, padding: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Rapport de synthèse</div>
        <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>
          PDR par statut, dépenses par secteur, sorties en cours, demandes d'achat par statut — recalculé à
          chaque téléchargement à partir des données actuelles.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => download("xlsx")}
            disabled={Boolean(downloading)}
            style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}
          >
            {downloading === "xlsx" ? "Génération..." : "Télécharger en Excel"}
          </button>
          <button
            onClick={() => download("pdf")}
            disabled={Boolean(downloading)}
            style={{ background: "#fff", color: "#22262B", border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}
          >
            {downloading === "pdf" ? "Génération..." : "Télécharger en PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
