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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Hardware incidents table
  db.run(`CREATE TABLE IF NOT EXISTS hardware_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    nom_de_equipement TEXT NOT NULL,
    partition TEXT,
    numero_de_serie TEXT,
    description TEXT NOT NULL,
    anomalie_observee TEXT,
    action_realisee TEXT,
    piece_de_rechange_utilisee TEXT,
    etat_de_equipement_apres_intervention TEXT,
    recommendation TEXT,
    duree_arret INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Software incidents table
  db.run(`CREATE TABLE IF NOT EXISTS software_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    simulateur BOOLEAN DEFAULT 0,
    salle_operationnelle BOOLEAN DEFAULT 0,
    server TEXT,
    game TEXT,
    partition TEXT,
    "group" TEXT,
    exercice TEXT,
    secteur TEXT,
    position_STA TEXT,
    position_logique TEXT,
    type_d_anomalie TEXT,
    indicatif TEXT,
    mode_radar TEXT,
    FL TEXT,
    longitude TEXT,
    latitude TEXT,
    code_SSR TEXT,
    sujet TEXT,
    description TEXT NOT NULL,
    commentaires TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Reports table - one report per software incident only
  db.run(`CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    software_incident_id INTEGER NOT NULL UNIQUE,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    anomaly TEXT NOT NULL,
    analysis TEXT NOT NULL,
    conclusion TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (software_incident_id) REFERENCES software_incidents (id)
  )`);

  // Create default users
  const defaultPassword = bcrypt.hashSync('01010101', 10);
  const users = [
    ['admin', defaultPassword, 'superuser'],
    ['technicien1', defaultPassword, 'technicien'],
    ['technicien2', defaultPassword, 'technicien'],
    ['ingenieur1', defaultPassword, 'ingenieur'],
    ['ingenieur2', defaultPassword, 'ingenieur'],
    ['chefdep1', defaultPassword, 'chefdep'],
    ['superuser1', defaultPassword, 'superuser']
  ];

  users.forEach(user => {
    db.run(`INSERT OR IGNORE INTO users (username, password, role) 
            VALUES (?, ?, ?)`, [user[0], user[1], user[2]]);
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

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
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
    let query = 'SELECT * FROM hardware_incidents ORDER BY created_at DESC';
    const params = [];
    
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Database error fetching hardware incidents:', err);
        return res.status(500).json({ message: 'Erreur de base de données: ' + err.message });
      }

      const incidents = rows.map(row => ({
        id: row.id,
        incident_type: 'hardware',
        date: row.date,
        time: row.time,
        nom_de_equipement: row.nom_de_equipement,
        partition: row.partition,
        numero_de_serie: row.numero_de_serie,
        description: row.description,
        anomalie_observee: row.anomalie_observee,
        action_realisee: row.action_realisee,
        piece_de_rechange_utilisee: row.piece_de_rechange_utilisee,
        etat_de_equipement_apres_intervention: row.etat_de_equipement_apres_intervention,
        recommendation: row.recommendation,
        duree_arret: row.duree_arret,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));

      res.json({ results: incidents, count: incidents.length });
    });
  } else if (type === 'software') {
    // Get software incidents
    let query = 'SELECT * FROM software_incidents ORDER BY created_at DESC';
    const params = [];
    
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Database error fetching software incidents:', err);
        return res.status(500).json({ message: 'Erreur de base de données: ' + err.message });
      }

      const incidents = rows.map(row => ({
        id: row.id,
        incident_type: 'software',
        date: row.date,
        time: row.time,
        simulateur: row.simulateur === 1 || row.simulateur === true,
        salle_operationnelle: row.salle_operationnelle === 1 || row.salle_operationnelle === true,
        server: row.server,
        game: row.game,
        partition: row.partition,
        group: row.group,
        exercice: row.exercice,
        secteur: row.secteur,
        position_STA: row.position_STA,
        position_logique: row.position_logique,
        type_d_anomalie: row.type_d_anomalie,
        indicatif: row.indicatif,
        mode_radar: row.mode_radar,
        FL: row.FL,
        longitude: row.longitude,
        latitude: row.latitude,
        code_SSR: row.code_SSR,
        sujet: row.sujet,
        description: row.description,
        commentaires: row.commentaires,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));

      res.json({ results: incidents, count: incidents.length });
    });
  } else {
    // Get both types
    const hardwareQuery = 'SELECT * FROM hardware_incidents ORDER BY created_at DESC';
    const softwareQuery = 'SELECT * FROM software_incidents ORDER BY created_at DESC';
    
    db.all(hardwareQuery, [], (err, hardwareRows) => {
      if (err) {
        console.error('Database error fetching hardware incidents:', err);
        return res.status(500).json({ message: 'Erreur de base de données: ' + err.message });
      }
      
      db.all(softwareQuery, [], (err, softwareRows) => {
        if (err) {
          console.error('Database error fetching software incidents:', err);
          return res.status(500).json({ message: 'Erreur de base de données: ' + err.message });
        }

        const hardwareIncidents = hardwareRows.map(row => ({
          id: row.id,
          incident_type: 'hardware',
          date: row.date,
          time: row.time,
          nom_de_equipement: row.nom_de_equipement,
          partition: row.partition,
          numero_de_serie: row.numero_de_serie,
          description: row.description,
          anomalie_observee: row.anomalie_observee,
          action_realisee: row.action_realisee,
          piece_de_rechange_utilisee: row.piece_de_rechange_utilisee,
          etat_de_equipement_apres_intervention: row.etat_de_equipement_apres_intervention,
          recommendation: row.recommendation,
          duree_arret: row.duree_arret,
          created_at: row.created_at,
          updated_at: row.updated_at
        }));

        const softwareIncidents = softwareRows.map(row => ({
          id: row.id,
          incident_type: 'software',
          date: row.date,
          time: row.time,
          simulateur: row.simulateur === 1 || row.simulateur === true,
          salle_operationnelle: row.salle_operationnelle === 1 || row.salle_operationnelle === true,
          server: row.server,
          game: row.game,
          partition: row.partition,
          group: row.group,
          exercice: row.exercice,
          secteur: row.secteur,
          position_STA: row.position_STA,
          position_logique: row.position_logique,
          type_d_anomalie: row.type_d_anomalie,
          indicatif: row.indicatif,
          mode_radar: row.mode_radar,
          FL: row.FL,
          longitude: row.longitude,
          latitude: row.latitude,
          code_SSR: row.code_SSR,
          sujet: row.sujet,
          description: row.description,
          commentaires: row.commentaires,
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
  const { incident_type } = req.body;

  // Set default date and time if not provided (GMT/UTC)
  const currentDate = new Date();
  const defaultDate = req.body.date || currentDate.toISOString().split('T')[0];
  // Use explicit UTC methods to ensure GMT time
  const utcHours = String(currentDate.getUTCHours()).padStart(2, '0');
  const utcMinutes = String(currentDate.getUTCMinutes()).padStart(2, '0');
  const defaultTime = req.body.time || `${utcHours}:${utcMinutes}`;

  if (incident_type === 'hardware') {
    const {
      date, time, nom_de_equipement, partition, numero_de_serie,
      description, anomalie_observee, action_realisee,
      piece_de_rechange_utilisee, etat_de_equipement_apres_intervention, recommendation, duree_arret
    } = req.body;

    // Validate required fields
    if (!nom_de_equipement || nom_de_equipement.trim() === '') {
      return res.status(400).json({ message: 'Le nom de l\'équipement est requis' });
    }
    if (!description || description.trim() === '') {
      return res.status(400).json({ message: 'La description est requise' });
    }

    // Handle undefined, null, or empty string values
    const cleanValue = (val) => (val === undefined || val === null || val === '') ? null : val;
    const cleanInt = (val) => {
      if (val === undefined || val === null || val === '') return null;
      const parsed = parseInt(val);
      return isNaN(parsed) ? null : parsed;
    };

    const query = `INSERT INTO hardware_incidents (
      date, time, nom_de_equipement, partition, numero_de_serie,
      description, anomalie_observee, action_realisee,
      piece_de_rechange_utilisee, etat_de_equipement_apres_intervention, recommendation, duree_arret
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [
      defaultDate, defaultTime, nom_de_equipement, cleanValue(partition), cleanValue(numero_de_serie),
      description, cleanValue(anomalie_observee), cleanValue(action_realisee),
      cleanValue(piece_de_rechange_utilisee), cleanValue(etat_de_equipement_apres_intervention), cleanValue(recommendation), cleanInt(duree_arret)
    ], function(err) {
      if (err) {
        console.error('Database error creating hardware incident:', err);
        return res.status(500).json({ message: 'Erreur lors de la création de l\'incident matériel: ' + err.message });
      }

      // Fetch the created incident
      db.get('SELECT * FROM hardware_incidents WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors de la récupération de l\'incident' });
        }

        res.status(201).json({
          id: row.id,
          incident_type: 'hardware',
          date: row.date,
          time: row.time,
          nom_de_equipement: row.nom_de_equipement,
          partition: row.partition,
          numero_de_serie: row.numero_de_serie,
          description: row.description,
          anomalie_observee: row.anomalie_observee,
          action_realisee: row.action_realisee,
          piece_de_rechange_utilisee: row.piece_de_rechange_utilisee,
          etat_de_equipement_apres_intervention: row.etat_de_equipement_apres_intervention,
          recommendation: row.recommendation,
          duree_arret: row.duree_arret,
          created_at: row.created_at,
          updated_at: row.updated_at
        });
      });
    });
  } else if (incident_type === 'software') {
    const {
      date, time, simulateur, salle_operationnelle, server, game, partition, group,
      exercice, secteur, position_STA, position_logique, type_d_anomalie,
      indicatif, mode_radar, FL, longitude, latitude, code_SSR,
      sujet, description, commentaires
    } = req.body;

    // Validate required fields
    if (!description || description.trim() === '') {
      return res.status(400).json({ message: 'La description est requise' });
    }

    const query = `INSERT INTO software_incidents (
      date, time, simulateur, salle_operationnelle, server, game, partition, "group",
      exercice, secteur, position_STA, position_logique, type_d_anomalie,
      indicatif, mode_radar, FL, longitude, latitude, code_SSR,
      sujet, description, commentaires
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Handle undefined, null, or empty string values
    const cleanValue = (val) => (val === undefined || val === null || val === '') ? null : val;
    
    db.run(query, [
      defaultDate, defaultTime,
      simulateur ? 1 : 0, salle_operationnelle ? 1 : 0,
      cleanValue(server), cleanValue(game), cleanValue(partition), cleanValue(group), cleanValue(exercice), cleanValue(secteur),
      cleanValue(position_STA), cleanValue(position_logique), cleanValue(type_d_anomalie),
      cleanValue(indicatif), cleanValue(mode_radar), cleanValue(FL), cleanValue(longitude), cleanValue(latitude), cleanValue(code_SSR),
      cleanValue(sujet), description, cleanValue(commentaires)
    ], function(err) {
      if (err) {
        console.error('Database error creating software incident:', err);
        return res.status(500).json({ message: 'Erreur lors de la création de l\'incident logiciel: ' + err.message });
      }

      // Fetch the created incident
      db.get('SELECT * FROM software_incidents WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors de la récupération de l\'incident' });
        }

        res.status(201).json({
          id: row.id,
          incident_type: 'software',
          date: row.date,
          time: row.time,
          simulateur: row.simulateur === 1 || row.simulateur === true,
          salle_operationnelle: row.salle_operationnelle === 1 || row.salle_operationnelle === true,
          server: row.server,
          game: row.game,
          partition: row.partition,
          group: row.group,
          exercice: row.exercice,
          secteur: row.secteur,
          position_STA: row.position_STA,
          position_logique: row.position_logique,
          type_d_anomalie: row.type_d_anomalie,
          indicatif: row.indicatif,
          mode_radar: row.mode_radar,
          FL: row.FL,
          longitude: row.longitude,
          latitude: row.latitude,
          code_SSR: row.code_SSR,
          sujet: row.sujet,
          description: row.description,
          commentaires: row.commentaires,
          created_at: row.created_at,
          updated_at: row.updated_at
        });
      });
    });
  } else {
    res.status(400).json({ message: 'Type d\'incident invalide. Utilisez "hardware" ou "software".' });
  }
});

app.get('/api/incidents/stats/', authenticateToken, (req, res) => {
  // Get stats from both hardware and software incidents tables
  // Use SUM with CASE to handle NULL values correctly - only sum non-null values > 0
  const hardwareQuery = `SELECT 
    "hardware" as incident_type, 
    COUNT(*) as count, 
    COALESCE(SUM(CASE WHEN duree_arret IS NOT NULL AND duree_arret > 0 THEN duree_arret ELSE 0 END), 0) as total_downtime, 
    AVG(CASE WHEN duree_arret IS NOT NULL AND duree_arret > 0 THEN duree_arret ELSE NULL END) as avg_downtime 
    FROM hardware_incidents`;
  const softwareQuery = 'SELECT "software" as incident_type, COUNT(*) as count FROM software_incidents';
  
  db.all(hardwareQuery, [], (err, hardwareStats) => {
    if (err) {
      console.error('Database error fetching hardware stats:', err);
      return res.status(500).json({ message: 'Erreur de base de données: ' + err.message });
    }
    
    db.all(softwareQuery, [], (err, softwareStats) => {
      if (err) {
        console.error('Database error fetching software stats:', err);
        return res.status(500).json({ message: 'Erreur de base de données: ' + err.message });
      }
      
      const hardwareRow = hardwareStats[0] || {};
      const softwareRow = softwareStats[0] || {};
      
      const hardwareCount = parseInt(hardwareRow.count) || 0;
      const softwareCount = parseInt(softwareRow.count) || 0;
      
      // Only calculate downtime from incidents that have duree_arret set (not NULL and > 0)
      // Don't calculate automatically - only use manually entered values
      const totalDowntime = hardwareRow.total_downtime !== null && hardwareRow.total_downtime !== undefined 
        ? parseInt(hardwareRow.total_downtime) || 0 
        : 0;
      const avgDowntime = hardwareRow.avg_downtime !== null && hardwareRow.avg_downtime !== undefined
        ? Math.round(parseFloat(hardwareRow.avg_downtime))
        : null;
      
      // Get incidents with downtime for percentage calculations
      db.get('SELECT COUNT(*) as count FROM hardware_incidents WHERE duree_arret IS NOT NULL AND duree_arret > 0', [], (err, downtimeIncidents) => {
        if (err) {
          console.error('Database error counting downtime incidents:', err);
        }
        
        // Get recent incidents count (last 7 days, last 30 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        db.get('SELECT COUNT(*) as count FROM hardware_incidents WHERE date >= ?', [sevenDaysAgo.toISOString().split('T')[0]], (err, last7Days) => {
          if (err) console.error('Error counting last 7 days:', err);
          
          db.get('SELECT COUNT(*) as count FROM hardware_incidents WHERE date >= ?', [thirtyDaysAgo.toISOString().split('T')[0]], (err, last30Days) => {
            if (err) console.error('Error counting last 30 days:', err);
            
            db.get('SELECT COUNT(*) as count FROM software_incidents WHERE date >= ?', [sevenDaysAgo.toISOString().split('T')[0]], (err, softwareLast7Days) => {
              if (err) console.error('Error counting software last 7 days:', err);
              
              db.get('SELECT COUNT(*) as count FROM software_incidents WHERE date >= ?', [thirtyDaysAgo.toISOString().split('T')[0]], (err, softwareLast30Days) => {
                if (err) console.error('Error counting software last 30 days:', err);
                
                const stats = {
                  total_incidents: hardwareCount + softwareCount,
                  hardware_incidents: hardwareCount,
                  software_incidents: softwareCount,
                  hardware_downtime_minutes: totalDowntime,
                  hardware_avg_downtime_minutes: avgDowntime,
                  hardware_incidents_with_downtime: (downtimeIncidents?.count || 0),
                  hardware_downtime_percentage: hardwareCount > 0 ? Math.round(((downtimeIncidents?.count || 0) / hardwareCount) * 100) : 0,
                  hardware_last_7_days: (last7Days?.count || 0),
                  hardware_last_30_days: (last30Days?.count || 0),
                  software_last_7_days: (softwareLast7Days?.count || 0),
                  software_last_30_days: (softwareLast30Days?.count || 0),
                };

                res.json(stats);
              });
            });
          });
        });
      });
    });
  });
});

app.get('/api/incidents/recent/', authenticateToken, (req, res) => {
  // Get recent incidents from both tables
  const hardwareQuery = 'SELECT * FROM hardware_incidents ORDER BY created_at DESC LIMIT 5';
  const softwareQuery = 'SELECT * FROM software_incidents ORDER BY created_at DESC LIMIT 5';

  db.all(hardwareQuery, [], (err, hardwareRows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur de base de données' });
    }
    
    db.all(softwareQuery, [], (err, softwareRows) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur de base de données' });
      }
      
      // Format hardware rows
      const formattedHardware = hardwareRows.map(row => ({
        ...row,
        incident_type: 'hardware'
      }));
      
      // Format software rows
      const formattedSoftware = softwareRows.map(row => ({
        ...row,
        incident_type: 'software',
        simulateur: row.simulateur === 1 || row.simulateur === true,
        salle_operationnelle: row.salle_operationnelle === 1 || row.salle_operationnelle === true
      }));
      
      // Combine and sort by created_at
      const allRows = [...formattedHardware, ...formattedSoftware];
      allRows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      res.json(allRows.slice(0, 5));
    });
  });
});

