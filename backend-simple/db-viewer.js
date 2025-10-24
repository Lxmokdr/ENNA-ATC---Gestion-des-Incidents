const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const db = new sqlite3.Database('./enna.db');

console.log('🔍 ENNA Database Viewer');
console.log('='.repeat(50));

// Function to show all tables
function showTables() {
  return new Promise((resolve, reject) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        console.log('\n📋 Available Tables:');
        rows.forEach(row => {
          console.log(`  • ${row.name}`);
        });
        resolve(rows);
      }
    });
  });
}

// Function to show table schema
function showTableSchema(tableName) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        console.log(`\n📊 Schema for table '${tableName}':`);
        console.log('  Column Name    | Type    | Not Null | Default');
        console.log('  ' + '-'.repeat(50));
        rows.forEach(row => {
          const notNull = row.notnull ? 'YES' : 'NO';
          const defaultValue = row.dflt_value ? row.dflt_value : '';
          console.log(`  ${row.name.padEnd(15)} | ${row.type.padEnd(7)} | ${notNull.padEnd(8)} | ${defaultValue}`);
        });
        resolve(rows);
      }
    });
  });
}

// Function to show table data
function showTableData(tableName, limit = 10) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${tableName} LIMIT ${limit}`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        console.log(`\n📄 Data from table '${tableName}' (first ${limit} rows):`);
        if (rows.length === 0) {
          console.log('  (No data found)');
        } else {
          // Get column names
          const columns = Object.keys(rows[0]);
          console.log('  ' + columns.join(' | '));
          console.log('  ' + '-'.repeat(columns.join(' | ').length));
          
          rows.forEach(row => {
            const values = columns.map(col => {
              const value = row[col];
              if (value === null) return 'NULL';
              if (typeof value === 'string' && value.length > 20) {
                return value.substring(0, 17) + '...';
              }
              return String(value);
            });
            console.log('  ' + values.join(' | '));
          });
        }
        resolve(rows);
      }
    });
  });
}

// Function to show table counts
function showTableCounts() {
  return new Promise((resolve, reject) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        reject(err);
      } else {
        console.log('\n📈 Table Row Counts:');
        let completed = 0;
        tables.forEach(table => {
          db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, row) => {
            if (err) {
              console.log(`  ${table.name}: Error - ${err.message}`);
            } else {
              console.log(`  ${table.name}: ${row.count} rows`);
            }
            completed++;
            if (completed === tables.length) {
              resolve();
            }
          });
        });
      }
    });
  });
}

// Main function
async function main() {
  try {
    // Show all tables
    const tables = await showTables();
    
    // Show table counts
    await showTableCounts();
    
    // Show schema and data for each table
    for (const table of tables) {
      await showTableSchema(table.name);
      await showTableData(table.name, 5);
    }
    
    console.log('\n✅ Database exploration complete!');
    console.log('\n💡 To explore specific data:');
    console.log('   node db-viewer.js --table users');
    console.log('   node db-viewer.js --table incidents');
    console.log('   node db-viewer.js --table reports');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    db.close();
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--table')) {
  const tableIndex = args.indexOf('--table');
  const tableName = args[tableIndex + 1];
  
  if (tableName) {
    db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
      if (err) {
        console.error('❌ Error:', err.message);
      } else {
        console.log(`\n📄 All data from table '${tableName}':`);
        console.log(JSON.stringify(rows, null, 2));
      }
      db.close();
    });
  } else {
    console.log('❌ Please specify a table name: --table <table_name>');
    db.close();
  }
} else {
  main();
}
