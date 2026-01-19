# VMC CiviSense - Deployment Guide

## System Overview
VMC CiviSense is a comprehensive civic issue monitoring system designed specifically for Vadodara Municipal Corporation. This Progressive Web Application (PWA) enables field workers to report civic issues offline-first with GPS tracking and automatic ward detection.

## Pre-Deployment Checklist

### 1. Infrastructure Requirements
- **Server**: Node.js 18+ compatible hosting
- **Database**: PostgreSQL 14+ or MongoDB 5+
- **Storage**: Minimum 100GB for image storage
- **SSL Certificate**: Required for PWA functionality
- **Domain**: Preferably vmc.gov.in subdomain

### 2. Third-Party Integrations
- **MapMyIndia API**: For accurate Indian mapping
- **SMS Gateway**: For notifications (TextLocal/MSG91)
- **Email Service**: For reports (AWS SES/SendGrid)
- **Push Notifications**: Firebase Cloud Messaging

### 3. Government Compliance
- **Data Localization**: All data stored in India
- **Security Audit**: CERT-In compliance
- **Accessibility**: WCAG 2.1 AA certified
- **Privacy Policy**: GDPR compliant

## Configuration Steps

### 1. Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/vmc_civisense
MONGODB_URI=mongodb://localhost:27017/vmc_civisense

# API Keys
MAPMYINDIA_API_KEY=your_api_key
SMS_API_KEY=your_sms_key
EMAIL_API_KEY=your_email_key
FIREBASE_SERVER_KEY=your_firebase_key

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
SESSION_SECRET=your_session_secret

# VMC Specific
VMC_ADMIN_EMAIL=admin@vmc.gov.in
VMC_HELPDESK_PHONE=0265-242-1111
VMC_ZONE_COUNT=4
VMC_WARD_COUNT=19
```

### 2. Ward Boundary Configuration
Update `/lib/offline-storage.ts` with actual VMC ward boundaries:

```javascript
const vadodaraWards = [
  {
    id: 1,
    name: "Ward 1 - Alkapuri",
    boundaries: [[22.3072, 73.1812], [22.3100, 73.1850], ...], // Actual coordinates
    engineer: "Eng. R.K. Patel",
    zone: "Zone A",
    population: 45000,
    area: 12.5
  },
  // Add all 19 wards with accurate boundaries
];
```

### 3. Employee Database Setup
Initialize with actual VMC employee data:

```javascript
const employees = [
  {
    id: 'FW001',
    name: 'Actual Field Worker Name',
    role: 'FIELD_WORKER',
    ward: 'Ward 1 - Alkapuri',
    zone: 'Zone A',
    phone: '9876543210',
    email: 'fw001@vmc.gov.in'
  },
  // Add all employees
];
```

## Security Configuration

### 1. Authentication
- Implement LDAP/Active Directory integration
- Multi-factor authentication for admin roles
- Session timeout: 30 minutes
- Password policy: 8+ chars, special chars required

### 2. Data Protection
- End-to-end encryption for sensitive data
- Regular automated backups
- Data retention policy: 7 years
- Audit logging for all actions

### 3. Network Security
- VPN access for admin functions
- IP whitelisting for critical operations
- Rate limiting: 100 requests/minute per user
- DDoS protection enabled

## Mobile App Configuration

### 1. PWA Settings
Update `/public/manifest.json`:
```json
{
  "name": "VMC CiviSense - Official",
  "short_name": "VMC CiviSense",
  "start_url": "https://civisense.vmc.gov.in/",
  "scope": "https://civisense.vmc.gov.in/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#1e40af",
  "background_color": "#f9fafb"
}
```

### 2. Offline Capabilities
- Cache size limit: 50MB per device
- Sync interval: Every 15 minutes when online
- Maximum offline storage: 500 issues per device
- Auto-cleanup: Remove synced data after 30 days

## Integration Setup

### 1. MapMyIndia Integration
```javascript
// Add to BaseMap component
const mapConfig = {
  apiKey: process.env.MAPMYINDIA_API_KEY,
  center: [22.3072, 73.1812], // Vadodara center
  zoom: 12,
  layers: ['ward_boundaries', 'issue_markers']
};
```

### 2. Notification System
```javascript
// SMS notifications for critical issues
const smsConfig = {
  provider: 'textlocal',
  apiKey: process.env.SMS_API_KEY,
  sender: 'VMCCIV',
  templates: {
    critical_issue: 'Critical issue reported in {ward}. Issue ID: {id}',
    resolution: 'Issue {id} resolved in {ward}. Thank you.'
  }
};
```

## Testing Procedures

### 1. Functionality Testing
- [ ] Issue reporting with GPS
- [ ] Photo capture and storage
- [ ] Offline mode operation
- [ ] Ward detection accuracy
- [ ] Multi-language support
- [ ] Role-based access control

### 2. Performance Testing
- [ ] Load testing: 100 concurrent users
- [ ] Stress testing: 500 issues/hour
- [ ] Network failure recovery
- [ ] Battery usage optimization
- [ ] Storage efficiency

### 3. Security Testing
- [ ] Penetration testing
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF token validation
- [ ] Data encryption verification

## Go-Live Checklist

### 1. Pre-Launch (1 week before)
- [ ] Final security audit
- [ ] Performance optimization
- [ ] Backup systems tested
- [ ] Staff training completed
- [ ] User manuals distributed

### 2. Launch Day
- [ ] DNS configuration
- [ ] SSL certificate active
- [ ] Monitoring systems enabled
- [ ] Support team ready
- [ ] Rollback plan prepared

### 3. Post-Launch (1 week after)
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Issue resolution tracking
- [ ] System optimization
- [ ] Documentation updates

## Maintenance Schedule

### Daily
- System health monitoring
- Backup verification
- Critical issue alerts
- Performance metrics review

### Weekly
- Security log analysis
- Database optimization
- User activity reports
- System updates

### Monthly
- Full system backup
- Security patch updates
- Performance tuning
- User training sessions

## Support Information

### Technical Support
- **Email**: tech-support@vmc.gov.in
- **Phone**: 0265-242-1111 (Ext: 123)
- **Hours**: 24/7 for critical issues

### User Support
- **Helpdesk**: 0265-242-1111
- **Email**: civisense-help@vmc.gov.in
- **Training**: Monthly sessions for new users

### Emergency Contacts
- **System Admin**: +91-9876543240
- **Database Admin**: +91-9876543241
- **Network Admin**: +91-9876543242

## Compliance Certificates

### Required Certifications
- [ ] CERT-In Security Audit
- [ ] WCAG 2.1 AA Accessibility
- [ ] ISO 27001 Information Security
- [ ] Data Protection Impact Assessment
- [ ] Government Cloud Compliance

### Annual Reviews
- Security audit renewal
- Accessibility compliance check
- Performance benchmark review
- User satisfaction survey
- System capacity planning

---

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Next Review**: July 2024  
**Approved By**: VMC IT Department