app.put('/api/incidents/hardware/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    date, time, nom_de_equipement, partition, numero_de_serie,
    description, anomalie_observee, action_realisee,
    piece_de_rechange_utilisee, etat_de_equipement_apres_intervention, recommendation
  } = req.body;

  // Set default date and time if not provided (GMT/UTC)
  const currentDate = new Date();
  const defaultDate = date || currentDate.toISOString().split('T')[0];
  // Use explicit UTC methods to ensure GMT time
  const utcHours = String(currentDate.getUTCHours()).padStart(2, '0');
  const utcMinutes = String(currentDate.getUTCMinutes()).padStart(2, '0');
  const defaultTime = time || `${utcHours}:${utcMinutes}`;

  const cleanInt = (val) => {
    if (val === undefined || val === null || val === '') return null;
    const parsed = parseInt(val);
    return isNaN(parsed) ? null : parsed;
  };

  const query = `UPDATE hardware_incidents SET 
    date = ?, time = ?, nom_de_equipement = ?, partition = ?, numero_de_serie = ?,
    description = ?, anomalie_observee = ?, action_realisee = ?,
    piece_de_rechange_utilisee = ?, etat_de_equipement_apres_intervention = ?, recommendation = ?, duree_arret = ?,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;

  db.run(query, [
    defaultDate, defaultTime, nom_de_equipement, partition, numero_de_serie,
    description, anomalie_observee, action_realisee,
    piece_de_rechange_utilisee, etat_de_equipement_apres_intervention, recommendation, cleanInt(req.body.duree_arret), id
  ], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'incident matériel' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Incident matériel non trouvé' });
    }

    // Return the updated incident
    db.get('SELECT * FROM hardware_incidents WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'incident' });
      }

      res.json({
        id: row.id,
        incident_type: 'hardware',
        date: row.date,
        time: row.time,
        nom_de_equipement: row.nom_de_equipement,
        partition: row.partition,
        numero_de_serie: row.numero_de_serie,
        description: row.description,
        anomalie_observee: row.anomalie_observee,
        action_realisee: row.action_realisee,
        piece_de_rechange_utilisee: row.piece_de_rechange_utilisee,
        etat_de_equipement_apres_intervention: row.etat_de_equipement_apres_intervention,
        recommendation: row.recommendation,
        duree_arret: row.duree_arret,
        created_at: row.created_at,
        updated_at: row.updated_at
      });
    });
  });
});

app.put('/api/incidents/software/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    date, time, simulateur, salle_operationnelle, server, game, partition, group,
    exercice, secteur, position_STA, position_logique, type_d_anomalie,
    indicatif, mode_radar, FL, longitude, latitude, code_SSR,
    sujet, description, commentaires
  } = req.body;

  // Set default date and time if not provided (GMT/UTC)
  const currentDate = new Date();
  const defaultDate = date || currentDate.toISOString().split('T')[0];
  // Use explicit UTC methods to ensure GMT time
  const utcHours = String(currentDate.getUTCHours()).padStart(2, '0');
  const utcMinutes = String(currentDate.getUTCMinutes()).padStart(2, '0');
  const defaultTime = time || `${utcHours}:${utcMinutes}`;

  // Handle undefined, null, or empty string values
  const cleanValue = (val) => (val === undefined || val === null || val === '') ? null : val;

  const query = `UPDATE software_incidents SET 
    date = ?, time = ?, simulateur = ?, salle_operationnelle = ?, server = ?, game = ?, partition = ?, "group" = ?,
    exercice = ?, secteur = ?, position_STA = ?, position_logique = ?, type_d_anomalie = ?,
    indicatif = ?, mode_radar = ?, FL = ?, longitude = ?, latitude = ?, code_SSR = ?,
    sujet = ?, description = ?, commentaires = ?,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;

  db.run(query, [
    defaultDate, defaultTime,
    simulateur ? 1 : 0, salle_operationnelle ? 1 : 0,
    cleanValue(server), cleanValue(game), cleanValue(partition), cleanValue(group), cleanValue(exercice), cleanValue(secteur),
    cleanValue(position_STA), cleanValue(position_logique), cleanValue(type_d_anomalie),
    cleanValue(indicatif), cleanValue(mode_radar), cleanValue(FL), cleanValue(longitude), cleanValue(latitude), cleanValue(code_SSR),
    cleanValue(sujet), description, cleanValue(commentaires), id
  ], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'incident logiciel' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Incident logiciel non trouvé' });
    }

    // Return the updated incident
    db.get('SELECT * FROM software_incidents WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'incident' });
      }

      res.json({
        id: row.id,
        incident_type: 'software',
        date: row.date,
        time: row.time,
        simulateur: row.simulateur === 1 || row.simulateur === true,
        salle_operationnelle: row.salle_operationnelle === 1 || row.salle_operationnelle === true,
        server: row.server,
        game: row.game,
        partition: row.partition,
        group: row.group,
        exercice: row.exercice,
        secteur: row.secteur,
        position_STA: row.position_STA,
        position_logique: row.position_logique,
        type_d_anomalie: row.type_d_anomalie,
        indicatif: row.indicatif,
        mode_radar: row.mode_radar,
        FL: row.FL,
        longitude: row.longitude,
        latitude: row.latitude,
        code_SSR: row.code_SSR,
        sujet: row.sujet,
        description: row.description,
        commentaires: row.commentaires,
        created_at: row.created_at,
        updated_at: row.updated_at
      });
    });
  });
});

