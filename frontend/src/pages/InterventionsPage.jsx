import React, { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { DataTable } from "../components/DataTable";
import { CrudModal } from "../components/CrudModal";

const ORANGE = "#F5821F";

const FIELDS = [
  { key: "equipementId", label: "ID Équipement", type: "number" },
  { key: "dateIntervention", label: "Date d'intervention", type: "date" },
  { key: "type", label: "Type d'intervention" },
  { key: "technicien", label: "Technicien" },
  { key: "description", label: "Description" },
  { key: "cout", label: "Coût (DH)", type: "number" },
];

const COLUMNS = [
  { key: "equipement", label: "Équipement", render: (v) => v?.designation || "-" },
  { key: "dateIntervention", label: "Date", render: (v) => new Date(v).toLocaleDateString("fr-FR") },
  { key: "type", label: "Type" },
  { key: "technicien", label: "Technicien" },
  { key: "cout", label: "Coût (DH)", render: (v) => v ? Math.round(v).toLocaleString("fr-FR") : "-" },
];

export default function InterventionsPage() {
  const { list, create, update, remove } = useCrud("interventions");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const { data, isLoading } = list({ page, pageSize: 25 });

  const handleSubmit = async (values) => {
    if (editing?.id) await update.mutateAsync({ id: editing.id, data: values });
    else await create.mutateAsync(values);
    setEditing(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, color: "#22262B" }}>Interventions</h2>
        <button onClick={() => setEditing({})} style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>
          + Nouvelle intervention
        </button>
      </div>
      <DataTable
        columns={COLUMNS} rows={data?.data || []} total={data?.total} page={page} pageSize={25}
        onPageChange={setPage} search="" onSearchChange={() => {}}
        onEdit={setEditing} onDelete={(row) => { if (confirm("Supprimer cette intervention ?")) remove.mutate(row.id); }}
        loading={isLoading}
      />
      {editing && (
        <CrudModal
          title={editing.id ? "Modifier l'intervention" : "Nouvelle intervention"}
          fields={FIELDS} initialValues={editing} onSubmit={handleSubmit} onClose={() => setEditing(null)}
          saving={create.isPending || update.isPending}
        />
      )}
    </div>
  );
}
