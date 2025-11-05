const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./enna.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the database.');
});

db.serialize(() => {
  console.log('Starting migration: Adding server column to software_incidents...');
  
  // Check if column already exists
  db.all("PRAGMA table_info(software_incidents)", (err, columns) => {
    if (err) {
      console.error('Error checking table structure:', err.message);
      db.close();
      process.exit(1);
    }
    
    const hasColumn = columns.some(col => col.name === 'server');
    
    if (hasColumn) {
      console.log('✓ Column server already exists');
      db.close();
      return;
    }
    
    // SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS directly
    // So we need to add it manually
    db.run('ALTER TABLE software_incidents ADD COLUMN server TEXT', (err) => {
      if (err) {
        console.error('Error adding column:', err.message);
        db.close();
        process.exit(1);
      }
      
      console.log('✓ Successfully added server column to software_incidents table');
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

