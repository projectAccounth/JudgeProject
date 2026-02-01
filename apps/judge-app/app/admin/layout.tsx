import Link from "next/link";
import styles from "./AdminLayout.module.css";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.root}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    Judge Admin
                </div>

                <nav className={styles.nav}>
                    <Section title="Overview">
                        <NavLink href="/admin">
                            Dashboard
                        </NavLink>
                    </Section>

                    <Section title="Content">
                        <NavLink href="/admin/problems">
                            Problems
                        </NavLink>
                    </Section>

                    <Section title="Users & Roles">
                        <NavLink href="/admin/users">
                            Users
                        </NavLink>
                    </Section>

                    <Section title="System">
                        <NavLink href="/admin/submissions">
                            Submissions
                        </NavLink>
                        <NavLink href="/admin/workers">
                            Workers
                        </NavLink>
                    </Section>
                </nav>
            </aside>

            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>
                {title}
            </div>
            {children}
        </div>
    );
}

function NavLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <Link href={href} className={styles.link}>
            {children}
        </Link>
    );
}
