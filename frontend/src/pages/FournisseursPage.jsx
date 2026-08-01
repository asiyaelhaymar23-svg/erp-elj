import React, { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { DataTable } from "../components/DataTable";
import { CrudModal } from "../components/CrudModal";

const ORANGE = "#F5821F";

const FIELDS = [
  { key: "nom", label: "Nom" },
  { key: "contact", label: "Contact" },
  { key: "email", label: "Email" },
  { key: "telephone", label: "Téléphone" },
  { key: "adresse", label: "Adresse" },
];

const COLUMNS = [
  { key: "nom", label: "Nom" },
  { key: "contact", label: "Contact" },
  { key: "email", label: "Email" },
  { key: "telephone", label: "Téléphone" },
];

export default function FournisseursPage() {
  const { list, create, update, remove } = useCrud("fournisseurs");
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
        <h2 style={{ fontSize: 16, color: "#22262B" }}>Fournisseurs</h2>
        <button onClick={() => setEditing({})} style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>
          + Nouveau fournisseur
        </button>
      </div>
      <DataTable
        columns={COLUMNS} rows={data?.data || []} total={data?.total} page={page} pageSize={25}
        onPageChange={setPage} search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onEdit={setEditing} onDelete={(row) => { if (confirm(`Supprimer ${row.nom} ?`)) remove.mutate(row.id); }}
        loading={isLoading}
      />
      {editing && (
        <CrudModal
          title={editing.id ? "Modifier le fournisseur" : "Nouveau fournisseur"}
          fields={FIELDS} initialValues={editing} onSubmit={handleSubmit} onClose={() => setEditing(null)}
          saving={create.isPending || update.isPending}
        />
      )}
    </div>
  );
}
