import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

const ORANGE = "#F5821F";
const GRAY_BORDER = "#E4E7EB";

const TYPES = ["FAMILLE", "SOUS_FAMILLE", "SECTEUR", "MARQUE", "CONSTRUCTEUR", "MAGASIN", "TYPE_MRP", "UNITE", "CENTRE_COUT", "SERVICE", "CATEGORIE", "STATUT"];

export default function ParametresPage() {
  const [type, setType] = useState("SECTEUR");
  const [newValue, setNewValue] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["parametres", type],
    queryFn: async () => (await api.get("/parametres", { params: { type } })).data,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["parametres", type] });
  const create = useMutation({ mutationFn: () => api.post("/parametres", { type, valeur: newValue }), onSuccess: () => { setNewValue(""); invalidate(); } });
  const deactivate = useMutation({ mutationFn: (id) => api.patch(`/parametres/${id}/deactivate`), onSuccess: invalidate });

  return (
    <div>
      <h2 style={{ fontSize: 16, color: "#22262B", marginBottom: 12 }}>Paramètres — listes modifiables</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, padding: "6px 10px", fontSize: 12, cursor: "pointer",
              background: type === t ? ORANGE : "#fff", color: type === t ? "#fff" : "#22262B", fontWeight: type === t ? 700 : 400,
            }}
          >
            {t.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", border: `1px solid ${GRAY_BORDER}`, borderRadius: 6 }}>
        <div style={{ display: "flex", gap: 8, padding: 12, borderBottom: `1px solid ${GRAY_BORDER}` }}>
          <input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={`Nouvelle valeur pour ${type.replaceAll("_", " ")}`}
            style={{ flex: 1, border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, padding: "6px 10px", fontSize: 13 }}
          />
          <button
            onClick={() => newValue && create.mutate()}
            style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 4, padding: "6px 14px", fontWeight: 700, cursor: "pointer" }}
          >
            Ajouter
          </button>
        </div>
        {isLoading && <div style={{ padding: 16, fontSize: 13, color: "#6B7280" }}>Chargement...</div>}
        {(data || []).map((p) => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: `1px solid ${GRAY_BORDER}`, fontSize: 13 }}>
            {p.valeur}
            <button onClick={() => deactivate.mutate(p.id)} style={{ fontSize: 11, color: "#DC2626", border: "none", background: "transparent", cursor: "pointer" }}>
              Désactiver
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
