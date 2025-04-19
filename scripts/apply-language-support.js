const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key not found in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the SQL file
const sqlFilePath = path.join(__dirname, '..', 'database', 'add-language-support.sql');
let sqlContent;

try {
  sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  console.log('SQL file read successfully');
} catch (error) {
  console.error('Error reading SQL file:', error);
  process.exit(1);
}

// Split the SQL file into separate statements
const sqlStatements = sqlContent
  .replace(/(\r\n|\n|\r)/gm, ' ') // Replace newlines with spaces
  .replace(/--.*?$/gm, '') // Remove comments
  .split(';') // Split on semicolons
  .map(stmt => stmt.trim()) // Trim whitespace
  .filter(stmt => stmt.length > 0); // Remove empty statements

// Execute each SQL statement sequentially
async function executeStatements() {
  console.log(`Executing ${sqlStatements.length} SQL statements...`);
  
  for (let i = 0; i < sqlStatements.length; i++) {
    const statement = sqlStatements[i];
    try {
      // Skip procedure/function definitions as they need special handling
      if (statement.toUpperCase().includes('CREATE OR REPLACE FUNCTION')) {
        console.log(`Skipping function definition (${i + 1}/${sqlStatements.length})`);
        continue;
      }
      
      console.log(`Executing statement ${i + 1}/${sqlStatements.length}`);
      const { error } = await supabase.rpc('execute_sql', { sql_query: statement + ';' });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
      } else {
        console.log(`Statement ${i + 1} executed successfully`);
      }
    } catch (error) {
      console.error(`Error executing statement ${i + 1}:`, error);
    }
  }
  
  console.log('SQL execution completed');
}

// Call the function to execute the statements
executeStatements().catch(error => {
  console.error('Error in executeStatements:', error);
}); 