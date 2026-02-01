import styles from "./AdminTable.module.css";

export function AdminTable({
    columns,
    children,
}: {
    columns: string[];
    children: React.ReactNode;
}) {
    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((c) => (
                            <th key={c}>{c}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>{children}</tbody>
            </table>
        </div>
    );
}
