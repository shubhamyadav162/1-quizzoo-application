const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(path.join(__dirname, '..'))
  .filter(file => file.endsWith('.json') && file !== 'new_questions_summary.json' && !file.endsWith('.backup'));

let totalQuestions = 0;
let fileStats = [];

for (const file of files) {
  try {
    const filePath = path.join(__dirname, '..', file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let jsonData = JSON.parse(fileContent);
    let questions = [];
    
    if (Array.isArray(jsonData)) {
      questions = jsonData;
    } else if (jsonData.questions && Array.isArray(jsonData.questions)) {
      questions = jsonData.questions;
    }
    
    fileStats.push({ file, count: questions.length });
    totalQuestions += questions.length;
  } catch (error) {
    console.error(`Error processing ${file}: ${error.message}`);
  }
}

console.log(`Total questions across all files: ${totalQuestions}`);
console.log('\nFiles sorted by question count:');
fileStats.sort((a, b) => b.count - a.count);
fileStats.forEach(stat => {
  console.log(`${stat.file}: ${stat.count} questions`);
}); 