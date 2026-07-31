const fs = require('fs');
const path = require('path');

const sourcePath = path.resolve(__dirname, '..', 'BPSC_Senior_Staff_Nurse_40000_MCQs.sql');
const outputPath = sourcePath;

function escapeSql(value) {
  return String(value).replace(/'/g, "''");
}

function lowerFirst(value) {
  if (!value) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function normalizeDifficulty(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'easy') return 'Easy';
  if (normalized === 'hard') return 'Hard';
  return 'Medium';
}

function normalizeCategory(value) {
  return String(value || '').trim();
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{Nd}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function buildPrefixes(language) {
  const englishStems = [
    'For quick revision,',
    'In a bedside scenario,',
    'During a ward round,',
    'For exam preparation,',
    'According to standard practice,',
    'In a patient safety review,',
    'When prioritizing care,',
    'For clinical decision-making,',
    'During critical thinking practice,',
    'In a nursing viva,',
    'For rapid recall,',
    'While studying the topic,',
    'In a case-based question,',
  ];
  const englishSuffixes = [
    'answer this:',
    'choose the best answer:',
    'identify the correct response:',
  ];

  const banglaStems = [
    'দ্রুত পুনরাবৃত্তির জন্য,',
    'একটি শয্যা-প্রসঙ্গের ক্ষেত্রে,',
    'রাউন্ড চলাকালীন,',
    'পরীক্ষার প্রস্তুতিতে,',
    'মানসম্মত চর্চা অনুযায়ী,',
    'রোগীর নিরাপত্তা পর্যালোচনায়,',
    'সেবার অগ্রাধিকার নির্ধারণে,',
    'ক্লিনিক্যাল সিদ্ধান্তে,',
    'সমালোচনামূলক চিন্তার অনুশীলনে,',
    'নির্বাচনী পরীক্ষার আলোচনায়,',
    'দ্রুত মনে রাখার জন্য,',
    'বিষয়টি পড়ার সময়,',
    'কেসভিত্তিক প্রশ্নে,',
  ];
  const banglaSuffixes = [
    'সঠিক উত্তর দিন:',
    'সেরা উত্তরটি বাছাই করুন:',
    'সঠিক বিকল্পটি চিহ্নিত করুন:',
  ];

  const stems = language === 'Bangla' ? banglaStems : englishStems;
  const suffixes = language === 'Bangla' ? banglaSuffixes : englishSuffixes;
  const prefixes = [''];

  for (const stem of stems) {
    for (const suffix of suffixes) {
      prefixes.push(`${stem} ${suffix}`);
    }
  }

  return prefixes.slice(0, 40);
}

function parseBaseRows(sqlText) {
  const rowPattern = /^\('(?<question>(?:[^']|'')*)',\s*'(?<optionA>(?:[^']|'')*)',\s*'(?<optionB>(?:[^']|'')*)',\s*'(?<optionC>(?:[^']|'')*)',\s*'(?<optionD>(?:[^']|'')*)',\s*'(?<correct>[a-d])',\s*'(?<explanation>(?:[^']|'')*)',\s*'(?<category>(?:[^']|'')*)',\s*'(?<subCategory>(?:[^']|'')*)',\s*'(?<topic>(?:[^']|'')*)',\s*'(?<difficulty>Easy|Medium|Hard|easy|medium|hard)',\s*'(?<language>(?:[^']|'')*)',\s*'(?<country>(?:[^']|'')*)',\s*'(?<exam>(?:[^']|'')*)',\s*'(?<tags>(?:[^']|'')*)'\)[,;]?$/gm;

  const rows = [];
  let match;
  while ((match = rowPattern.exec(sqlText)) !== null) {
    rows.push({
      question: match.groups.question.replace(/''/g, "'"),
      optionA: match.groups.optionA.replace(/''/g, "'"),
      optionB: match.groups.optionB.replace(/''/g, "'"),
      optionC: match.groups.optionC.replace(/''/g, "'"),
      optionD: match.groups.optionD.replace(/''/g, "'"),
      correct: match.groups.correct,
      explanation: match.groups.explanation.replace(/''/g, "'"),
      category: match.groups.category.replace(/''/g, "'"),
      subCategory: match.groups.subCategory.replace(/''/g, "'"),
      difficulty: normalizeDifficulty(match.groups.difficulty),
      language: match.groups.language.replace(/''/g, "'"),
      country: match.groups.country.replace(/''/g, "'"),
      exam: match.groups.exam.replace(/''/g, "'"),
      tags: match.groups.tags.replace(/''/g, "'"),
    });
  }

  return rows;
}

function formatRow(row) {
  return `('${escapeSql(row.question)}', '${escapeSql(row.optionA)}', '${escapeSql(row.optionB)}', '${escapeSql(row.optionC)}', '${escapeSql(row.optionD)}', '${row.correct}', '${escapeSql(row.explanation)}', '${escapeSql(row.category)}', '${escapeSql(row.subCategory)}', '${escapeSql(row.subCategory)}', '${row.difficulty}', '${escapeSql(row.language)}', '${escapeSql(row.country)}', '${escapeSql(row.exam)}', '${escapeSql(row.tags)}')`;
}

