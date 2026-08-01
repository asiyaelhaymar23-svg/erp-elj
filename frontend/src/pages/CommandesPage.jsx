import React, { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { DataTable } from "../components/DataTable";
import { CrudModal } from "../components/CrudModal";

const ORANGE = "#F5821F";
const RED = "#DC2626";

const FIELDS = [
  { key: "numeroBc", label: "N° BC" },
  { key: "montant", label: "Montant (DH)", type: "number" },
  { key: "dateCommande", label: "Date de commande", type: "date" },
  { key: "dateReception", label: "Date de réception", type: "date" },
  { key: "statut", label: "Statut" },
];

const COLUMNS = [
  { key: "numeroBc", label: "N° BC" },
  { key: "fournisseur", label: "Fournisseur", render: (v) => v?.nom || "-" },
  { key: "montant", label: "Montant (DH)", render: (v) => v ? Math.round(v).toLocaleString("fr-FR") : "-" },
  { key: "statut", label: "Statut" },
  { key: "enRetard", label: "Retard", render: (v) => v ? <span style={{ color: RED, fontWeight: 700 }}>En retard</span> : "-" },
];

export default function CommandesPage() {
  const { list, create, update, remove } = useCrud("commandes");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const { data, isLoading } = list({ page, pageSize: 25, search });

  const handleSubmit = async (values) => {
    if (editing?.id) await update.mutateAsync({ id: editing.id, data: values });
    else await create.mutateAsync(values);
    setEditing(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, color: "#22262B" }}>Commandes (BC)</h2>
        <button onClick={() => setEditing({})} style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>
          + Nouvelle commande
        </button>
      </div>
      <DataTable
        columns={COLUMNS} rows={data?.data || []} total={data?.total} page={page} pageSize={25}
        onPageChange={setPage} search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onEdit={setEditing} onDelete={(row) => { if (confirm(`Supprimer ${row.numeroBc} ?`)) remove.mutate(row.id); }}
        loading={isLoading}
      />
      {editing && (
        <CrudModal
          title={editing.id ? "Modifier la commande" : "Nouvelle commande"}
          fields={FIELDS} initialValues={editing} onSubmit={handleSubmit} onClose={() => setEditing(null)}
          saving={create.isPending || update.isPending}
        />
      )}
    </div>
  );
}
