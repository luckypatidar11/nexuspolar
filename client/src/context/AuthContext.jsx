import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const DEMO_USERS = [
  { id: 'usr-01', email: 'commander@nexuspole.gov.in', name: 'Dr. Rajesh Sharma', role: 'Mission Commander', stationId: 'ST-BHARATI' },
  { id: 'usr-02', email: 'logistics@nexuspole.gov.in', name: 'Lt. Col. Vikrant Nair', role: 'Logistics Officer', stationId: 'ST-BHARATI' },
  { id: 'usr-03', email: 'asset@nexuspole.gov.in', name: 'Priya Sen', role: 'Asset Manager', stationId: 'ST-BHARATI' },
  { id: 'usr-04', email: 'medical@nexuspole.gov.in', name: 'Dr. Ananya Mukherjee', role: 'Medical/Safety Officer', stationId: 'ST-MAITRI' },
  { id: 'usr-05', email: 'researcher@nexuspole.gov.in', name: 'Dr. Kabir Das', role: 'Scientist/Researcher', stationId: 'ST-BHARATI' },
  { id: 'usr-06', email: 'field@nexuspole.gov.in', name: 'Tarun Rawat', role: 'Field Personnel', stationId: 'ST-BHARATI' },
  { id: 'usr-07', email: 'admin@nexuspole.gov.in', name: 'System Administrator', role: 'System Administrator', stationId: 'HQ-GOA' }
];
const DEMO_PASSWORD = 'demo123';

const getSavedUser = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('nexuspole_user'));
    return DEMO_USERS.find(user => user.id === saved?.id) || null;
  } catch {
    localStorage.removeItem('nexuspole_user');
    return null;
  }
};

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
  const [currentUser, setCurrentUser] = useState(getSavedUser);
  const availableRoles = DEMO_USERS;

  const signIn = (email, password) => {
    const user = DEMO_USERS.find(profile => profile.email === email);
    if (!user || password !== DEMO_PASSWORD) {
      throw new Error('Check the demo email and password, then try again.');
    }
    setCurrentUser(user);
    localStorage.setItem('nexuspole_user', JSON.stringify(user));
    localStorage.removeItem('nexuspole_token');
  };

  const signOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('nexuspole_user');
    localStorage.removeItem('nexuspole_token');
  };

  const switchRole = (roleName) => {
    const found = DEMO_USERS.find(user => user.role === roleName);
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
