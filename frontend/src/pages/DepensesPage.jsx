import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useCrud } from "../hooks/useCrud";
import { DataTable } from "../components/DataTable";
import { CrudModal } from "../components/CrudModal";

const ORANGE = "#F5821F";
const GRAY_BORDER = "#E4E7EB";

const FIELDS = [
  { key: "secteur", label: "Secteur" },
  { key: "nature", label: "Nature", type: "select", options: ["OPEX", "CAPEX"] },
  { key: "type", label: "Type", type: "select", options: ["PRESTATION", "PDR"] },
  { key: "montant", label: "Montant (DH)", type: "number" },
  { key: "pilote", label: "Pilote" },
  { key: "otNumero", label: "N° OT" },
  { key: "statut", label: "Statut", type: "select", options: ["PREVU", "ENGAGE", "REALISE", "CLOTURE"] },
];

const COLUMNS = [
  { key: "secteur", label: "Secteur" },
  { key: "nature", label: "Nature" },
  { key: "type", label: "Type" },
  { key: "montant", label: "Montant (DH)", render: (v) => Math.round(v).toLocaleString("fr-FR") },
  { key: "statut", label: "Statut" },
];

function KpiCard({ label, value }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, padding: "12px 16px", flex: 1 }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

export default function DepensesPage() {
  const { list, create, update, remove } = useCrud("depenses");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const { data, isLoading } = list({ page, pageSize: 25 });
  const { data: synthese } = useQuery({ queryKey: ["depenses-synthese"], queryFn: async () => (await api.get("/depenses/synthese")).data });

  const handleSubmit = async (values) => {
    if (editing?.id) await update.mutateAsync({ id: editing.id, data: values });
    else await create.mutateAsync(values);
    setEditing(null);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <KpiCard label="Total engagé (DH)" value={synthese ? Math.round(synthese.total).toLocaleString("fr-FR") : "..."} />
        <KpiCard label="Interventions" value={synthese?.nombreInterventions ?? "..."} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, color: "#22262B" }}>Dépenses Arrêt Électrique</h2>
        <button onClick={() => setEditing({})} style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>
          + Nouvelle dépense
        </button>
      </div>
      <DataTable
        columns={COLUMNS} rows={data?.data || []} total={data?.total} page={page} pageSize={25}
        onPageChange={setPage} search={search} onSearchChange={setSearch}
        onEdit={setEditing} onDelete={(row) => { if (confirm("Supprimer cette dépense ?")) remove.mutate(row.id); }}
        loading={isLoading}
      />
      {editing && (
        <CrudModal
          title={editing.id ? "Modifier la dépense" : "Nouvelle dépense"}
          fields={FIELDS} initialValues={editing} onSubmit={handleSubmit} onClose={() => setEditing(null)}
          saving={create.isPending || update.isPending}
        />
      )}
    </div>
  );
}
