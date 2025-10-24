const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = 'enna-secret-key-change-in-production';

// Middleware
app.use(cors({
  origin: true, // Allow all origins for debugging
  credentials: true
}));
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./enna.db');

// Initialize database
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'technicien',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Hardware incidents table
  db.run(`CREATE TABLE IF NOT EXISTS hardware_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    equipment_name TEXT NOT NULL,
    partition TEXT,
    downtime INTEGER DEFAULT 0,
    anomaly TEXT,
    action_taken TEXT,
    state_after_intervention TEXT,
    recommendation TEXT,
    created_by_id INTEGER,
    assigned_to_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_id) REFERENCES users (id),
    FOREIGN KEY (assigned_to_id) REFERENCES users (id)
  )`);

  // Software incidents table
  db.run(`CREATE TABLE IF NOT EXISTS software_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    service_name TEXT NOT NULL,
    software_type TEXT,
    anomaly TEXT,
    action_taken TEXT,
    state_after_intervention TEXT,
    recommendation TEXT,
    created_by_id INTEGER,
    assigned_to_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_id) REFERENCES users (id),
    FOREIGN KEY (assigned_to_id) REFERENCES users (id)
  )`);

  // Reports table - one report per software incident only
  db.run(`CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    software_incident_id INTEGER NOT NULL UNIQUE,
    date TEXT NOT NULL,
    anomaly TEXT NOT NULL,
    analysis TEXT NOT NULL,
    conclusion TEXT NOT NULL,
    created_by_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (software_incident_id) REFERENCES software_incidents (id),
    FOREIGN KEY (created_by_id) REFERENCES users (id)
  )`);

  // Create default users
  const defaultPassword = bcrypt.hashSync('01010101', 10);
  const users = [
    ['admin', defaultPassword, 'superuser', 1],
    ['technicien1', defaultPassword, 'technicien', 1],
    ['technicien2', defaultPassword, 'technicien', 1],
    ['ingenieur1', defaultPassword, 'ingenieur', 1],
    ['ingenieur2', defaultPassword, 'ingenieur', 1],
    ['chefdep1', defaultPassword, 'chefdep', 1],
    ['superuser1', defaultPassword, 'superuser', 1]
  ];

  users.forEach(user => {
    db.run(`INSERT OR IGNORE INTO users (username, password, role, is_active) 
            VALUES (?, ?, ?, ?)`, user);
  });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token d\'authentification requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Authentication routes
app.post('/api/auth/login/', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });
  }

  db.get('SELECT * FROM users WHERE username = ? AND is_active = 1', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur de base de données' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      token,
      user: userWithoutPassword,
      message: 'Connexion réussie'
    });
  });
});

