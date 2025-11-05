const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./enna.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the database.');
});

db.serialize(() => {
  console.log('Starting migration: Adding duree_arret column to hardware_incidents...');
  
  // Check if column already exists
  db.all("PRAGMA table_info(hardware_incidents)", (err, columns) => {
    if (err) {
      console.error('Error checking table structure:', err.message);
      db.close();
      process.exit(1);
    }
    
    const hasColumn = columns.some(col => col.name === 'duree_arret');
    
    if (hasColumn) {
      console.log('✓ Column duree_arret already exists');
      db.close();
      return;
    }
    
    // SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS directly
    // So we need to add it manually
    db.run('ALTER TABLE hardware_incidents ADD COLUMN duree_arret INTEGER', (err) => {
      if (err) {
        console.error('Error adding column:', err.message);
        db.close();
        process.exit(1);
      }
      
      console.log('✓ Successfully added duree_arret column to hardware_incidents table');
      console.log('✓ Migration completed successfully!');
      
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed.');
        }
      });
    });
  });
});

