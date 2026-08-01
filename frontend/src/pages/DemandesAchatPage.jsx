import React, { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { DataTable } from "../components/DataTable";
import { CrudModal } from "../components/CrudModal";

const ORANGE = "#F5821F";
const GREEN = "#16A34A";
const RED = "#DC2626";

const FIELDS = [
  { key: "numeroDa", label: "N° DA" },
  { key: "division", label: "Division" },
  { key: "demandeur", label: "Demandeur" },
  { key: "quantite", label: "Quantité", type: "number" },
  { key: "dateCreation", label: "Date de création", type: "date" },
  { key: "nature", label: "Nature", type: "select", options: ["OPEX", "CAPEX", "PRESTATION"] },
  { key: "priorite", label: "Priorité" },
];

const COLUMNS = [
  { key: "numeroDa", label: "N° DA" },
  { key: "division", label: "Division" },
  { key: "quantite", label: "Quantité" },
  { key: "nature", label: "Nature" },
  {
    key: "transformeeEnBc", label: "Transformée en BC",
    render: (v) => <span style={{ color: v ? GREEN : RED, fontWeight: 700 }}>{v ? "Oui" : "Non"}</span>,
  },
];

export default function DemandesAchatPage() {
  const { list, create, update, remove } = useCrud("demandes-achat");
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
        <h2 style={{ fontSize: 16, color: "#22262B" }}>Demandes d'Achat (DA)</h2>
        <button onClick={() => setEditing({})} style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>
          + Nouvelle DA
        </button>
      </div>
      <DataTable
        columns={COLUMNS} rows={data?.data || []} total={data?.total} page={page} pageSize={25}
        onPageChange={setPage} search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onEdit={setEditing} onDelete={(row) => { if (confirm(`Supprimer ${row.numeroDa} ?`)) remove.mutate(row.id); }}
        loading={isLoading}
      />
      {editing && (
        <CrudModal
          title={editing.id ? "Modifier la DA" : "Nouvelle DA"}
          fields={FIELDS} initialValues={editing} onSubmit={handleSubmit} onClose={() => setEditing(null)}
          saving={create.isPending || update.isPending}
        />
      )}
    </div>
  );
}
