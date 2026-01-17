# OTP-Based Password Reset - Updated API Documentation

## 🔐 New Password Reset Flow (OTP-Based)

### Why OTP is Better for PWA/Mobile:
- ✅ **No app switching** - User stays in your PWA
- ✅ **Better UX** - Immediate verification in same interface
- ✅ **Mobile-friendly** - No email link clicking issues
- ✅ **Faster** - 6-digit code vs long URLs
- ✅ **Offline-ready** - Can cache OTP temporarily

---

## 📱 3-Step Password Reset Process

### Step 1: Request OTP
**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "engineer@vmc.gov.in"
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP sent successfully",
  "data": {
    "message": "If email exists, OTP has been sent"
  }
}
```

### Step 2: Verify OTP
**POST** `/auth/verify-otp`

**Request Body:**
```json
{
  "email": "engineer@vmc.gov.in",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP verified successfully",
  "data": {
    "message": "OTP verified successfully",
    "verified": true
  }
}
```

**Error Response (400) - Invalid OTP:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid or expired OTP",
  "data": null
}
```

**Error Response (400) - Too Many Attempts:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Too many failed attempts. Please request a new OTP",
  "data": null
}
```

### Step 3: Reset Password
**POST** `/auth/reset-password`

**Request Body:**
```json
{
  "email": "engineer@vmc.gov.in",
  "otp": "123456",
  "newPassword": "NewSecure@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successful",
  "data": {
    "message": "Password reset successfully"
  }
}
```

---

## 🔒 Security Features

### OTP Security:
- **6-digit numeric OTP** - Easy to type on mobile
- **10-minute expiration** - Short window for security
- **3 attempt limit** - Prevents brute force attacks
- **One-time use** - OTP invalidated after successful reset
- **Auto-invalidation** - Previous OTPs cancelled when new one requested

### Rate Limiting:
- **Max 3 verification attempts** per OTP
- **OTP expires after 10 minutes**
- **Failed attempts tracked** and logged

---

## 📧 Email Template

The OTP email includes:
- **Large, clear OTP display** - Easy to read on mobile
- **10-minute expiration notice**
- **Mobile-optimized design**
- **Professional VMC branding**

---

## 🚀 Frontend Implementation

### React Hook for Password Reset:

```javascript
const usePasswordReset = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const requestOtp = async (email) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      setEmail(email);
      setStep(2);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otpCode) => {
    setLoading(true);
    try {
      await apiClient.post('/auth/verify-otp', { email, otp: otpCode });
      setOtp(otpCode);
      setStep(3);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (newPassword) => {
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  return { step, requestOtp, verifyOtp, resetPassword, loading };
};
```

### Complete Password Reset Component:

```javascript
const PasswordResetFlow = () => {
  const { step, requestOtp, verifyOtp, resetPassword, loading } = usePasswordReset();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const result = await requestOtp(email);
    if (!result.success) {
      alert(result.message);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const result = await verifyOtp(otp);
    if (!result.success) {
      alert(result.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const result = await resetPassword(newPassword);
    if (result.success) {
      alert('Password reset successfully! Please login.');
      window.location.href = '/login';
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="password-reset-container">
      {step === 1 && (
        <form onSubmit={handleEmailSubmit}>
          <h2>Reset Password</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpSubmit}>
          <h2>Enter OTP</h2>
          <p>We've sent a 6-digit code to {email}</p>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            pattern="[0-9]{6}"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button type="button" onClick={() => setStep(1)}>
            Back to Email
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handlePasswordSubmit}>
          <h2>Set New Password</h2>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
};
```

### OTP Input Component (Mobile-Optimized):

```javascript
const OtpInput = ({ value, onChange, length = 6 }) => {
  const inputs = useRef([]);

  const handleChange = (index, val) => {
    const newOtp = value.split('');
    newOtp[index] = val;
    onChange(newOtp.join(''));

    // Auto-focus next input
    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="otp-input-container">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="otp-digit"
        />
      ))}
    </div>
  );
};
```

---

## 📊 Comparison: Link vs OTP

| Feature | Email Link | OTP Code |
|---------|------------|----------|
| **Mobile UX** | ❌ App switching required | ✅ Stay in PWA |
| **Speed** | ❌ Slow (email → click → redirect) | ✅ Fast (type 6 digits) |
| **Offline** | ❌ Requires internet for link | ✅ Can cache OTP |
| **Security** | ✅ Long random token | ✅ Short-lived numeric |
| **User Error** | ❌ Link expiry confusion | ✅ Clear OTP validation |
| **Accessibility** | ❌ Complex for elderly users | ✅ Simple 6-digit input |

## 🎯 Result: **OTP is Perfect for PWA/Mobile!**

Your users will have a seamless password reset experience without leaving your app! 🚀