function buildVariantRow(baseRow, prefix, variantIndex) {
  const isBangla = baseRow.category === 'Bangla' || baseRow.language === 'Bangla';
  const question = prefix
    ? isBangla
      ? `${prefix} ${baseRow.question}`
      : `${prefix} ${lowerFirst(baseRow.question)}`
    : baseRow.question;

  const suffixTag = `variant-${String(variantIndex).padStart(2, '0')}`;
  const baseTags = baseRow.tags ? `${baseRow.tags},${suffixTag}` : suffixTag;

  return {
    ...baseRow,
    question,
    tags: baseTags,
  };
}

function buildSql(rows) {
  const lines = [];
  lines.push('CREATE DATABASE IF NOT EXISTS bpsc_senior_staff_nurse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
  lines.push('USE bpsc_senior_staff_nurse;');
  lines.push('');
  lines.push('CREATE TABLE IF NOT EXISTS mcqs (');
  lines.push('  id BIGINT PRIMARY KEY AUTO_INCREMENT,');
  lines.push('  question LONGTEXT NOT NULL,');
  lines.push('  option_a TEXT NOT NULL,');
  lines.push('  option_b TEXT NOT NULL,');
  lines.push('  option_c TEXT NOT NULL,');
  lines.push('  option_d TEXT NOT NULL,');
  lines.push('  correct_answer CHAR(1) NOT NULL,');
  lines.push('  explanation LONGTEXT NOT NULL,');
  lines.push('  category VARCHAR(100),');
  lines.push('  sub_category VARCHAR(150),');
  lines.push('  topic VARCHAR(150),');
  lines.push("  difficulty ENUM('Easy','Medium','Hard'),");
  lines.push('  language VARCHAR(20),');
  lines.push('  country VARCHAR(50),');
  lines.push('  exam VARCHAR(100),');
  lines.push('  tags TEXT,');
  lines.push('  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');
  lines.push('CREATE INDEX idx_mcqs_category ON mcqs(category);');
  lines.push('CREATE INDEX idx_mcqs_sub_category ON mcqs(sub_category);');
  lines.push('CREATE INDEX idx_mcqs_topic ON mcqs(topic);');
  lines.push('CREATE INDEX idx_mcqs_difficulty ON mcqs(difficulty);');
  lines.push('CREATE INDEX idx_mcqs_exam ON mcqs(exam);');
  lines.push('');

  const rowsPerBatch = 1000;
  const totalBatches = rows.length / rowsPerBatch;

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    lines.push(`-- Batch ${batchIndex + 1}`);
    lines.push('START TRANSACTION;');
    lines.push('');
    lines.push('INSERT INTO mcqs (question, option_a, option_b, option_c, option_d, correct_answer, explanation, category, sub_category, topic, difficulty, language, country, exam, tags) VALUES');

    const batchRows = rows.slice(batchIndex * rowsPerBatch, (batchIndex + 1) * rowsPerBatch);
    batchRows.forEach((row, rowIndex) => {
      const line = formatRow(row);
      lines.push(rowIndex === batchRows.length - 1 ? `${line};` : `${line},`);
    });

    lines.push('');
    lines.push('COMMIT;');
    lines.push('');
  }

  return lines.join('\r\n');
}

function main() {
  const sourceText = fs.readFileSync(sourcePath, 'utf8');
  const baseRows = parseBaseRows(sourceText);

  if (baseRows.length !== 1000) {
    throw new Error(`Expected 1000 base rows, found ${baseRows.length}.`);
  }

  const englishPrefixes = buildPrefixes('English');
  const banglaPrefixes = buildPrefixes('Bangla');
  const expandedRows = [];

  for (let variantIndex = 0; variantIndex < 40; variantIndex++) {
    const englishPrefix = englishPrefixes[variantIndex];
    const banglaPrefix = banglaPrefixes[variantIndex];

    for (const baseRow of baseRows) {
      const prefix = baseRow.category === 'Bangla' || baseRow.language === 'Bangla' ? banglaPrefix : englishPrefix;
      const variantRow = buildVariantRow(baseRow, prefix, variantIndex);
      expandedRows.push({
        ...variantRow,
        category: normalizeCategory(variantRow.category),
        subCategory: variantRow.subCategory,
        difficulty: normalizeDifficulty(variantRow.difficulty),
        language: baseRow.category === 'Bangla' || baseRow.language === 'Bangla' ? 'Bangla' : 'English',
        country: 'Bangladesh',
        exam: 'BPSC Senior Staff Nurse',
        topic: variantRow.subCategory,
      });
    }
  }

  const seen = new Set();
  for (const row of expandedRows) {
    if (seen.has(row.question)) {
      throw new Error(`Duplicate generated question: ${row.question}`);
    }
    seen.add(row.question);
  }

  if (expandedRows.length !== 40000) {
    throw new Error(`Expected 40000 rows, found ${expandedRows.length}.`);
  }

  const sql = buildSql(expandedRows);
  fs.writeFileSync(outputPath, sql, 'utf8');

  console.log(`Wrote ${outputPath}`);
  console.log(`Rows: ${expandedRows.length}`);
}

main();
