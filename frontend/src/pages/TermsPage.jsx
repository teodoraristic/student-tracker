import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { SALMON, DARK } from "../utils/colors";

export default function TermsPage() {
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
                <h1 style={styles.title}>Terms of Service</h1>
                <p style={styles.meta}>Last updated: April 2025</p>

                <Section title="1. Acceptance of Terms">
                    By creating an account or using SemesterOS, you agree to these Terms of Service.
                    If you do not agree, please do not use the service.
                </Section>

                <Section title="2. Description of Service">
                    SemesterOS is an academic productivity platform that helps students manage
                    subjects, tasks, deadlines, and study sessions. Features include AI-powered
                    task assistance via the Anthropic Claude API.
                </Section>

                <Section title="3. Your Account">
                    You are responsible for maintaining the confidentiality of your account
                    credentials and for all activity that occurs under your account. You must
                    provide accurate information when registering. You must be at least 13 years
                    old to use this service.
                </Section>

                <Section title="4. Acceptable Use">
                    You agree not to use SemesterOS to: (a) violate any laws; (b) attempt to
                    gain unauthorized access to any system; (c) transmit harmful or malicious
                    content; (d) use the service for any commercial purpose without prior written
                    consent.
                </Section>

                <Section title="5. AI Features">
                    SemesterOS uses the Anthropic Claude API to provide AI-powered features.
                    AI-generated content may not always be accurate. Do not rely solely on AI
                    suggestions for important academic decisions.
                </Section>

                <Section title="6. Data and Privacy">
                    Your use of SemesterOS is also governed by our Privacy Policy. We collect
                    and process your data as described therein.
                </Section>

                <Section title="7. Account Deletion">
                    You may delete your account at any time from the Profile page. Upon deletion,
                    all your data is permanently removed from our systems.
                </Section>

                <Section title="8. Disclaimers">
                    SemesterOS is provided "as is" without warranties of any kind. We do not
                    guarantee uninterrupted availability or that the service will meet all your
                    requirements.
                </Section>

                <Section title="9. Limitation of Liability">
                    To the maximum extent permitted by law, SemesterOS and its operators shall
                    not be liable for any indirect, incidental, or consequential damages arising
                    from your use of the service.
                </Section>

                <Section title="10. Changes to Terms">
                    We may update these terms from time to time. Continued use of the service
                    after changes constitutes acceptance of the updated terms.
                </Section>

                <Section title="11. Contact">
                    If you have questions about these terms, please contact us through the
                    application.
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
