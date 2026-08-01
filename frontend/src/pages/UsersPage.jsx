import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { DataTable } from "../components/DataTable";
import { CrudModal } from "../components/CrudModal";

const ORANGE = "#F5821F";
const GREEN = "#16A34A";
const RED = "#DC2626";

const ROLES = ["ADMINISTRATEUR", "RESPONSABLE", "PREPARATEUR", "MAGASIN", "MAINTENANCE", "DIRECTION"];

const CREATE_FIELDS = [
  { key: "fullName", label: "Nom complet" },
  { key: "email", label: "Email professionnel" },
  { key: "password", label: "Mot de passe initial", type: "password" },
  { key: "role", label: "Rôle", type: "select", options: ROLES },
];

const UPDATE_FIELDS = [
  { key: "fullName", label: "Nom complet" },
  { key: "role", label: "Rôle", type: "select", options: ROLES },
];

const COLUMNS = [
  { key: "fullName", label: "Nom" },
  { key: "email", label: "Email" },
  { key: "role", label: "Rôle" },
  {
    key: "isActive", label: "Statut",
    render: (v) => <span style={{ color: v ? GREEN : RED, fontWeight: 700 }}>{v ? "Actif" : "Désactivé"}</span>,
  },
  {
    key: "lastLoginAt", label: "Dernière connexion",
    render: (v) => (v ? new Date(v).toLocaleString("fr-FR") : "Jamais"),
  },
];

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null); // null = fermé, {} = création, {...} = édition

  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get("/users")).data,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["users"] });
  const create = useMutation({ mutationFn: (values) => api.post("/users", values), onSuccess: invalidate });
  const update = useMutation({ mutationFn: ({ id, data }) => api.patch(`/users/${id}`, data), onSuccess: invalidate });
  const deactivate = useMutation({ mutationFn: (id) => api.patch(`/users/${id}/deactivate`), onSuccess: invalidate });

  const handleSubmit = async (values) => {
    if (editing?.id) {
      await update.mutateAsync({ id: editing.id, data: { fullName: values.fullName, role: values.role } });
    } else {
      await create.mutateAsync(values);
    }
    setEditing(null);
  };

  if (error) {
    return (
      <div style={{ background: "#fff", border: "1px solid #E4E7EB", borderRadius: 6, padding: 20, color: "#DC2626", fontSize: 13 }}>
        Accès refusé — la gestion des utilisateurs est réservée aux administrateurs.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, color: "#22262B" }}>Utilisateurs</h2>
        <button
          onClick={() => setEditing({})}
          style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}
        >
          + Nouvel utilisateur
        </button>
      </div>

      <DataTable
        columns={COLUMNS}
        rows={data || []}
        total={(data || []).length}
        page={1}
        pageSize={(data || []).length || 25}
        onPageChange={() => {}}
        search=""
        onSearchChange={() => {}}
        onEdit={setEditing}
        onDelete={(row) => { if (confirm(`Désactiver ${row.fullName} ?`)) deactivate.mutate(row.id); }}
        deleteLabel="Désactiver"
        loading={isLoading}
      />

      {editing && (
        <CrudModal
          title={editing.id ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          fields={editing.id ? UPDATE_FIELDS : CREATE_FIELDS}
          initialValues={editing}
          onSubmit={handleSubmit}
          onClose={() => setEditing(null)}
          saving={create.isPending || update.isPending}
        />
      )}
    </div>
  );
}
