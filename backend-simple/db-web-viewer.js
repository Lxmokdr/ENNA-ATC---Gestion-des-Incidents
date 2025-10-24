const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

// Connect to the database
const db = new sqlite3.Database('./enna.db');

// Serve static files
app.use(express.static('public'));

// API endpoint to get all tables
app.get('/api/tables', (req, res) => {
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Add table descriptions and icons
      const tablesWithInfo = rows.map(row => {
        let description = '';
        let icon = '📄';
        
        switch(row.name) {
          case 'users':
            description = 'User accounts and authentication';
            icon = '👥';
            break;
          case 'hardware_incidents':
            description = 'Hardware-related incidents with equipment details';
            icon = '🔧';
            break;
          case 'software_incidents':
            description = 'Software-related incidents with service details';
            icon = '💻';
            break;
          case 'reports':
            description = 'Incident reports linked to software incidents only';
            icon = '📋';
            break;
          default:
            description = 'Database table';
            icon = '📄';
        }
        
        return {
          name: row.name,
          description: description,
          icon: icon
        };
      });
      
      res.json(tablesWithInfo);
    }
  });
});

// API endpoint to get table schema
app.get('/api/table/:name/schema', (req, res) => {
  const tableName = req.params.name;
  db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// API endpoint to get table data
app.get('/api/table/:name/data', (req, res) => {
  const tableName = req.params.name;
  const limit = req.query.limit || 100;
  const offset = req.query.offset || 0;
  
  db.all(`SELECT * FROM ${tableName} LIMIT ${limit} OFFSET ${offset}`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// API endpoint to get table count
app.get('/api/table/:name/count', (req, res) => {
  const tableName = req.params.name;
  db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ count: row.count });
    }
  });
});