app.post('/api/auth/logout/', authenticateToken, (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

app.get('/api/auth/profile/', authenticateToken, (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

// Incidents routes
app.get('/api/incidents/', authenticateToken, (req, res) => {
  const { type } = req.query;
  
  if (type === 'hardware') {
    // Get hardware incidents
    let query = 'SELECT h.*, u1.username as created_by_username, u2.username as assigned_to_username FROM hardware_incidents h LEFT JOIN users u1 ON h.created_by_id = u1.id LEFT JOIN users u2 ON h.assigned_to_id = u2.id ORDER BY h.created_at DESC';
    const params = [];
    
    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur de base de données' });
      }

      const incidents = rows.map(row => ({
        id: row.id,
        incident_type: 'hardware',
        date: row.date,
        time: row.time,
        description: row.description,
        category: row.category,
        location: row.location,
        equipment_name: row.equipment_name,
        partition: row.partition,
        downtime: parseInt(row.downtime) || 0,
        anomaly: row.anomaly,
        action_taken: row.action_taken,
        state_after_intervention: row.state_after_intervention,
        recommendation: row.recommendation,
        created_by: {
          id: row.created_by_id,
          username: row.created_by_username
        },
        assigned_to: row.assigned_to_id ? {
          id: row.assigned_to_id,
          username: row.assigned_to_username
        } : null,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));

      res.json({ results: incidents, count: incidents.length });
    });
  } else if (type === 'software') {
    // Get software incidents
    let query = 'SELECT s.*, u1.username as created_by_username, u2.username as assigned_to_username FROM software_incidents s LEFT JOIN users u1 ON s.created_by_id = u1.id LEFT JOIN users u2 ON s.assigned_to_id = u2.id ORDER BY s.created_at DESC';
    const params = [];
    
    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur de base de données' });
      }

      const incidents = rows.map(row => ({
        id: row.id,
        incident_type: 'software',
        date: row.date,
        time: row.time,
        description: row.description,
        category: row.category,
        location: row.location,
        service_name: row.service_name,
        software_type: row.software_type,
        anomaly: row.anomaly,
        action_taken: row.action_taken,
        state_after_intervention: row.state_after_intervention,
        recommendation: row.recommendation,
        created_by: {
          id: row.created_by_id,
          username: row.created_by_username
        },
        assigned_to: row.assigned_to_id ? {
          id: row.assigned_to_id,
          username: row.assigned_to_username
        } : null,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));

      res.json({ results: incidents, count: incidents.length });
    });
  } else {
    // Get both types
    const hardwareQuery = 'SELECT h.*, u1.username as created_by_username, u2.username as assigned_to_username FROM hardware_incidents h LEFT JOIN users u1 ON h.created_by_id = u1.id LEFT JOIN users u2 ON h.assigned_to_id = u2.id ORDER BY h.created_at DESC';
    const softwareQuery = 'SELECT s.*, u1.username as created_by_username, u2.username as assigned_to_username FROM software_incidents s LEFT JOIN users u1 ON s.created_by_id = u1.id LEFT JOIN users u2 ON s.assigned_to_id = u2.id ORDER BY s.created_at DESC';
    
    db.all(hardwareQuery, [], (err, hardwareRows) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur de base de données' });
      }
      
      db.all(softwareQuery, [], (err, softwareRows) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur de base de données' });
        }

        const hardwareIncidents = hardwareRows.map(row => ({
          id: row.id,
          incident_type: 'hardware',
          date: row.date,
          time: row.time,
          description: row.description,
          category: row.category,
          location: row.location,
          equipment_name: row.equipment_name,
          partition: row.partition,
          downtime: parseInt(row.downtime) || 0,
          anomaly: row.anomaly,
          action_taken: row.action_taken,
          state_after_intervention: row.state_after_intervention,
          recommendation: row.recommendation,
          created_by: {
            id: row.created_by_id,
            username: row.created_by_username
          },
          assigned_to: row.assigned_to_id ? {
            id: row.assigned_to_id,
            username: row.assigned_to_username
          } : null,
          created_at: row.created_at,
          updated_at: row.updated_at
        }));

        const softwareIncidents = softwareRows.map(row => ({
          id: row.id,
          incident_type: 'software',
          date: row.date,
          time: row.time,
          description: row.description,
          category: row.category,
          location: row.location,
          service_name: row.service_name,
          software_type: row.software_type,
          anomaly: row.anomaly,
          action_taken: row.action_taken,
          state_after_intervention: row.state_after_intervention,
          recommendation: row.recommendation,
          created_by: {
            id: row.created_by_id,
            username: row.created_by_username
          },
          assigned_to: row.assigned_to_id ? {
            id: row.assigned_to_id,
            username: row.assigned_to_username
          } : null,
          created_at: row.created_at,
          updated_at: row.updated_at
        }));

        const allIncidents = [...hardwareIncidents, ...softwareIncidents];
        res.json({ results: allIncidents, count: allIncidents.length });
      });
    });
  }
});

