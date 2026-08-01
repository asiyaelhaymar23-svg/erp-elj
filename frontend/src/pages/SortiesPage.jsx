import React, { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { DataTable } from "../components/DataTable";
import { CrudModal } from "../components/CrudModal";

const ORANGE = "#F5821F";
const RED = "#DC2626";
const GREEN = "#16A34A";

const FIELDS = [
  { key: "articleId", label: "ID Article PDR", type: "number" },
  { key: "quantite", label: "Quantité", type: "number" },
  { key: "dateSortie", label: "Date de sortie", type: "date" },
  { key: "destination", label: "Destination / Prestataire" },
  { key: "otNumero", label: "N° OT" },
];

function StatutBadge({ value }) {
  const color = value === "RETOURNE" ? GREEN : value === "PARTIEL" ? ORANGE : value === "EN_RETARD" ? RED : "#5B9BD5";
  return <span style={{ background: color + "22", color, padding: "2px 8px", borderRadius: 3, fontSize: 11, fontWeight: 700 }}>{value}</span>;
}

export default function SortiesPage() {
  const { list, create, remove } = useCrud("sorties");
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(null);
  const { data, isLoading } = list({ page, pageSize: 25 });

  const retour = useMutation({
    mutationFn: ({ id }) => api.patch(`/sorties/${id}/retour`, { dateRetourReelle: new Date().toISOString() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sorties"] }),
  });

  const columns = [
    { key: "article", label: "Article", render: (v) => v?.designation || "-" },
    { key: "destination", label: "Destination" },
    { key: "quantite", label: "Quantité" },
    { key: "dateSortie", label: "Sortie", render: (v) => new Date(v).toLocaleDateString("fr-FR") },
    { key: "statut", label: "Statut", render: (v, row) => <StatutBadge value={row.enRetard ? "EN_RETARD" : v} /> },
    {
      key: "id", label: "Retour",
      render: (id, row) => row.statut !== "RETOURNE" ? (
        <button onClick={() => retour.mutate({ id })} style={{ fontSize: 11, border: `1px solid #E4E7EB`, borderRadius: 4, padding: "3px 8px", cursor: "pointer" }}>
          Marquer retourné
        </button>
      ) : "—",
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, color: "#22262B" }}>Sorties de matériel</h2>
        <button onClick={() => setCreating({})} style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>
          + Nouvelle sortie
        </button>
      </div>
      <DataTable
        columns={columns} rows={data?.data || []} total={data?.total} page={page} pageSize={25}
        onPageChange={setPage} search="" onSearchChange={() => {}}
        onEdit={() => {}} onDelete={(row) => { if (confirm("Supprimer cette sortie ?")) remove.mutate(row.id); }}
        loading={isLoading}
      />
      {creating && (
        <CrudModal
          title="Nouvelle sortie"
          fields={FIELDS} initialValues={creating}
          onSubmit={async (values) => { await create.mutateAsync(values); setCreating(null); }}
          onClose={() => setCreating(null)}
          saving={create.isPending}
        />
      )}
    </div>
  );
}
