const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'enna.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking for equipement_id column in hardware_incidents...');

// Check if column exists
db.all("PRAGMA table_info(hardware_incidents)", (err, rows) => {
  if (err) {
    console.error('Error checking table info:', err);
    db.close();
    return;
  }

  const hasEquipementId = rows.some(row => row.name === 'equipement_id');
  
  if (hasEquipementId) {
    console.log('✓ Column equipement_id already exists');
    db.close();
    return;
  }

  console.log('✗ Column equipement_id does not exist. Adding it...');

  // Add the column
  db.run('ALTER TABLE hardware_incidents ADD COLUMN equipement_id INTEGER', (err) => {
    if (err) {
      console.error('Error adding column:', err);
    } else {
      console.log('✓ Successfully added equipement_id column');
    }
    
    // Verify it was added
    db.all("PRAGMA table_info(hardware_incidents)", (err, rows) => {
      if (err) {
        console.error('Error verifying column:', err);
      } else {
        const hasEquipementId = rows.some(row => row.name === 'equipement_id');
        if (hasEquipementId) {
          console.log('✓ Verification: equipement_id column exists');
        } else {
          console.log('✗ Verification failed: equipement_id column not found');
        }
      }
      db.close();
    });
  });
});

