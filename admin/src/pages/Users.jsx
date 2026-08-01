import { useState, useEffect } from "react";
import api from "../services/api.js";
import DataTable from "../components/DataTable.jsx";

const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
        key: "preferredGender",
        label: "Preferred Gender",
        render: (row) => row.preferredGender || "—",
    },
    {
        key: "preferredBudget",
        label: "Budget",
        render: (row) => (row.preferredBudget ? `₹${row.preferredBudget}` : "—"),
    },
    {
        key: "favourites",
        label: "favourites",
        render: (row) => row.favourites?.length ?? 0,
    },
    {
        key: "createdAt",
        label: "Joined",
        render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
];

// Read-only for v1 — per the locked feature scope, editing/banning user
// accounts is a Phase 2 item. This page exists to give admins visibility only.
const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const { data } = await api.get("/admin/users");
                setUsers(data.users);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load users");
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    return (
        <div>
            <h1 className="font-display text-3xl text-text-primary mb-6">Users</h1>

            {loading && <p className="text-text-secondary">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
                <DataTable columns={columns} rows={users} emptyMessage="No registered users yet." />
            )}
        </div>
    );
};

export default Users;