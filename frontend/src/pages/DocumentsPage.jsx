import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

const ORANGE = "#F5821F";
const GRAY_BORDER = "#E4E7EB";

const ENTITY_TYPES = ["EQUIPEMENT", "ARTICLE_PDR", "INTERVENTION", "DEMANDE_ACHAT", "COMMANDE", "FOURNISSEUR"];
const TYPES_DOCUMENT = ["PDF", "IMAGE", "EXCEL", "WORD", "SCHEMA", "NOTICE", "RAPPORT", "PHOTO"];

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [entityType, setEntityType] = useState("EQUIPEMENT");
  const [entityId, setEntityId] = useState("");
  const [typeDocument, setTypeDocument] = useState("NOTICE");
  const [file, setFile] = useState(null);

  const idValide = entityId !== "" && !Number.isNaN(Number(entityId));

  const { data, isLoading } = useQuery({
    queryKey: ["documents", entityType, entityId],
    queryFn: async () => (await api.get("/documents", { params: { entityType, entityId } })).data,
    enabled: idValide,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["documents", entityType, entityId] });

  const upload = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append("file", file);
      form.append("entityType", entityType);
      form.append("entityId", entityId);
      form.append("typeDocument", typeDocument);
      return api.post("/documents/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => { setFile(null); invalidate(); },
  });

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/documents/${id}`),
    onSuccess: invalidate,
  });

  const apercu = async (doc) => {
    const res = await api.get(`/documents/${doc.id}/preview`, { responseType: "blob" });
    const url = window.URL.createObjectURL(res.data);
    window.open(url, "_blank");
  };

  return (
    <div>
      <h2 style={{ fontSize: 16, color: "#22262B", marginBottom: 12 }}>Documents (GED)</h2>

      <div style={{ background: "#fff", border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ fontSize: 12.5 }}>
            Type d'entité
            <select value={entityType} onChange={(e) => setEntityType(e.target.value)} style={inputStyle}>
              {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12.5 }}>
            ID de l'entité
            <input type="number" value={entityId} onChange={(e) => setEntityId(e.target.value)} style={inputStyle} placeholder="ex: 12" />
          </label>
        </div>
      </div>

      {!idValide && (
        <div style={{ fontSize: 13, color: "#6B7280" }}>Renseignez un type et un identifiant d'entité pour voir ses documents.</div>
      )}

      {idValide && (
        <>
          <div style={{ background: "#fff", border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>Ajouter un document</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <label style={{ fontSize: 12.5 }}>
                Type de document
                <select value={typeDocument} onChange={(e) => setTypeDocument(e.target.value)} style={inputStyle}>
                  {TYPES_DOCUMENT.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label style={{ fontSize: 12.5 }}>
                Fichier
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ display: "block", marginTop: 4 }} />
              </label>
              <button
                onClick={() => file && upload.mutate()}
                disabled={!file || upload.isPending}
                style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}
              >
                {upload.isPending ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </div>

          <div style={{ background: "#fff", border: `1px solid ${GRAY_BORDER}`, borderRadius: 6 }}>
            {isLoading && <div style={{ padding: 16, fontSize: 13, color: "#6B7280" }}>Chargement...</div>}
            {!isLoading && (data || []).length === 0 && <div style={{ padding: 16, fontSize: 13, color: "#6B7280" }}>Aucun document pour cette entité.</div>}
            {(data || []).map((doc) => (
              <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${GRAY_BORDER}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{doc.nomFichier}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>
                    {doc.typeDocument} — ajouté par {doc.uploadedBy?.fullName || "?"} le {new Date(doc.createdAt).toLocaleString("fr-FR")}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => apercu(doc)} style={btnStyle}>Aperçu</button>
                  <button onClick={() => { if (confirm(`Supprimer ${doc.nomFichier} ?`)) remove.mutate(doc.id); }} style={{ ...btnStyle, color: "#DC2626" }}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const inputStyle = {
  display: "block", width: "100%", marginTop: 4, padding: "7px 8px",
  border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box", minWidth: 180,
};

const btnStyle = {
  border: `1px solid ${GRAY_BORDER}`, background: "#fff", borderRadius: 4, padding: "4px 8px",
  fontSize: 11.5, cursor: "pointer",
};
