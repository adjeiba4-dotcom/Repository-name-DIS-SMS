// src/providers/QueryProvider.jsx

import React from "react";
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
        mutations: {
            retry: 1,
        },
    },
});

const QueryProvider = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default QueryProvider;