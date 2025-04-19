// Script to find and remove duplicate questions
const fs = require('fs');
const path = require('path');

// Get all question files from directory
const getQuestionFiles = () => {
  return fs.readdirSync(path.join(__dirname, '..'))
    .filter(file => file.endsWith('.json') && file !== 'new_questions_summary.json');
};

// Main function to find duplicates
async function findAndRemoveDuplicates() {
  console.log('Searching for duplicate questions...');
  
  // Track all questions by their English and Hindi texts
  const questionMap = new Map();
  const duplicates = [];
  const allQuestions = [];
  const fileQuestionMap = new Map(); // Maps filename to question list
  
  // Load all questions from all files
  const files = getQuestionFiles();
  console.log(`Found ${files.length} question files`);
  
  // First pass: read all questions and identify duplicates
  for (const file of files) {
    try {
      const filePath = path.join(__dirname, '..', file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      let jsonData = JSON.parse(fileContent);
      let questions = [];
      
      // Handle different JSON formats
      if (Array.isArray(jsonData)) {
        // Format 1: Array of questions
        questions = jsonData;
      } else if (jsonData.questions && Array.isArray(jsonData.questions)) {
        // Format 2: { questions: [...] }
        questions = jsonData.questions;
      } else {
        console.warn(`Skipping file ${file}: Unrecognized format`);
        continue;
      }
      
      // Store all questions from this file
      fileQuestionMap.set(file, questions);
      
      // Check each question for duplicates
      questions.forEach(q => {
        // Handle different question formats
        let enQuestion = '';
        let hiQuestion = '';
        
        // Format 1: { en: { question: "..." }, hi: { question: "..." } }
        if (q.en && q.en.question) {
          enQuestion = q.en.question.trim().toLowerCase();
        }
        if (q.hi && q.hi.question) {
          hiQuestion = q.hi.question.trim().toLowerCase();
        }
        
        // Format 2: { text: "..." } (Hindi questions)
        if (q.text && !enQuestion) {
          hiQuestion = q.text.trim().toLowerCase();
        }
        
        // Format 3: { question: "..." } (most likely English)
        if (q.question && !enQuestion) {
          enQuestion = q.question.trim().toLowerCase();
        }
        
        // Skip if we couldn't find any question text
        if (!enQuestion && !hiQuestion) {
          console.warn(`Skipping question in ${file}: No question text found`);
          return;
        }
        
        // Create a unique key for each question based on both language texts
        const questionKey = `${enQuestion}|||${hiQuestion}`;
        
        if (questionMap.has(questionKey)) {
          // Found a duplicate
          const existingId = questionMap.get(questionKey).id || 
                            questionMap.get(questionKey).question_id || 
                            'unknown';
          
          duplicates.push({
            id: q.id || q.question_id || 'unknown',
            existingId: existingId,
            file,
            question: enQuestion || hiQuestion,
            hiQuestion: hiQuestion
          });
        } else {
          // Add to our tracking map
          questionMap.set(questionKey, q);
          allQuestions.push(q);
        }
      });
      
    } catch (error) {
      console.error(`Error processing file ${file}:`, error.message);
    }
  }
  
  // Report duplicates
  console.log(`\nFound ${duplicates.length} duplicate questions out of ${allQuestions.length} total`);
  
  if (duplicates.length === 0) {
    console.log('No duplicates found. All questions are unique.');
    return;
  }
  
  console.log('\nDuplicate questions:');
  duplicates.forEach((dup, index) => {
    console.log(`${index + 1}. ID: ${dup.id} is a duplicate of ${dup.existingId} (File: ${dup.file})`);
    console.log(`   Question: "${dup.question}"`);
    if (dup.hiQuestion && dup.hiQuestion !== dup.question) {
      console.log(`   Hindi: "${dup.hiQuestion}"`);
    }
    console.log('');
  });
  
  // Second pass: create new files without duplicates
  const uniqueQuestionsMap = new Map();
  let totalRemoved = 0;
  
  console.log('\nRemoving duplicates from files...');
  for (const [file, questions] of fileQuestionMap.entries()) {
    try {
      // Read the original file to preserve its structure
      const filePath = path.join(__dirname, '..', file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      let jsonData = JSON.parse(fileContent);
      
      // Filter out duplicates for this file
      const uniqueQuestions = questions.filter(q => {
        // Handle different question formats
        let enQuestion = '';
        let hiQuestion = '';
        
        // Format 1: { en: { question: "..." }, hi: { question: "..." } }
        if (q.en && q.en.question) {
          enQuestion = q.en.question.trim().toLowerCase();
        }
        if (q.hi && q.hi.question) {
          hiQuestion = q.hi.question.trim().toLowerCase();
        }
        
        // Format 2: { text: "..." } (Hindi questions)
        if (q.text && !enQuestion) {
          hiQuestion = q.text.trim().toLowerCase();
        }
        
        // Format 3: { question: "..." } (most likely English)
        if (q.question && !enQuestion) {
          enQuestion = q.question.trim().toLowerCase();
        }
        
        // Skip if we couldn't find any question text
        if (!enQuestion && !hiQuestion) {
          return true; // Keep questions we can't process
        }
        
        const questionKey = `${enQuestion}|||${hiQuestion}`;
        
        // If we've seen this question before, filter it out
        if (uniqueQuestionsMap.has(questionKey)) {
          // Skip this question (it's a duplicate)
          return false;
        }
        
        // Mark this question as seen
        uniqueQuestionsMap.set(questionKey, q);
        return true;
      });
      
      // Calculate how many were removed from this file
      const removedCount = questions.length - uniqueQuestions.length;
      totalRemoved += removedCount;
      
      if (removedCount > 0) {
        // Backup the original file
        const backupPath = path.join(__dirname, '..', `${file}.backup`);
        fs.copyFileSync(path.join(__dirname, '..', file), backupPath);
        console.log(`Created backup at: ${file}.backup`);
        
        // Determine the format and write back
        if (Array.isArray(jsonData)) {
          // Format 1: Array of questions
          fs.writeFileSync(
            path.join(__dirname, '..', file),
            JSON.stringify(uniqueQuestions, null, 2),
            'utf8'
          );
        } else if (jsonData.questions && Array.isArray(jsonData.questions)) {
          // Format 2: { questions: [...] }
          jsonData.questions = uniqueQuestions;
          fs.writeFileSync(
            path.join(__dirname, '..', file),
            JSON.stringify(jsonData, null, 2),
            'utf8'
          );
        }
        
        console.log(`Removed ${removedCount} duplicates from ${file}`);
      }
    } catch (error) {
      console.error(`Error updating file ${file}:`, error.message);
    }
  }
  
  console.log(`\nRemoved a total of ${totalRemoved} duplicate questions`);
  console.log(`Total unique questions remaining: ${allQuestions.length - totalRemoved}`);
}

// Run the main function
findAndRemoveDuplicates().catch(error => {
  console.error('Error:', error);
}); 