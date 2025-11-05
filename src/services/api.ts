// API service for Django backend integration

const API_BASE_URL = 'http://localhost:8000/api';

// Types
export interface User {
  id: number;
  username: string;
  role: 'technicien' | 'ingenieur' | 'chefdep' | 'superuser';
  created_at: string;
}

export interface Incident {
  id: number;
  incident_type: 'hardware' | 'software';
  date: string;
  time: string;
  description: string;
  // Hardware fields
  nom_de_equipement?: string;
  partition?: string;
  numero_de_serie?: string;
  anomalie_observee?: string;
  action_realisee?: string;
  piece_de_rechange_utilisee?: string;
  etat_de_equipement_apres_intervention?: string;
  recommendation?: string;
  duree_arret?: number;
  // Software fields
  simulateur?: boolean;
  salle_operationnelle?: boolean;
  server?: string;
  game?: string;
  group?: string;
  exercice?: string;
  secteur?: string;
  position_STA?: string;
  position_logique?: string;
  type_d_anomalie?: string;
  indicatif?: string;
  mode_radar?: string;
  FL?: string;
  longitude?: string;
  latitude?: string;
  code_SSR?: string;
  sujet?: string;
  commentaires?: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: number;
  incident: number;
  incident_type: 'hardware' | 'software';
  date: string;
  time: string;
  anomaly: string;
  analysis: string;
  conclusion: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export interface IncidentStats {
  total_incidents: number;
  hardware_incidents: number;
  software_incidents: number;
  hardware_downtime_minutes?: number;
  hardware_avg_downtime_minutes?: number | null;
  hardware_incidents_with_downtime?: number;
  hardware_downtime_percentage?: number;
  hardware_last_7_days?: number;
  hardware_last_30_days?: number;
  software_last_7_days?: number;
  software_last_30_days?: number;
}

// API Client
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('enna_token');
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Refresh token from localStorage in case it was updated elsewhere
    if (!this.token) {
      this.token = localStorage.getItem('enna_token');
    }
    
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = response.token;
    this.setToken(response.token);
    localStorage.setItem('enna_token', response.token);
    localStorage.setItem('enna_user', JSON.stringify(response.user));
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout/', {
        method: 'POST',
      });
    } finally {
      this.token = null;
      this.setToken(null);
      localStorage.removeItem('enna_token');
      localStorage.removeItem('enna_user');
    }
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile/');
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return this.request<User>('/auth/profile/update/', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.request('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: newPassword,
      }),
    });
  }

  // Incidents
  async getIncidents(params?: {
    type?: 'hardware' | 'software';
  }): Promise<{ results: Incident[]; count: number }> {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/incidents/?${queryString}` : '/incidents/';
    
    return this.request<{ results: Incident[]; count: number }>(endpoint);
  }

  async getIncident(id: number): Promise<Incident> {
    return this.request<Incident>(`/incidents/${id}/`);
  }

  async createIncident(incidentData: Omit<Incident, 'id' | 'created_at' | 'updated_at'>): Promise<Incident> {
    return this.request<Incident>('/incidents/', {
      method: 'POST',
      body: JSON.stringify(incidentData),
    });
  }

  async updateIncident(id: number, incidentData: Partial<Incident>): Promise<Incident> {
    const incidentType = incidentData.incident_type;
    const endpoint = incidentType === 'hardware' 
      ? `/incidents/hardware/${id}/` 
      : `/incidents/software/${id}/`;
    
    return this.request<Incident>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(incidentData),
    });
  }

  async deleteIncident(id: number): Promise<void> {
    await this.request(`/incidents/${id}/`, {
      method: 'DELETE',
    });
  }

  async getIncidentStats(): Promise<IncidentStats> {
    return this.request<IncidentStats>('/incidents/stats/');
  }

  async getRecentIncidents(): Promise<Incident[]> {
    return this.request<Incident[]>('/incidents/recent/');
  }

  // Reports
  async getReports(params?: { incident?: number }): Promise<{ results: Report[]; count: number }> {
    const searchParams = new URLSearchParams();
    if (params?.incident) searchParams.set('incident', params.incident.toString());
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/reports/?${queryString}` : '/reports/';
    
    return this.request<{ results: Report[]; count: number }>(endpoint);
  }

  async getReport(id: number): Promise<Report> {
    return this.request<Report>(`/reports/${id}/`);
  }

  async createReport(reportData: Omit<Report, 'id' | 'created_at' | 'updated_at'>): Promise<Report> {
    return this.request<Report>('/reports/', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async updateReport(id: number, reportData: Partial<Report>): Promise<Report> {
    return this.request<Report>(`/reports/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    });
  }

  async deleteReport(id: number): Promise<void> {
    await this.request(`/reports/${id}/`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