app.post('/api/incidents/', authenticateToken, (req, res) => {
  const {
    incident_type, date, time, description, category, location,
    equipment_name, partition, service_name, downtime, software_type,
    anomaly, action_taken, state_after_intervention, recommendation
  } = req.body;

  // Set default date and time if not provided
  const currentDate = new Date();
  const defaultDate = date || currentDate.toISOString().split('T')[0];
  const defaultTime = time || currentDate.toTimeString().split(' ')[0].substring(0, 5);

  if (incident_type === 'hardware') {
    const query = `INSERT INTO hardware_incidents (
      date, time, description, category, location,
      equipment_name, partition, downtime,
      anomaly, action_taken, state_after_intervention, recommendation, created_by_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [
      defaultDate, defaultTime, description, category, location,
      equipment_name, partition, downtime || 0,
      anomaly, action_taken, state_after_intervention, recommendation, req.user.id
    ], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la création de l\'incident matériel' });
      }

      res.status(201).json({
        id: this.lastID,
        incident_type: 'hardware',
        date: defaultDate, time: defaultTime, description, category, location,
        equipment_name, partition, downtime: parseInt(downtime) || 0,
        anomaly, action_taken, state_after_intervention, recommendation,
        created_by: { id: req.user.id, username: req.user.username },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });
  } else if (incident_type === 'software') {
    const query = `INSERT INTO software_incidents (
      date, time, description, category, location,
      service_name, software_type,
      anomaly, action_taken, state_after_intervention, recommendation, created_by_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [
      defaultDate, defaultTime, description, category, location,
      service_name, software_type,
      anomaly, action_taken, state_after_intervention, recommendation, req.user.id
    ], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la création de l\'incident logiciel' });
      }

      res.status(201).json({
        id: this.lastID,
        incident_type: 'software',
        date: defaultDate, time: defaultTime, description, category, location,
        service_name, software_type,
        anomaly, action_taken, state_after_intervention, recommendation,
        created_by: { id: req.user.id, username: req.user.username },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });
  } else {
    res.status(400).json({ message: 'Type d\'incident invalide. Utilisez "hardware" ou "software".' });
  }
});

app.get('/api/incidents/stats/', authenticateToken, (req, res) => {
  // Get stats from both hardware and software incidents tables
  const hardwareQuery = 'SELECT "hardware" as incident_type, COUNT(*) as count, SUM(downtime) as total_downtime FROM hardware_incidents';
  const softwareQuery = 'SELECT "software" as incident_type, COUNT(*) as count, 0 as total_downtime FROM software_incidents';
  
  db.all(hardwareQuery, [], (err, hardwareStats) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur de base de données' });
    }
    
    db.all(softwareQuery, [], (err, softwareStats) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur de base de données' });
      }
      
      const allStats = [...hardwareStats, ...softwareStats];

      const stats = {
        total_incidents: 0,
        hardware_incidents: 0,
        software_incidents: 0,
        total_downtime_minutes: 0,
        hardware_downtime_minutes: 0,
        software_downtime_minutes: 0,
        average_downtime_minutes: 0
      };

      allStats.forEach(row => {
        stats.total_incidents += row.count;
        stats.total_downtime_minutes += row.total_downtime || 0;
        
        if (row.incident_type === 'hardware') {
          stats.hardware_incidents += row.count;
          stats.hardware_downtime_minutes += row.total_downtime || 0;
        } else if (row.incident_type === 'software') {
          stats.software_incidents += row.count;
          stats.software_downtime_minutes += row.total_downtime || 0;
        }
      });

      // Calculate average downtime
      if (stats.total_incidents > 0) {
        stats.average_downtime_minutes = Math.round(stats.total_downtime_minutes / stats.total_incidents);
      }

      res.json(stats);
    });
  });
});

