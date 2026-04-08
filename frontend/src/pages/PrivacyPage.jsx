import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { SALMON, DARK } from "../utils/colors";

export default function PrivacyPage() {
    const navigate = useNavigate();

    return (
        <div style={styles.root}>
            <div style={styles.nav}>
                <div style={styles.logoWrap} onClick={() => navigate("/")}>
                    <div style={styles.logoMark}>
                        <BookOpen size={16} color={SALMON} strokeWidth={2.2} />
                    </div>
                    <span style={styles.logoText}>SemesterOS</span>
                </div>
            </div>

            <div style={styles.content}>
                <h1 style={styles.title}>Privacy Policy</h1>
                <p style={styles.meta}>Last updated: April 2025</p>

                <Section title="1. What We Collect">
                    When you create an account, we collect your name and email address.
                    When you use the app, we store the academic data you enter: subjects,
                    tasks, deadlines, and study sessions. We do not collect payment information
                    (the service is currently free).
                </Section>

                <Section title="2. How We Use Your Data">
                    Your data is used exclusively to provide the SemesterOS service — storing
                    your academic information so you can access it across sessions. We do not
                    sell your data or use it for advertising.
                </Section>

                <Section title="3. AI Features">
                    When you use AI-powered features, task content is sent to the Anthropic
                    Claude API for processing. Please review Anthropic's privacy policy for
                    details on how they handle this data. We do not store AI conversation logs.
                </Section>

                <Section title="4. Data Storage">
                    Your data is stored in a PostgreSQL database hosted on a secure cloud
                    provider. We use industry-standard security measures including encrypted
                    connections and hashed passwords.
                </Section>

                <Section title="5. Account Deletion">
                    You can permanently delete your account and all associated data at any time
                    from your Profile page. Deletion is immediate and irreversible.
                </Section>

                <Section title="6. Cookies and Local Storage">
                    We use browser local storage to keep you signed in between sessions.
                    We do not use tracking cookies or third-party analytics.
                </Section>

                <Section title="7. Data Sharing">
                    We do not share your personal data with third parties except as required
                    to provide the service (e.g., our hosting provider) or as required by law.
                </Section>

                <Section title="8. Your Rights">
                    You have the right to access, correct, or delete your personal data.
                    To exercise these rights, use the account management features in the app
                    or contact us directly.
                </Section>

                <Section title="9. Children's Privacy">
                    SemesterOS is not intended for children under 13. We do not knowingly
                    collect data from children under 13.
                </Section>

                <Section title="10. Changes to This Policy">
                    We may update this policy periodically. We will notify users of significant
                    changes. Continued use after changes constitutes acceptance.
                </Section>

                <Section title="11. Contact">
                    If you have questions or concerns about your privacy, please contact us
                    through the application.
                </Section>

                <button style={styles.btn} onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: 28 }}>
            <h2 style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#ffffff",
                margin: "0 0 8px",
                fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>
                {title}
            </h2>
            <p style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.55)",
                margin: 0,
                lineHeight: 1.7,
                fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>
                {children}
            </p>
        </div>
    );
}

const styles = {
    root: {
        minHeight: "100vh",
        background: "#1e1a1a",
        fontFamily: "'DM Sans', system-ui, sans-serif",
    },
    nav: {
        padding: "20px 40px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
    },
    logoWrap: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        width: "fit-content",
    },
    logoMark: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "rgba(244,149,133,0.12)",
        border: "1.5px solid rgba(244,149,133,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    logoText: {
        fontFamily: "'Instrument Serif', serif",
        fontSize: 18,
        color: SALMON,
    },
    content: {
        maxWidth: 680,
        margin: "0 auto",
        padding: "60px 24px",
    },
    title: {
        fontFamily: "'Instrument Serif', serif",
        fontSize: 40,
        fontWeight: 400,
        color: SALMON,
        margin: "0 0 8px",
    },
    meta: {
        fontSize: 13,
        color: "rgba(255,255,255,0.3)",
        margin: "0 0 40px",
    },
    btn: {
        marginTop: 16,
        padding: "11px 24px",
        background: SALMON,
        color: DARK,
        border: "none",
        borderRadius: 99,
        fontSize: 14,
        fontWeight: 700,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        cursor: "pointer",
    },
};