app.delete('/api/incidents/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Try to delete from hardware_incidents first
  db.run('DELETE FROM hardware_incidents WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la suppression' });
    }

    if (this.changes > 0) {
      // Also delete associated reports if any
      db.run('DELETE FROM reports WHERE software_incident_id IN (SELECT id FROM software_incidents WHERE id = ?)', [id], () => {});
      return res.json({ message: 'Incident matériel supprimé avec succès' });
    }

    // If not found in hardware, try software_incidents
    db.run('DELETE FROM software_incidents WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la suppression' });
      }

      if (this.changes > 0) {
        // Also delete associated reports
        db.run('DELETE FROM reports WHERE software_incident_id = ?', [id], () => {});
        return res.json({ message: 'Incident logiciel supprimé avec succès' });
      }

      return res.status(404).json({ message: 'Incident non trouvé' });
    });
  });
});

// Reports routes
app.get('/api/reports/', authenticateToken, (req, res) => {
  const { incident } = req.query;
  let query = 'SELECT * FROM reports WHERE 1=1';
  const params = [];

  if (incident) {
    query += ' AND software_incident_id = ?';
    params.push(incident);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur de base de données' });
    }

    const reports = rows.map(row => ({
      id: row.id,
      incident: row.software_incident_id,
      incident_type: 'software',
      date: row.date,
      time: row.time,
      anomaly: row.anomaly,
      analysis: row.analysis,
      conclusion: row.conclusion,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    res.json({ results: reports, count: reports.length });
  });
});

app.post('/api/reports/', authenticateToken, (req, res) => {
  const { incident, analysis, conclusion } = req.body;

  // Check if the incident exists and get its details to auto-fill date, time, and anomaly
  db.get('SELECT date, time, description FROM software_incidents WHERE id = ?', [incident], (err, softwareIncident) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur de base de données' });
    }

    if (!softwareIncident) {
      return res.status(400).json({ message: 'Incident logiciel non trouvé. Les rapports ne peuvent être créés que pour les incidents logiciels.' });
    }

    // Auto-fill date, time, and anomaly from the incident
    const incidentDate = softwareIncident.date;
    const incidentTime = softwareIncident.time;
    // Use description as anomaly if available, otherwise use a default or from request
    const anomaly = req.body.anomaly || softwareIncident.description || '';

    // Check if report already exists for this software incident
    db.get('SELECT id FROM reports WHERE software_incident_id = ?', [incident], (err, existingReport) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur de base de données' });
      }

      if (existingReport) {
        // Update existing report - allow anomaly override but keep date/time from incident
        const updateQuery = 'UPDATE reports SET date = ?, time = ?, anomaly = ?, analysis = ?, conclusion = ?, updated_at = CURRENT_TIMESTAMP WHERE software_incident_id = ?';
        
        db.run(updateQuery, [incidentDate, incidentTime, anomaly, analysis, conclusion, incident], function(err) {
          if (err) {
            return res.status(500).json({ message: 'Erreur lors de la mise à jour du rapport' });
          }

          // Return the updated report
          db.get('SELECT * FROM reports WHERE software_incident_id = ?', [incident], (err, row) => {
            if (err) {
              return res.status(500).json({ message: 'Erreur lors de la récupération du rapport' });
            }

            res.json({
              id: row.id,
              incident: row.software_incident_id,
              incident_type: 'software',
              date: row.date,
              time: row.time,
              anomaly: row.anomaly,
              analysis: row.analysis,
              conclusion: row.conclusion,
              created_at: row.created_at,
              updated_at: row.updated_at
            });
          });
        });
      } else {
        // Create new report with auto-filled date, time, and anomaly
        const insertQuery = 'INSERT INTO reports (software_incident_id, date, time, anomaly, analysis, conclusion) VALUES (?, ?, ?, ?, ?, ?)';

        db.run(insertQuery, [incident, incidentDate, incidentTime, anomaly, analysis, conclusion], function(err) {
          if (err) {
            return res.status(500).json({ message: 'Erreur lors de la création du rapport' });
          }

          res.status(201).json({
            id: this.lastID,
            incident: incident,
            incident_type: 'software',
            date: incidentDate,
            time: incidentTime,
            anomaly: anomaly,
            analysis: analysis,
            conclusion: conclusion,
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