app.get('/api/incidents/recent/', authenticateToken, (req, res) => {
  // Get recent incidents from both tables
  const hardwareQuery = 'SELECT h.*, "hardware" as incident_type, u1.username as created_by_username, u2.username as assigned_to_username FROM hardware_incidents h LEFT JOIN users u1 ON h.created_by_id = u1.id LEFT JOIN users u2 ON h.assigned_to_id = u2.id ORDER BY h.created_at DESC LIMIT 5';
  const softwareQuery = 'SELECT s.*, "software" as incident_type, u1.username as created_by_username, u2.username as assigned_to_username FROM software_incidents s LEFT JOIN users u1 ON s.created_by_id = u1.id LEFT JOIN users u2 ON s.assigned_to_id = u2.id ORDER BY s.created_at DESC LIMIT 5';

  db.all(hardwareQuery, [], (err, hardwareRows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur de base de données' });
    }
    
    db.all(softwareQuery, [], (err, softwareRows) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur de base de données' });
      }
      
      // Combine and sort by created_at
      const allRows = [...hardwareRows, ...softwareRows];
      allRows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      res.json(allRows.slice(0, 5));
    });
  });
});

app.put('/api/incidents/hardware/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    date, time, description, category, location,
    equipment_name, partition, downtime,
    anomaly, action_taken, state_after_intervention, recommendation
  } = req.body;

  // Set default date and time if not provided
  const currentDate = new Date();
  const defaultDate = date || currentDate.toISOString().split('T')[0];
  const defaultTime = time || currentDate.toTimeString().split(' ')[0].substring(0, 5);

  const query = `UPDATE hardware_incidents SET 
    date = ?, time = ?, description = ?, category = ?, location = ?,
    equipment_name = ?, partition = ?, downtime = ?,
    anomaly = ?, action_taken = ?, state_after_intervention = ?, recommendation = ?,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;

  db.run(query, [
    defaultDate, defaultTime, description, category, location,
    equipment_name, partition, downtime || 0,
    anomaly, action_taken, state_after_intervention, recommendation, id
  ], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'incident matériel' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Incident matériel non trouvé' });
    }

    // Return the updated incident
    db.get('SELECT h.*, u.username as created_by_username FROM hardware_incidents h LEFT JOIN users u ON h.created_by_id = u.id WHERE h.id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'incident' });
      }

      res.json({
        id: row.id,
        incident_type: 'hardware',
        date: row.date,
        time: row.time,
        description: row.description,
        category: row.category,
        location: row.location,
        equipment_name: row.equipment_name,
        partition: row.partition,
        downtime: row.downtime,
        anomaly: row.anomaly,
        action_taken: row.action_taken,
        state_after_intervention: row.state_after_intervention,
        recommendation: row.recommendation,
        created_by: { id: row.created_by_id, username: row.created_by_username },
        created_at: row.created_at,
        updated_at: row.updated_at
      });
    });
  });
});

app.put('/api/incidents/software/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    date, time, description, category, location,
    service_name, software_type,
    anomaly, action_taken, state_after_intervention, recommendation
  } = req.body;

  // Set default date and time if not provided
  const currentDate = new Date();
  const defaultDate = date || currentDate.toISOString().split('T')[0];
  const defaultTime = time || currentDate.toTimeString().split(' ')[0].substring(0, 5);

  const query = `UPDATE software_incidents SET 
    date = ?, time = ?, description = ?, category = ?, location = ?,
    service_name = ?, software_type = ?,
    anomaly = ?, action_taken = ?, state_after_intervention = ?, recommendation = ?,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;

  db.run(query, [
    defaultDate, defaultTime, description, category, location,
    service_name, software_type,
    anomaly, action_taken, state_after_intervention, recommendation, id
  ], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'incident logiciel' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Incident logiciel non trouvé' });
    }

    // Return the updated incident
    db.get('SELECT s.*, u.username as created_by_username FROM software_incidents s LEFT JOIN users u ON s.created_by_id = u.id WHERE s.id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'incident' });
      }

      res.json({
        id: row.id,
        incident_type: 'software',
        date: row.date,
        time: row.time,
        description: row.description,
        category: row.category,
        location: row.location,
        service_name: row.service_name,
        software_type: row.software_type,
        anomaly: row.anomaly,
        action_taken: row.action_taken,
        state_after_intervention: row.state_after_intervention,
        recommendation: row.recommendation,
        created_by: { id: row.created_by_id, username: row.created_by_username },
        created_at: row.created_at,
        updated_at: row.updated_at
      });
    });
  });
});

