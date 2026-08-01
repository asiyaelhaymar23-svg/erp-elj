import React from "react";
import ReactDOM from "react-dom/client";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

function messageErreur(error) {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join("\n");
  return message || error?.message || "Une erreur est survenue.";
}

// Point unique pour signaler l'échec d'une action à l'utilisateur : sans ça,
// une création/modification/suppression refusée par l'API (droits
// insuffisants, validation, doublon...) échouait silencieusement.
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => { alert(messageErreur(error)); },
  }),
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
