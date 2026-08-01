import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { DataTable } from "../components/DataTable";

const COLUMNS = [
  { key: "tableName", label: "Table" },
  { key: "recordId", label: "ID enregistrement" },
  { key: "action", label: "Action" },
  { key: "utilisateur", label: "Utilisateur", render: (v) => v?.fullName || "-" },
  { key: "createdAt", label: "Date", render: (v) => new Date(v).toLocaleString("fr-FR") },
];

export default function HistoriquePage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["historique", page],
    queryFn: async () => (await api.get("/historique", { params: { page, pageSize: 25 } })).data,
  });

  return (
    <div>
      <h2 style={{ fontSize: 16, color: "#22262B", marginBottom: 12 }}>Historique / Audit</h2>
      <DataTable
        columns={COLUMNS} rows={data?.data || []} total={data?.total} page={page} pageSize={25}
        onPageChange={setPage} search="" onSearchChange={() => {}}
        readOnly
        loading={isLoading}
      />
    </div>
  );
}