app.delete('/api/incidents/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM incidents WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la suppression' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Incident non trouvé' });
    }

    res.json({ message: 'Incident supprimé avec succès' });
  });
});

// Reports routes
app.get('/api/reports/', authenticateToken, (req, res) => {
  const { incident } = req.query;
  let query = 'SELECT r.*, u.username as created_by_username FROM reports r LEFT JOIN users u ON r.created_by_id = u.id WHERE 1=1';
  const params = [];

  if (incident) {
    query += ' AND r.software_incident_id = ?';
    params.push(incident);
  }

  query += ' ORDER BY r.created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur de base de données' });
    }

    const reports = rows.map(row => ({
      id: row.id,
      incident: row.software_incident_id,
      incident_type: 'software',
      date: row.date,
      anomaly: row.anomaly,
      analysis: row.analysis,
      conclusion: row.conclusion,
      created_by: {
        id: row.created_by_id,
        username: row.created_by_username
      },
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    res.json({ results: reports, count: reports.length });
  });
});

app.post('/api/reports/', authenticateToken, (req, res) => {
  const { incident, date, anomaly, analysis, conclusion } = req.body;

  // Check if the incident exists and is a software incident
  db.get('SELECT id FROM software_incidents WHERE id = ?', [incident], (err, softwareIncident) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur de base de données' });
    }

    if (!softwareIncident) {
      return res.status(400).json({ message: 'Incident logiciel non trouvé. Les rapports ne peuvent être créés que pour les incidents logiciels.' });
    }

    // Check if report already exists for this software incident
    db.get('SELECT id FROM reports WHERE software_incident_id = ?', [incident], (err, existingReport) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur de base de données' });
      }

      if (existingReport) {
        // Update existing report
        const updateQuery = 'UPDATE reports SET date = ?, anomaly = ?, analysis = ?, conclusion = ?, updated_at = CURRENT_TIMESTAMP WHERE software_incident_id = ?';
        
        db.run(updateQuery, [date, anomaly, analysis, conclusion, incident], function(err) {
          if (err) {
            return res.status(500).json({ message: 'Erreur lors de la mise à jour du rapport' });
          }

          // Return the updated report
          db.get('SELECT r.*, u.username as created_by_username FROM reports r LEFT JOIN users u ON r.created_by_id = u.id WHERE r.software_incident_id = ?', [incident], (err, row) => {
            if (err) {
              return res.status(500).json({ message: 'Erreur lors de la récupération du rapport' });
            }

            res.json({
              id: row.id,
              incident: row.software_incident_id,
              incident_type: 'software',
              date: row.date,
              anomaly: row.anomaly,
              analysis: row.analysis,
              conclusion: row.conclusion,
              created_by: {
                id: row.created_by_id,
                username: row.created_by_username
              },
              created_at: row.created_at,
              updated_at: row.updated_at
            });
          });
        });
      } else {
        // Create new report
        const insertQuery = 'INSERT INTO reports (software_incident_id, date, anomaly, analysis, conclusion, created_by_id) VALUES (?, ?, ?, ?, ?, ?)';

        db.run(insertQuery, [incident, date, anomaly, analysis, conclusion, req.user.id], function(err) {
          if (err) {
            return res.status(500).json({ message: 'Erreur lors de la création du rapport' });
          }

          res.status(201).json({
            id: this.lastID,
            incident: incident,
            incident_type: 'software',
            date, anomaly, analysis, conclusion,
            created_by: { id: req.user.id, username: req.user.username },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      }
    });
  });
});

// Health check
app.get('/api/health/', (req, res) => {
  res.json({ status: 'OK', message: 'ENNA Backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ENNA Backend running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/`);
  console.log(`👥 Default users created with password: 01010101`);
  console.log(`   - technicien1, technicien2, ingenieur1, ingenieur2, chefdep1, superuser1, admin`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});
