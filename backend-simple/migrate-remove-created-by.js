const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./enna.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the database.');
});

db.serialize(() => {
  console.log('Starting migration: Removing created_by_id from reports table...');
  
  // Step 1: Create new reports table without created_by_id
  db.run(`
    CREATE TABLE reports_new (
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
    )
  `, (err) => {
    if (err) {
      console.error('Error creating new table:', err.message);
    } else {
      console.log('✓ Created new reports table structure');
    }
  });

  // Step 2: Copy data from old table to new table (excluding created_by_id)
  db.run(`
    INSERT INTO reports_new (id, software_incident_id, date, time, anomaly, analysis, conclusion, created_at, updated_at)
    SELECT id, software_incident_id, date, time, anomaly, analysis, conclusion, created_at, updated_at
    FROM reports
  `, (err) => {
    if (err) {
      console.error('Error copying data:', err.message);
    } else {
      console.log('✓ Copied data to new table');
    }
  });

  // Step 3: Drop old table
  db.run('DROP TABLE reports', (err) => {
    if (err) {
      console.error('Error dropping old table:', err.message);
    } else {
      console.log('✓ Dropped old reports table');
    }
  });

  // Step 4: Rename new table to reports
  db.run('ALTER TABLE reports_new RENAME TO reports', (err) => {
    if (err) {
      console.error('Error renaming table:', err.message);
    } else {
      console.log('✓ Renamed new table to reports');
      console.log('✓ Migration completed successfully!');
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed.');
        }
      });
    }
  });
});

