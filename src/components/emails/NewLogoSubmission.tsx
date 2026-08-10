import { Text } from '@react-email/components'
import { BaseEmailTemplate } from './BaseEmailTemplate'

interface NewLogoSubmissionEmailProps {
  logoId: string
  title: string
  thumbnail: string
  designerName?: string
  designerEmail?: string
  description?: string
  submissionDate?: string
  tags?: string[]
  hasSourceFile?: boolean
}

export const NewLogoSubmissionEmail = ({
  logoId,
  title,
  thumbnail,
  designerName,
  designerEmail,
  description = 'No description provided',
  submissionDate = new Date().toLocaleString(),
  tags = [],
  hasSourceFile = false,
}: NewLogoSubmissionEmailProps) => {
  return (
    <BaseEmailTemplate
      previewText={`New logo submission: ${title}`}
      heading="New Logo Submission"
      utmSource="submission"
      utmMedium="email"
      utmCampaign="logo_submission"
      ctaText="Review Submission"
      ctaUrl={`https://afterlife.work/admin/submissions/${logoId}`}
      body={
        <>
          <Text style={styles.text}>A new logo has been submitted for review.</Text>

          <div style={styles.thumbnailContainer}>
            <img src={thumbnail} alt={`${title} Logo`} style={styles.thumbnail} />
          </div>

          <table style={styles.infoTable}>
            <tbody>
              <tr>
                <td style={styles.labelCell}>
                  <strong>Logo Name:</strong>
                </td>
                <td style={styles.valueCell}>{title}</td>
              </tr>
              {designerName && (
                <tr>
                  <td style={styles.labelCell}>
                    <strong>Submitted By:</strong>
                  </td>
                  <td style={styles.valueCell}>{designerName}</td>
                </tr>
              )}
              {designerEmail && (
                <tr>
                  <td style={styles.labelCell}>
                    <strong>Contact Email:</strong>
                  </td>
                  <td style={styles.valueCell}>{designerEmail}</td>
                </tr>
              )}
              <tr>
                <td style={styles.labelCell}>
                  <strong>Submission Date:</strong>
                </td>
                <td style={styles.valueCell}>{submissionDate}</td>
              </tr>
              <tr>
                <td style={styles.labelCell}>
                  <strong>Description:</strong>
                </td>
                <td style={styles.valueCell}>{description}</td>
              </tr>
              {tags.length > 0 && (
                <tr>
                  <td style={styles.labelCell}>
                    <strong>Tags:</strong>
                  </td>
                  <td style={styles.valueCell}>{tags.join(', ')}</td>
                </tr>
              )}
              <tr>
                <td style={styles.labelCell}>
                  <strong>Source File:</strong>
                </td>
                <td style={styles.valueCell}>{hasSourceFile ? 'Included' : 'Not included'}</td>
              </tr>
            </tbody>
          </table>
        </>
      }
    />
  )
}

const styles = {
  text: {
    color: '#FFFFFF',
    fontSize: '16px',
    lineHeight: '1.5',
    margin: '0 0 24px',
  },
  thumbnailContainer: {
    margin: '0 0 24px',
  },
  thumbnail: {
    width: '100%',
    display: 'block',
    height: 'auto',
    backgroundColor: '#111',
    borderRadius: '8px',
    border: '1px solid #222',
  },
  infoTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    borderSpacing: '0',
  },
  labelCell: {
    padding: '12px 16px 12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    verticalAlign: 'top' as const,
    width: '140px',
    color: '#999',
    fontSize: '14px',
  },
  valueCell: {
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    color: '#FFFFFF',
    fontSize: '14px',
    lineHeight: '1.5',
  },
}
