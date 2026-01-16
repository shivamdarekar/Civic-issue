# Frontend Quick Reference Guide

## 🚀 Common Implementation Patterns

### 1. Authentication Setup

```javascript
// API Client Setup
const API_BASE_URL = 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. Login Implementation

```javascript
// Login Function
const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    const { token, user } = response.data.data;
    
    // Store token and user data
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed',
    };
  }
};

// Usage in React component
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      // Redirect based on user role
      if (result.user.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else if (result.user.role === 'WARD_ENGINEER') {
        navigate('/engineer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      alert(result.message);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### 3. User Registration (Admin Only)

```javascript
const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/admin/register', userData);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Registration failed',
      errors: error.response?.data?.errors || [],
    };
  }
};

// Registration Form Component
const UserRegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'FIELD_WORKER',
    department: '',
    wardId: '',
    zoneId: '',
  });
  
  const [zones, setZones] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    // Load zones and departments
    const loadData = async () => {
      const [zonesRes, deptsRes] = await Promise.all([
        apiClient.get('/admin/zones-wards'),
        apiClient.get('/admin/departments'),
      ]);
      
      setZones(zonesRes.data.data);
      setDepartments(deptsRes.data.data);
    };
    
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await registerUser(formData);
    
    if (result.success) {
      alert('User registered successfully!');
      // Reset form or redirect
    } else {
      alert(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.fullName}
        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
        placeholder="Full Name"
        required
      />
      
      <select
        value={formData.role}
        onChange={(e) => setFormData({...formData, role: e.target.value})}
        required
      >
        <option value="FIELD_WORKER">Field Worker</option>
        <option value="WARD_ENGINEER">Ward Engineer</option>
        <option value="ZONE_OFFICER">Zone Officer</option>
      </select>
      
      {formData.role === 'WARD_ENGINEER' && (
        <select
          value={formData.department}
          onChange={(e) => setFormData({...formData, department: e.target.value})}
          required
        >
          <option value="">Select Department</option>
          {departments.map(dept => (
            <option key={dept.value} value={dept.value}>
              {dept.label}
            </option>
          ))}
        </select>
      )}
      
      <button type="submit">Register User</button>
    </form>
  );
};
```

### 4. Issue Creation with Photo Upload

```javascript
const createIssue = async (issueData, photoFile) => {
  try {
    const formData = new FormData();
    formData.append('latitude', issueData.latitude);
    formData.append('longitude', issueData.longitude);
    formData.append('categoryId', issueData.categoryId);
    formData.append('description', issueData.description);
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    const response = await apiClient.post('/issues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create issue',
    };
  }
};

// Issue Creation Form
const IssueForm = () => {
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Get user's location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Location error:', error);
      }
    );
  }, []);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const response = await apiClient.get('/issues/categories');
      setCategories(response.data.data);
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location) {
      alert('Location is required');
      return;
    }

    const formData = new FormData(e.target);
    const issueData = {
      latitude: location.latitude,
      longitude: location.longitude,
      categoryId: formData.get('categoryId'),
      description: formData.get('description'),
    };

    const result = await createIssue(issueData, photo);
    
    if (result.success) {
      alert(`Issue created! Ticket: ${result.data.ticketNumber}`);
    } else {
      alert(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select name="categoryId" required>
        <option value="">Select Category</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      
      <textarea
        name="description"
        placeholder="Describe the issue..."
        required
      />
      
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setPhoto(e.target.files[0])}
        required
      />
      
      {location && (
        <p>Location: {location.latitude}, {location.longitude}</p>
      )}
      
      <button type="submit">Report Issue</button>
    </form>
  );
};
```

### 5. Dashboard Data Fetching

```javascript
// Dashboard Hook
const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/admin/dashboard');
        setData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { data, loading, error };
};

// Dashboard Component
const Dashboard = () => {
  const { data, loading, error } = useDashboard();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Issues</h3>
          <p>{data.totalIssues}</p>
        </div>
        <div className="stat-card">
          <h3>Open Issues</h3>
          <p>{data.open}</p>
        </div>
        <div className="stat-card">
          <h3>SLA Breached</h3>
          <p>{data.slaBreached}</p>
        </div>
        <div className="stat-card">
          <h3>Resolution Rate</h3>
          <p>{data.resolutionRatePercent}%</p>
        </div>
      </div>
    </div>
  );
};
```

### 6. Password Reset Flow

```javascript
// Forgot Password
const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return { success: true, message: response.data.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send reset email',
    };
  }
};

// Reset Password
const resetPassword = async (token, newPassword) => {
  try {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return { success: true, message: response.data.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to reset password',
    };
  }
};

// Reset Password Component
const ResetPassword = () => {
  const [token] = useState(new URLSearchParams(window.location.search).get('token'));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const result = await resetPassword(token, newPassword);
    
    if (result.success) {
      alert('Password reset successfully! Please login.');
      window.location.href = '/login';
    } else {
      alert(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
      <button type="submit">Reset Password</button>
    </form>
  );
};
```

### 7. Role-Based Route Protection

```javascript
// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user.id) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

// Route Setup
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
          <AdminRoutes />
        </ProtectedRoute>
      } />
      
      <Route path="/engineer/*" element={
        <ProtectedRoute allowedRoles={['WARD_ENGINEER']}>
          <EngineerRoutes />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
};
```

## 🎯 Key Points for Frontend Team

1. **Always handle loading states** - Show spinners/skeletons
2. **Implement proper error handling** - User-friendly messages
3. **Use optimistic updates** - Update UI immediately, rollback on error
4. **Cache API responses** - Reduce unnecessary requests
5. **Implement offline support** - Store data locally, sync when online
6. **Handle file uploads properly** - Show progress, handle large files
7. **Validate forms client-side** - But always validate server-side too
8. **Use proper TypeScript types** - Based on API response structures

## 📱 Mobile Considerations

- Use GPS for location capture
- Implement camera integration for photo capture
- Handle offline scenarios
- Optimize for touch interfaces
- Consider PWA features

## 🔧 Recommended Libraries

- **HTTP Client**: Axios
- **State Management**: Redux Toolkit / Zustand
- **Forms**: React Hook Form
- **UI Components**: Material-UI / Ant Design
- **Maps**: Google Maps / Mapbox
- **File Upload**: React Dropzone
- **Date Handling**: date-fns / dayjs