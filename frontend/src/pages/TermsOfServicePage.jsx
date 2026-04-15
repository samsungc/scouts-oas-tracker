import { Link } from 'react-router-dom'
import styles from './LegalPage.module.css'

export default function TermsOfServicePage() {
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backLink}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Sign In
        </Link>
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.icon}>⚜</span>
          <h1 className={styles.title}>Terms of Service</h1>
        </div>
        <p className={styles.updated}>6th Richmond Hill Scout Group &mdash; Last updated April 2026</p>

        <div className={styles.content}>
          <h2>Acceptance of Terms</h2>
          <p>
            By signing in to the OAS Badge Tracker, you agree to these Terms of Service. If you do
            not agree, please do not use this application. These terms apply to all users &mdash;
            Scouts, Scouters, and Admins &mdash; of the 6th Richmond Hill Scout Group.
          </p>

          <h2>Eligibility</h2>
          <p>
            This application is provided exclusively for current members of the 6th Richmond Hill
            Scout Group. Accounts are created and managed by Scouters and Admins. You may not share
            your credentials or allow others to access your account.
          </p>

          <h2>Acceptable Use</h2>
          <p>You agree to use this application only for its intended purpose &mdash; tracking and submitting progress toward Scout OAS badges. Specifically, you must not:</p>
          <ul>
            <li>Submit false or fabricated evidence for badge requirements.</li>
            <li>Attempt to access another member's account or data without authorisation.</li>
            <li>Upload content that is offensive, inappropriate, or unrelated to badge requirements.</li>
            <li>Attempt to reverse engineer, tamper with, or disrupt the application.</li>
            <li>Use the application for any commercial or non-Scout-related purpose.</li>
          </ul>

          <h2>Accuracy of Submissions</h2>
          <p>
            By submitting evidence for a badge requirement, you confirm that the evidence is genuine
            and accurately represents your own work or experience. Deliberate misrepresentation may
            result in removal of badge progress and, at the discretion of Group leadership, further
            disciplinary action.
          </p>

          <h2>Scouter and Admin Responsibilities</h2>
          <p>
            Scouters and Admins are responsible for the accuracy of reviews and approvals they
            submit. Account creation and management must follow the group's membership policies.
            Admin access carries additional responsibility and must not be misused.
          </p>

          <h2>Content You Upload</h2>
          <p>
            You retain ownership of the content you upload as evidence. By uploading content, you
            grant the 6th Richmond Hill Scout Group a limited licence to store and display that
            content to authorised members for badge-review purposes.
          </p>

          <h2>Service Availability</h2>
          <p>
            This application is provided on a best-effort basis. We do not guarantee uninterrupted
            availability and are not liable for any loss resulting from downtime or data loss. Please
            keep records of important badge work independently.
          </p>

          <h2>Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the application after
            changes are posted constitutes acceptance of the revised Terms.
          </p>

          <h2>Termination</h2>
          <p>
            Access may be suspended or removed at the discretion of Group Admins, particularly in
            cases of misuse or departure from the group.
          </p>

          <hr className={styles.divider} />

          <div className={styles.contact}>
            <strong>Questions?</strong> Contact your Scouter or Group Administrator.
            This application is operated solely for the members of the 6th Richmond Hill Scout Group.
          </div>
        </div>
      </div>
    </div>
  )
}
