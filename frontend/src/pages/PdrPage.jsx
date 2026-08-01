import React, { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { DataTable } from "../components/DataTable";
import { CrudModal } from "../components/CrudModal";

const ORANGE = "#F5821F";
const RED = "#DC2626";
const GREEN = "#16A34A";

const FIELDS = [
  { key: "codeSap", label: "Code SAP" },
  { key: "designation", label: "Désignation" },
  { key: "famille", label: "Famille" },
  { key: "stockMin", label: "Stock minimum", type: "number" },
  { key: "stockMax", label: "Stock maximum", type: "number" },
  { key: "stockActuel", label: "Stock actuel", type: "number" },
  { key: "prixUnitaire", label: "Prix unitaire (DH)", type: "number" },
  { key: "classeAbc", label: "Classe ABC", type: "select", options: ["A", "B", "C"] },
];

function StatutBadge({ value }) {
  const color = value === "RUPTURE" ? RED : value === "CRITIQUE" ? ORANGE : value === "NORMAL" ? GREEN : "#5B9BD5";
  return <span style={{ background: color + "22", color, padding: "2px 8px", borderRadius: 3, fontSize: 11, fontWeight: 700 }}>{value}</span>;
}

const COLUMNS = [
  { key: "codeSap", label: "Code SAP" },
  { key: "designation", label: "Désignation" },
  { key: "stockActuel", label: "Stock" },
  { key: "statut", label: "Statut", render: (v) => <StatutBadge value={v} /> },
  { key: "valeurStock", label: "Valeur (DH)", render: (v) => v ? Math.round(v).toLocaleString("fr-FR") : "-" },
];

export default function PdrPage() {
  const { list, create, update, remove } = useCrud("pdr");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = list({ page, pageSize: 25, search });

  const handleSubmit = async (values) => {
    if (editing?.id) {
      await update.mutateAsync({ id: editing.id, data: values });
    } else {
      await create.mutateAsync(values);
    }
    setEditing(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, color: "#22262B" }}>Suivi PDR Magasin ELJ</h2>
        <button
          onClick={() => setEditing({})}
          style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}
        >
          + Nouvel article
        </button>
      </div>

      <DataTable
        columns={COLUMNS}
        rows={data?.data || []}
        total={data?.total}
        page={page}
        pageSize={25}
        onPageChange={setPage}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onEdit={setEditing}
        onDelete={(row) => { if (confirm(`Supprimer ${row.designation} ?`)) remove.mutate(row.id); }}
        loading={isLoading}
      />

      {editing && (
        <CrudModal
          title={editing.id ? "Modifier l'article" : "Nouvel article PDR"}
          fields={FIELDS}
          initialValues={editing}
          onSubmit={handleSubmit}
          onClose={() => setEditing(null)}
          saving={create.isPending || update.isPending}
        />
      )}
    </div>
  );
}
