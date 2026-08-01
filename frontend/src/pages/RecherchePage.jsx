import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

const GRAY_BORDER = "#E4E7EB";

function ResultGroup({ title, items, renderItem }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", marginBottom: 6 }}>{title} ({items.length})</div>
      <div style={{ background: "#fff", border: `1px solid ${GRAY_BORDER}`, borderRadius: 6 }}>
        {items.map((item, i) => (
          <div key={item.id ?? i} style={{ padding: "8px 12px", borderBottom: i < items.length - 1 ? `1px solid ${GRAY_BORDER}` : "none", fontSize: 13 }}>
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RecherchePage() {
  const [q, setQ] = useState("");
  const [terme, setTerme] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["search", terme],
    queryFn: async () => (await api.get("/search", { params: { q: terme } })).data,
    enabled: terme.length >= 2,
  });

  return (
    <div>
      <h2 style={{ fontSize: 16, color: "#22262B", marginBottom: 12 }}>Recherche globale</h2>
      <form onSubmit={(e) => { e.preventDefault(); setTerme(q); }} style={{ marginBottom: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Équipement, article, DA, BC, fournisseur, document, N° OT, constructeur..."
          style={{ width: "100%", padding: "10px 12px", border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, fontSize: 14, boxSizing: "border-box" }}
        />
      </form>

      {isLoading && <div style={{ fontSize: 13, color: "#6B7280" }}>Recherche en cours...</div>}

      {data && (
        <>
          <ResultGroup title="Équipements" items={data.equipements} renderItem={(e) => `${e.designation} — ${e.secteur} (${e.codeSap || "sans code"})`} />
          <ResultGroup title="Articles PDR" items={data.articles} renderItem={(a) => `${a.designation} — ${a.codeSap}`} />
          <ResultGroup title="Demandes d'achat" items={data.demandesAchat} renderItem={(d) => `DA ${d.numeroDa} — ${d.division || "-"}`} />
          <ResultGroup title="Commandes" items={data.commandes} renderItem={(c) => `BC ${c.numeroBc}`} />
          <ResultGroup title="Fournisseurs" items={data.fournisseurs} renderItem={(f) => f.nom} />
          <ResultGroup title="Documents" items={data.documents} renderItem={(doc) => doc.nomFichier} />
          {Object.values(data).every((arr) => arr.length === 0) && terme.length >= 2 && (
            <div style={{ fontSize: 13, color: "#6B7280" }}>Aucun résultat pour « {terme} ».</div>
          )}
        </>
      )}
    </div>
  );
}
