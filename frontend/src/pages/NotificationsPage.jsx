import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

const GRAY_BORDER = "#E4E7EB";
const ORANGE = "#F5821F";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data,
  });

  const markRead = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, color: "#22262B" }}>Notifications</h2>
        <button onClick={() => markAllRead.mutate()} style={{ border: `1px solid ${GRAY_BORDER}`, background: "#fff", borderRadius: 4, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
          Tout marquer comme lu
        </button>
      </div>
      <div style={{ background: "#fff", border: `1px solid ${GRAY_BORDER}`, borderRadius: 6 }}>
        {isLoading && <div style={{ padding: 16, fontSize: 13, color: "#6B7280" }}>Chargement...</div>}
        {!isLoading && (data || []).length === 0 && <div style={{ padding: 16, fontSize: 13, color: "#6B7280" }}>Aucune notification</div>}
        {(data || []).map((n) => (
          <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${GRAY_BORDER}`, background: n.isRead ? "#fff" : "#FFF7EE" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 700 }}>{n.message}</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>{new Date(n.createdAt).toLocaleString("fr-FR")}</div>
            </div>
            {!n.isRead && (
              <button onClick={() => markRead.mutate(n.id)} style={{ fontSize: 11, border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, padding: "4px 8px", cursor: "pointer" }}>
                Marquer lu
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
