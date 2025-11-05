const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./enna.db');

console.log('🔄 Starting database migration...');

db.serialize(() => {
  // Drop old tables if they exist
  db.run('DROP TABLE IF EXISTS reports', (err) => {
    if (err) console.error('Error dropping reports:', err);
  });
  
  db.run('DROP TABLE IF EXISTS software_incidents', (err) => {
    if (err) console.error('Error dropping software_incidents:', err);
  });
  
  db.run('DROP TABLE IF EXISTS hardware_incidents', (err) => {
    if (err) console.error('Error dropping hardware_incidents:', err);
  });
  
  // Recreate with new schema
  
  // Hardware incidents table
  db.run(`CREATE TABLE hardware_incidents (
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating hardware_incidents:', err);
    } else {
      console.log('✅ Created hardware_incidents table');
    }
  });

  // Software incidents table
  db.run(`CREATE TABLE software_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    simulateur BOOLEAN DEFAULT 0,
    salle_operationnelle BOOLEAN DEFAULT 0,
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
  )`, (err) => {
    if (err) {
      console.error('Error creating software_incidents:', err);
    } else {
      console.log('✅ Created software_incidents table');
    }
  });

  // Reports table
  db.run(`CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    software_incident_id INTEGER NOT NULL UNIQUE,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    anomaly TEXT NOT NULL,
    analysis TEXT NOT NULL,
    conclusion TEXT NOT NULL,
    created_by_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (software_incident_id) REFERENCES software_incidents (id),
    FOREIGN KEY (created_by_id) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating reports:', err);
    } else {
      console.log('✅ Created reports table');
    }
    
    // Remove is_active from users if it exists
    db.run(`ALTER TABLE users DROP COLUMN is_active`, (err) => {
      if (err && !err.message.includes('no such column')) {
        console.error('Error dropping is_active column:', err);
      } else {
        console.log('✅ Updated users table (removed is_active)');
      }
      
      console.log('✅ Migration completed!');
      db.close();
    });
  });
});

