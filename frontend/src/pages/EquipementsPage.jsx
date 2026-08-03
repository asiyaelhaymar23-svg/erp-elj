import React, { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { DataTable } from "../components/DataTable";
import { CrudModal } from "../components/CrudModal";
import { ImportButton } from "../components/ImportButton";

const ORANGE = "#F5821F";

const FIELDS = [
  { key: "codeSap", label: "Code SAP" },
  { key: "designation", label: "Désignation" },
  { key: "secteur", label: "Secteur", type: "select", options: ["Four", "Laminage", "Finissage", "Auxiliaires"] },
  { key: "constructeur", label: "Constructeur" },
  { key: "marque", label: "Marque" },
  { key: "criticite", label: "Criticité", type: "select", options: ["A", "B", "C"] },
];

const COLUMNS = [
  { key: "codeSap", label: "Code SAP" },
  { key: "designation", label: "Désignation" },
  { key: "secteur", label: "Secteur" },
  { key: "criticite", label: "Criticité" },
];

export default function EquipementsPage() {
  const { list, create, update, remove, duplicate } = useCrud("equipements");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null = fermé, {} = création, {...} = édition

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
        <h2 style={{ fontSize: 16, color: "#22262B" }}>Base Équipements Critiques</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <ImportButton resource="equipements" invalidateKey="equipements" />
          <button
            onClick={() => setEditing({})}
            style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}
          >
            + Nouvel équipement
          </button>
        </div>
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
        onDuplicate={(row) => duplicate.mutate(row.id)}
        onDelete={(row) => { if (confirm(`Supprimer ${row.designation} ?`)) remove.mutate(row.id); }}
        loading={isLoading}
      />

      {editing && (
        <CrudModal
          title={editing.id ? "Modifier l'équipement" : "Nouvel équipement"}
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
