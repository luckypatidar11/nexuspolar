import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const ROLE_PERMISSIONS = {
  'Mission Commander': ['overview', 'weather', 'mission', 'geofence', 'planner', 'whatif', 'cargo', 'inventory', 'shipments', 'assets', 'personnel', 'emergency', 'risk', 'voice', 'reports', 'sync'],
  'System Administrator': ['overview', 'weather', 'mission', 'geofence', 'planner', 'whatif', 'cargo', 'inventory', 'shipments', 'assets', 'personnel', 'emergency', 'risk', 'voice', 'reports', 'sync'],
  'Logistics Officer': ['overview', 'weather', 'mission', 'geofence', 'planner', 'whatif', 'cargo', 'inventory', 'shipments', 'reports', 'sync'],
  'Asset Manager': ['overview', 'weather', 'mission', 'geofence', 'assets', 'inventory', 'reports', 'sync'],
  'Medical/Safety Officer': ['overview', 'weather', 'mission', 'geofence', 'personnel', 'emergency', 'risk', 'reports', 'sync'],
  'Scientist/Researcher': ['overview', 'weather', 'mission', 'geofence', 'whatif', 'risk', 'voice', 'reports'],
  'Field Personnel': ['overview', 'weather', 'mission', 'geofence', 'personnel', 'emergency', 'voice', 'sync']
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('nexuspole_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('nexuspole_user');
      return null;
    }
  });

  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    fetch('/api/auth/roles')
      .then(res => res.json())
      .then(data => setAvailableRoles(data))
      .catch(() => {
        // Fallback default roles if backend is initializing
        setAvailableRoles([
          { id: "usr-01", name: "Dr. Rajesh Sharma", role: "Mission Commander", stationId: "ST-BHARATI" },
          { id: "usr-02", name: "Lt. Col. Vikrant Nair", role: "Logistics Officer", stationId: "ST-BHARATI" },
          { id: "usr-03", name: "Priya Sen", role: "Asset Manager", stationId: "ST-BHARATI" },
          { id: "usr-04", name: "Dr. Ananya Mukherjee", role: "Medical/Safety Officer", stationId: "ST-MAITRI" },
          { id: "usr-05", name: "Dr. Kabir Das", role: "Scientist/Researcher", stationId: "ST-BHARATI" },
          { id: "usr-06", name: "Tarun Rawat", role: "Field Personnel", stationId: "ST-BHARATI" },
          { id: "usr-07", name: "System Administrator", role: "System Administrator", stationId: "HQ-GOA" }
        ]);
      });
  }, []);

  const signIn = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to sign in');
    setCurrentUser(data.user);
    localStorage.setItem('nexuspole_user', JSON.stringify(data.user));
    localStorage.setItem('nexuspole_token', data.token);
  };

  const signOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('nexuspole_user');
    localStorage.removeItem('nexuspole_token');
  };

  const switchRole = (roleName) => {
    const found = availableRoles.find(r => r.role === roleName);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('nexuspole_user', JSON.stringify(found));
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, availableRoles, signIn, signOut, switchRole, canAccess: (tab) => Boolean(currentUser && ROLE_PERMISSIONS[currentUser.role]?.includes(tab)) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
