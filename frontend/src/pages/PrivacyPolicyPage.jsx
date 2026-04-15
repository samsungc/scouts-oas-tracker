import { Link } from 'react-router-dom'
import styles from './LegalPage.module.css'

export default function PrivacyPolicyPage() {
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
          <h1 className={styles.title}>Privacy Policy</h1>
        </div>
        <p className={styles.updated}>6th Richmond Hill Scout Group &mdash; Last updated April 2026</p>

        <div className={styles.content}>
          <h2>Overview</h2>
          <p>
            This Privacy Policy describes how the 6th Richmond Hill Scout Group ("we", "us") collects,
            uses, and protects personal information through the OAS Badge Tracker application. We are
            committed to handling all personal data responsibly, in accordance with applicable privacy laws.
          </p>

          <h2>Information We Collect</h2>
          <p>We collect only the information necessary to operate the badge tracker:</p>
          <ul>
            <li><strong>Account information</strong> &mdash; username and email address, provided when your account is created by a Scouter.</li>
            <li><strong>Badge progress</strong> &mdash; submission records, evidence uploads (text and files), and reviewer notes associated with your badge work.</li>
            <li><strong>Activity data</strong> &mdash; log-in timestamps and actions taken within the app (for leaderboard and audit purposes).</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To track and display your badge completion progress.</li>
            <li>To allow Scouters and Admins to review and approve badge submissions.</li>
            <li>To generate leaderboards and activity summaries visible to members of your group.</li>
            <li>To send password-reset and notification emails when you request them.</li>
          </ul>

          <h2>Who Can See Your Data</h2>
          <p>
            Your badge progress and submissions are visible to Scouters and Admins in your group.
            Leaderboard data (points, activity) is visible to all signed-in members of the group.
            We do not share your personal information with third parties outside the group.
          </p>

          <h2>Evidence Uploads</h2>
          <p>
            Files and text you upload as evidence for badge requirements are stored securely and
            accessible only to you, your Scouters, and Admins. Please do not upload sensitive personal
            information beyond what is necessary to demonstrate a badge requirement.
          </p>

          <h2>Data Retention</h2>
          <p>
            Your data is retained for the duration of your membership in the group. If your account
            is removed, your personal information will be deleted or anonymised within a reasonable
            timeframe, except where retention is required for record-keeping purposes.
          </p>

          <h2>Security</h2>
          <p>
            Passwords are stored using industry-standard hashing. Access tokens expire regularly and
            connections to this application are encrypted in transit. We take reasonable steps to
            protect your data from unauthorised access.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Request access to the personal data we hold about you.</li>
            <li>Ask for corrections to inaccurate information.</li>
            <li>Request deletion of your account and associated data.</li>
          </ul>
          <p>To exercise any of these rights, please contact your Scouter or Group Admin.</p>

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