// Serve the HTML page
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ENNA Database Viewer</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .table-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .table-card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; background: #f9f9f9; transition: transform 0.2s, box-shadow 0.2s; }
        .table-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .table-header { display: flex; align-items: center; margin-bottom: 10px; }
        .table-icon { font-size: 24px; margin-right: 10px; }
        .table-card h3 { margin: 0; color: #007bff; font-size: 18px; }
        .table-description { font-size: 14px; color: #555; margin-bottom: 8px; font-style: italic; }
        .table-info { font-size: 14px; color: #666; margin-bottom: 15px; font-weight: 500; }
        .view-btn { background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
        .view-btn:hover { background: #0056b3; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .data-table th { background: #f2f2f2; font-weight: bold; }
        .data-table tr:nth-child(even) { background: #f9f9f9; }
        .data-table .foreign-key { background: #e3f2fd; font-weight: bold; }
        .data-table .type-field { background: #f3e5f5; font-weight: bold; }
        .reports-info { background: #e8f5e8; border: 1px solid #4caf50; border-radius: 4px; padding: 15px; margin: 15px 0; }
        .reports-info p { margin: 5px 0; }
        .reports-info code { background: #fff; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
        .loading { text-align: center; padding: 20px; color: #666; }
        .error { color: red; background: #ffe6e6; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .back-btn { background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-bottom: 20px; }
        .back-btn:hover { background: #545b62; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 ENNA Database Viewer</h1>
        <div id="tables-container">
            <div class="loading">Loading tables...</div>
        </div>
        <div id="table-detail" style="display: none;">
            <button class="back-btn" onclick="showTables()">← Back to Tables</button>
            <div id="table-content"></div>
        </div>
    </div>

    <script>
        let currentTable = null;

        async function loadTables() {
            try {
                const response = await fetch('/api/tables');
                const tables = await response.json();
                displayTables(tables);
            } catch (error) {
                document.getElementById('tables-container').innerHTML = 
                    '<div class="error">Error loading tables: ' + error.message + '</div>';
            }
        }

        function displayTables(tables) {
            const container = document.getElementById('tables-container');
            container.innerHTML = '<div class="table-list"></div>';
            
            tables.forEach(async table => {
                const countResponse = await fetch('/api/table/' + table.name + '/count');
                const countData = await countResponse.json();
                
                const tableCard = document.createElement('div');
                tableCard.className = 'table-card';
                tableCard.innerHTML = \`
                    <div class="table-header">
                        <span class="table-icon">\${table.icon || '📄'}</span>
                        <h3>\${table.name}</h3>
                    </div>
                    <div class="table-description">\${table.description || 'Database table'}</div>
                    <div class="table-info">\${countData.count} rows</div>
                    <button class="view-btn" onclick="viewTable('\${table.name}')">View Data</button>
                \`;
                
                container.querySelector('.table-list').appendChild(tableCard);
            });
        }

        async function viewTable(tableName) {
            currentTable = tableName;
            document.getElementById('tables-container').style.display = 'none';
            document.getElementById('table-detail').style.display = 'block';
            
            const content = document.getElementById('table-content');
            content.innerHTML = '<div class="loading">Loading table data...</div>';
            
            try {
                // Load schema
                const schemaResponse = await fetch('/api/table/' + tableName + '/schema');
                const schema = await schemaResponse.json();
                
                // Load data
                const dataResponse = await fetch('/api/table/' + tableName + '/data');
                const data = await dataResponse.json();
                
                displayTableDetail(tableName, schema, data);
            } catch (error) {
                content.innerHTML = '<div class="error">Error loading table: ' + error.message + '</div>';
            }
        }

        function displayTableDetail(tableName, schema, data) {
            const content = document.getElementById('table-content');
            
            let html = \`<h2>Table: \${tableName}</h2>\`;
            
            // Schema
            html += '<h3>Schema:</h3>';
            html += '<table class="data-table"><tr><th>Column</th><th>Type</th><th>Not Null</th><th>Default</th></tr>';
            schema.forEach(col => {
                html += \`<tr><td>\${col.name}</td><td>\${col.type}</td><td>\${col.notnull ? 'Yes' : 'No'}</td><td>\${col.dflt_value || ''}</td></tr>\`;
            });
            html += '</table>';
            
            // Data
            html += '<h3>Data:</h3>';
            if (data.length === 0) {
                html += '<p>No data found.</p>';
            } else {
                // Special handling for reports table
                if (tableName === 'reports') {
                    html += '<div class="reports-info">';
                    html += '<p><strong>Note:</strong> Reports are only linked to software incidents.</p>';
                    html += '<p>• <code>software_incident_id</code> - Links to software_incidents table</p>';
                    html += '<p>• Hardware incidents do not have reports</p>';
                    html += '</div>';
                }
                
                html += '<table class="data-table"><tr>';
                Object.keys(data[0]).forEach(key => {
                    let headerClass = '';
                    if (key === 'software_incident_id') {
                        headerClass = ' class="foreign-key"';
                    }
                    html += \`<th\${headerClass}>\${key}</th>\`;
                });
                html += '</tr>';
                
                data.forEach(row => {
                    html += '<tr>';
                    Object.entries(row).forEach(([key, value]) => {
                        let cellClass = '';
                        let displayValue = value === null ? 'NULL' : 
                                          (typeof value === 'string' && value.length > 50 ? 
                                           value.substring(0, 47) + '...' : String(value));
                        
                        if (key === 'software_incident_id') {
                            cellClass = ' class="foreign-key"';
                            if (value) {
                                displayValue = \`🔗 \${value}\`;
                            }
                        }
                        
                        html += \`<td\${cellClass}>\${displayValue}</td>\`;
                    });
                    html += '</tr>';
                });
                html += '</table>';
            }
            
            content.innerHTML = html;
        }

        function showTables() {
            document.getElementById('tables-container').style.display = 'block';
            document.getElementById('table-detail').style.display = 'none';
            currentTable = null;
        }

        // Load tables on page load
        loadTables();
    </script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`🌐 Database Web Viewer running at http://localhost:${PORT}`);
  console.log('📊 View your ENNA database in the browser!');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down database viewer...');
  db.close();
  process.exit(0);
});
