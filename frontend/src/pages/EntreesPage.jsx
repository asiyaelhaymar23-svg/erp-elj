import React, { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { DataTable } from "../components/DataTable";
import { CrudModal } from "../components/CrudModal";

const ORANGE = "#F5821F";

const FIELDS = [
  { key: "articleId", label: "ID Article PDR", type: "number" },
  { key: "quantite", label: "Quantité", type: "number" },
  { key: "dateEntree", label: "Date d'entrée", type: "date" },
  { key: "otNumero", label: "N° OT" },
];

const COLUMNS = [
  { key: "article", label: "Article", render: (v) => v?.designation || "-" },
  { key: "quantite", label: "Quantité" },
  { key: "dateEntree", label: "Date", render: (v) => new Date(v).toLocaleDateString("fr-FR") },
  { key: "utilisateur", label: "Saisi par", render: (v) => v?.fullName || "-" },
];

export default function EntreesPage() {
  const { list, create, remove } = useCrud("entrees");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(null);
  const { data, isLoading } = list({ page, pageSize: 25 });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, color: "#22262B" }}>Entrées de matériel</h2>
        <button onClick={() => setCreating({})} style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>
          + Nouvelle entrée
        </button>
      </div>
      <DataTable
        columns={COLUMNS} rows={data?.data || []} total={data?.total} page={page} pageSize={25}
        onPageChange={setPage} search="" onSearchChange={() => {}}
        onEdit={() => {}} onDelete={(row) => { if (confirm("Supprimer cette entrée ?")) remove.mutate(row.id); }}
        loading={isLoading}
      />
      {creating && (
        <CrudModal
          title="Nouvelle entrée"
          fields={FIELDS} initialValues={creating}
          onSubmit={async (values) => { await create.mutateAsync(values); setCreating(null); }}
          onClose={() => setCreating(null)}
          saving={create.isPending}
        />
      )}
    </div>
  );
}
