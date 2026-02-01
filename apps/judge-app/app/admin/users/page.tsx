"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import styles from "../AdminLayout.module.css";

interface User {
    id: string;
    username: string;
    role: string;
    createdAt: string;
}

interface UsersResponse {
    users: User[];
    total: number;
}

export default function AdminUsersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editUsername, setEditUsername] = useState<string>("");
    const [editRole, setEditRole] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isSearching, setIsSearching] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState<string>("");
    const limit = 20;

    useEffect(() => {
        if (!loading && user?.role !== "ADMIN") {
            router.push("/");
        }
    }, [user, loading, router]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                setDebouncedQuery(searchQuery);
                setIsSearching(true);
                setOffset(0);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        async function loadUsers() {
            try {
                setUsersLoading(true);
                let url = `/api/admin/users?limit=${limit}&offset=${offset}`;
                if (debouncedQuery && isSearching) {
                    url = `/api/admin/users?q=${encodeURIComponent(debouncedQuery)}`;
                }
                const response = await fetch(url, { credentials: "include" });
                if (!response.ok) {
                    throw new Error("Failed to load users");
                }
                const data: UsersResponse = await response.json();
                setUsers(data.users);
                setTotal(data.total);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error loading users");
            } finally {
                setUsersLoading(false);
            }
        }

        if (user?.role === "ADMIN") {
            loadUsers();
        }
    }, [user, limit, offset, debouncedQuery, isSearching]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const response = await fetch(
                `/api/admin/users/${userId}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role: newRole }),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to update user role");
            }
            // Reload users
            setOffset(0);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error updating role");
        }
    };

    const startEditUser = (userId: string, username: string, role: string) => {
        setEditingUserId(userId);
        setEditUsername(username);
        setEditRole(role);
    };

    const cancelEdit = () => {
        setEditingUserId(null);
        setEditUsername("");
        setEditRole("");
    };

    const saveUserChanges = async (userId: string) => {
        try {
            const updates: { username?: string; role?: string } = {};
            const currentUser = users.find(u => u.id === userId);
            
            if (editUsername !== currentUser?.username) {
                updates.username = editUsername;
            }
            if (editRole !== currentUser?.role) {
                updates.role = editRole;
            }

            if (Object.keys(updates).length === 0) {
                cancelEdit();
                return;
            }

            const response = await fetch(
                `/api/admin/users/${userId}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updates),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to update user");
            }
            cancelEdit();
            setOffset(0);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error updating user");
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Already handled by debounce effect
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setDebouncedQuery("");
        setIsSearching(false);
        setOffset(0);
    };

    if (loading || usersLoading) {
        return <div className={styles.loading}>{t("common.loading")}</div>;
    }

    return (
        <div className={styles.container}>
            <h2>{t("adminPanel.admin") || "Admin Panel"} - {t("adminPanel.users") || "Users"}</h2>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSearch} className={styles.searchBox}>
                <input
                    type="text"
                    placeholder={t("problems.search_placeholder") || "Search users..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
                <button type="submit" className={styles.searchButton}>
                    {t("common.search") || "Search"}
                </button>
                {isSearching && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className={styles.searchButton}
                    >
                        {t("common.clear") || "Clear"}
                    </button>
                )}
            </form>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>{t("adminPanel.id")}</th>
                            <th>{t("adminPanel.username")}</th>
                            <th>{t("adminPanel.role")}</th>
                            <th>{t("adminPanel.joined")}</th>
                            <th>{t("adminPanel.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users && users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.id.slice(0, 8)}...</td>
                                <td>
                                    {editingUserId === u.id ? (
                                        <input
                                            type="text"
                                            value={editUsername}
                                            onChange={(e) => setEditUsername(e.target.value)}
                                            placeholder="Username"
                                        />
                                    ) : (
                                        <Link href={`/users/${u.id}`}>{u.username}</Link>
                                    )}
                                </td>
                                <td>
                                    {editingUserId === u.id ? (
                                        <select
                                            value={editRole}
                                            onChange={(e) => setEditRole(e.target.value)}
                                            disabled={editRole === "ADMIN"}
                                        >
                                            <option value="USER">{t("adminPanel.roleOptions.user")}</option>
                                            <option value="STUDENT">{t("adminPanel.roleOptions.student")}</option>
                                            <option value="TEACHER">{t("adminPanel.roleOptions.teacher")}</option>
                                            {editRole === "ADMIN" && (
                                                <option value="ADMIN">{t("adminPanel.roleOptions.admin")}</option>
                                            )}
                                        </select>
                                    ) : (
                                        <select
                                            value={u.role}
                                            onChange={(e) =>
                                                handleRoleChange(u.id, e.target.value)
                                            }
                                            disabled={u.role === "ADMIN"}
                                        >
                                            <option value="USER">{t("adminPanel.roleOptions.user")}</option>
                                            <option value="STUDENT">{t("adminPanel.roleOptions.student")}</option>
                                            <option value="TEACHER">{t("adminPanel.roleOptions.teacher")}</option>
                                            {u.role === "ADMIN" && (
                                                <option value="ADMIN">{t("adminPanel.roleOptions.admin")}</option>
                                            )}
                                        </select>
                                    )}
                                </td>
                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td>
                                    {editingUserId === u.id ? (
                                        <>
                                            <button
                                                onClick={() => saveUserChanges(u.id)}
                                                className={styles.saveBtn}
                                            >
                                                {t("common.save") || "Save"}
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className={styles.cancelBtn}
                                            >
                                                {t("common.cancel") || "Cancel"}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startEditUser(u.id, u.username, u.role)}
                                                className={styles.editBtn}
                                            >
                                                {t("adminPanel.edit") || "Edit"}
                                            </button>
                                            <Link href={`/users/${u.id}`} className={styles.editBtn}>
                                                {t("adminPanel.view")}
                                            </Link>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.pagination}>
                <button
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                >
                    {t("adminPanel.previous")}
                </button>
                <span>
                    {t("adminPanel.page")} {Math.floor(offset / limit) + 1} {t("adminPanel.of")}{" "}
                    {Math.ceil(total / limit)}
                </span>
                <button
                    onClick={() =>
                        setOffset(offset + limit > total ? offset : offset + limit)
                    }
                    disabled={offset + limit >= total}
                >
                    {t("adminPanel.next")}
                </button>
            </div>
        </div>
    );
}
