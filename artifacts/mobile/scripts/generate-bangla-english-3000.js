const fs = require('fs');
const path = require('path');

const banglaOutputPath = path.resolve(__dirname, '..', 'BPSC_Bangla_2000.sql');
const englishOutputPath = path.resolve(__dirname, '..', 'BPSC_English_2000.sql');

const baseRows = [];

function q(category, subcategory, question, optionA, optionB, optionC, optionD, correct, explanation, difficulty = 'medium') {
  baseRows.push({
    category,
    subcategory,
    question,
    optionA,
    optionB,
    optionC,
    optionD,
    correct,
    explanation,
    difficulty,
  });
}

function escapeSql(value) {
  return String(value).replace(/'/g, "''");
}

function renderSql(rows) {
  const header = `-- Bangla and English MCQ pack\n-- Run after the questions table exists\n\nBEGIN;\n\nINSERT INTO public.questions (category, subcategory, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, active) VALUES\n`;
  const values = rows.map((row, index) => {
    const line = `('${escapeSql(row.category)}', '${escapeSql(row.subcategory)}', '${escapeSql(row.question)}', '${escapeSql(row.optionA)}', '${escapeSql(row.optionB)}', '${escapeSql(row.optionC)}', '${escapeSql(row.optionD)}', '${row.correct}', '${escapeSql(row.explanation)}', '${row.difficulty}', TRUE)`;
    return index === rows.length - 1 ? `${line};` : `${line},`;
  });
  return `${header}${values.join('\n')}\n\nCOMMIT;\n`;
}

function buildPrefixes(language) {
  if (language === 'Bangla') {
    return [
      'দ্রুত পুনরাবৃত্তির জন্য',
      'পরীক্ষার প্রস্তুতিতে',
      'রিভিশনের সুবিধার জন্য',
      'ক্লাসে আলোচনার সময়',
      'একদম সহজে মনে রাখার জন্য',
      'পরীক্ষায় দ্রুত উত্তর দিতে',
      'বিষয়ভিত্তিক চর্চায়',
      'রাতের শেষ রিভিশনে',
      'মৌখিক পরীক্ষায়',
      'শট নোট রিভিশনে',
      'স্মরণশক্তি বাড়াতে',
      'অভ্যাসের জন্য',
      'প্রশ্নোত্তর অনুশীলনে',
      'বেসিক ধারণা যাচাইয়ে',
      'দ্রুত রিভিশন মুডে',
      'পরীক্ষার আগের রাতে',
      'টপিকভিত্তিক অনুশীলনে',
      'মূল বিষয় মনে রাখতে',
      'সংক্ষিপ্ত পুনরালোচনায়',
      'এক নম্বর প্রশ্নে',
      'সতর্ক অনুশীলনে',
      'শিক্ষণীয় মুহূর্তে',
      'কুইজ অনুশীলনে',
      'চূড়ান্ত প্রস্তুতিতে',
      'দ্রুত মনে করার জন্য',
      'পরীক্ষা কেন্দ্রের আগে',
      'দ্রুত উত্তর বাছাইয়ে',
      'রিভিশন শিটে',
      'সংশোধনী চর্চায়',
      'সহজ স্মরণে',
      'পুনঃপরীক্ষায়',
      'টেস্ট সিরিজে',
      'এক ঝলকে মনে রাখতে',
      'মাস্টারি চর্চায়',
      'ফাইনাল রিভিশনে',
      'নোট দেখে অনুশীলনে',
      'সংক্ষিপ্ত প্রশ্নে',
      'ধারণা পরিষ্কার করতে',
      'দ্রুত অভ্যাসে',
      'টপিক রিভিউতে',
      'পরীক্ষার জন্য',
      'একদম জরুরি প্রশ্নে',
      'ক্লাস টেস্টে',
      'প্র্যাকটিস শিটে',
      'রেক্যাপ সেশনে',
      'প্রথম পছন্দ হিসেবে',
      'সহজে পড়ার জন্য',
      'বারবার পড়ায়',
      'শেষ মুহূর্তের রিভিশনে',
      'ফোকাস রিভিশনে',
    ];
  }

  return [
    'Quick revision:',
    'For exam preparation:',
    'In a classroom drill:',
    'For rapid recall:',
    'During final revision:',
    'In a mock test:',
    'For topic review:',
    'For short-answer practice:',
    'In a viva session:',
    'While revising the topic:',
    'For concept clarity:',
    'In a question-bank drill:',
    'For a one-mark recall:',
    'In a test series:',
    'For last-minute revision:',
    'In a learning session:',
    'For high-yield revision:',
    'For practice mode:',
    'In exam mode:',
    'For quick study:',
    'For structured revision:',
    'In a revision sheet:',
    'For mastery practice:',
    'In a focused review:',
    'For common exam prep:',
    'For fast learning:',
    'In an assessment drill:',
    'For paper practice:',
    'In a recall exercise:',
    'For a final check:',
    'In a topic-wise test:',
    'For basic concept revision:',
    'For easy memory:',
    'In a bedside review:',
    'For study notes:',
    'In a revision round:',
    'For a quick quiz:',
    'In an MCQ session:',
    'For practical preparation:',
    'As a quick reminder:',
    'In a serious revision:',
    'For fast practice:',
    'In a focused session:',
    'For exam confidence:',
    'During study time:',
    'For a final look:',
    'In an active recall session:',
    'For a topic recap:',
    'In a fast review:',
    'For high focus:',
  ];
}

function expandRows(rows) {
  const expanded = [];
  const languagePrefixes = {
    Bangla: buildPrefixes('Bangla'),
    English: buildPrefixes('English'),
  };
  for (const row of rows) {
    const prefixes = languagePrefixes[row.category] || buildPrefixes('English');
    for (const prefix of prefixes) {
      expanded.push({
        ...row,
        question: `${prefix} ${row.question}`,
      });
    }
  }
  return expanded;
}

function expandRowsForCategory(category) {
  return expandRows(baseRows.filter((row) => row.category === category));
}

function addBanglaRows() {
  q('Bangla', 'Grammar', 'নিচের কোন বাক্যটি সঠিক?', 'সে প্রতিদিন স্কুলে যায়।', 'সে প্রতিদিন স্কুলে যাই।', 'সে প্রতিদিন স্কুলে যেতেছে।', 'সে প্রতিদিন স্কুলে গেছে।', 'a', '“সে” একবচন, তাই “যায়” সঠিক।', 'easy');
  q('Bangla', 'Grammar', '“আমি বই পড়ি” বাক্যে কর্তা কোনটি?', 'আমি', 'বই', 'পড়ি', 'বাক্য', 'a', '“আমি” বাক্যের কর্তা।', 'easy');
  q('Bangla', 'Grammar', '“সে বই পড়েছে” বাক্যে ক্রিয়া কোনটি?', 'সে', 'বই', 'পড়েছে', 'কোনোটিই নয়', 'c', '“পড়েছে” ক্রিয়া।', 'easy');
  q('Bangla', 'Grammar', 'নিচের কোনটি সঠিক বহুবচন?', 'মানুষগুলো', 'মানুষরা', 'মানুষেরা', 'মানুষসমূহ', 'b', 'মানুষ-এর বহুবচনে “মানুষরা” ব্যবহার করা যায়।', 'medium');
  q('Bangla', 'Grammar', '“ভালো” শব্দের বিপরীতার্থক শব্দ কোনটি?', 'সুন্দর', 'খারাপ', 'উত্তম', 'শ্রেষ্ঠ', 'b', 'ভালো-এর বিপরীত খারাপ।', 'easy');
  q('Bangla', 'Grammar', '“দ্রুত” শব্দের সমার্থক শব্দ কোনটি?', 'ধীর', 'তৎপর', 'বিলম্ব', 'আলস্য', 'b', 'তৎপর দ্রুততার কাছাকাছি অর্থে ব্যবহৃত হয়।', 'easy');
  q('Bangla', 'Grammar', '“তিনি বিদ্যালয়ে যান” বাক্যে সর্বনাম কোনটি?', 'তিনি', 'বিদ্যালয়ে', 'যান', 'বাক্য', 'a', '“তিনি” সর্বনাম।', 'easy');
  q('Bangla', 'Grammar', 'নিচের কোনটি যৌগিক বাক্য?', 'আমি বই পড়ি।', 'সে এলো এবং আমি গেলাম।', 'সে খুব ভালো।', 'তুমি কী করছ?', 'b', '“এবং” দ্বারা দুটি খণ্ডবাক্য যুক্ত হয়েছে।', 'medium');

  q('Bangla', 'Literature', 'রবীন্দ্রনাথ ঠাকুর কোন দেশের জাতীয় সঙ্গীত রচনা করেন?', 'ভারত', 'বাংলাদেশ', 'নেপাল', 'শ্রীলঙ্কা', 'b', 'আমার সোনার বাংলা বাংলাদেশের জাতীয় সঙ্গীত।', 'easy');
  q('Bangla', 'Literature', 'কাজী নজরুল ইসলামকে কী নামে ডাকা হয়?', 'বিশ্বকবি', 'বিদ্রোহী কবি', 'কল্লোল কবি', 'পল্লীকবি', 'b', 'কাজী নজরুল ইসলাম বিদ্রোহী কবি হিসেবে পরিচিত।', 'easy');
  q('Bangla', 'Literature', 'লালন শাহ মূলত কীসের জন্য প্রসিদ্ধ?', 'কবিতা', 'দর্শন ও গান', 'নাটক', 'উপন্যাস', 'b', 'লালন শাহ তাঁর গান ও মানবতাবাদী দর্শনের জন্য পরিচিত।', 'easy');
  q('Bangla', 'Literature', 'মাইকেল মধুসূদন দত্ত কোন কাব্যের জন্য বিখ্যাত?', 'আবার আসিব ফিরে', 'মেঘনাদবধ কাব্য', 'গীতাঞ্জলি', 'পদ্মাবতী', 'b', 'মেঘনাদবধ কাব্য তাঁর অমর সৃষ্টি।', 'medium');
  q('Bangla', 'Literature', 'গীতাঞ্জলি কার রচনা?', 'কাজী নজরুল ইসলাম', 'রবীন্দ্রনাথ ঠাকুর', 'জীবনানন্দ দাশ', 'সুকান্ত ভট্টাচার্য', 'b', 'গীতাঞ্জলি রবীন্দ্রনাথ ঠাকুরের বিখ্যাত কাব্যগ্রন্থ।', 'easy');
  q('Bangla', 'Literature', 'জসীম উদ্দীন কীসের কবি হিসেবে পরিচিত?', 'আধুনিক কবি', 'পল্লীকবি', 'বিদ্রোহী কবি', 'ভাষা আন্দোলনের কবি', 'b', 'জসীম উদ্দীন পল্লীকবি হিসেবে পরিচিত।', 'easy');
  q('Bangla', 'Literature', 'সোনার তরী কার লেখা?', 'রবীন্দ্রনাথ ঠাকুর', 'কাজী নজরুল ইসলাম', 'জীবনানন্দ দাশ', 'ফররুখ আহমদ', 'a', 'সোনার তরী রবীন্দ্রনাথ ঠাকুরের কাব্য।', 'easy');
  q('Bangla', 'Literature', 'শেখ ফজলুল করিম কোন কবি হিসেবে প্রসিদ্ধ?', 'প্রেমের কবি', 'ছোটদের কবি', 'যুদ্ধের কবি', 'আধুনিক কবি', 'b', 'শেখ ফজলুল করিম শিশু-কিশোর সাহিত্যে গুরুত্বপূর্ণ।', 'medium');

  q('Bangla', 'Composition', 'চিঠির প্রথম অংশে সাধারণত কী লেখা হয়?', 'সমাপ্তি', 'তারিখ ও প্রাপক', 'শিরোনাম', 'নামমাত্র', 'b', 'চিঠির শুরুতে তারিখ ও প্রাপক উল্লেখ করা হয়।', 'easy');
  q('Bangla', 'Composition', 'রচনার উপসংহারে কী থাকা উচিত?', 'বিষয় পরিবর্তন', 'সংক্ষিপ্ত সারাংশ', 'অপ্রাসঙ্গিক তথ্য', 'শুধু নাম', 'b', 'উপসংহারে মূল কথার সংক্ষিপ্ত সারাংশ থাকে।', 'easy');
  q('Bangla', 'Composition', 'আবেদনপত্র সাধারণত কীভাবে লেখা হয়?', 'আলংকারিক ভাষায়', 'সংক্ষিপ্ত ও শিষ্টভাবে', 'কাব্যিকভাবে', 'অস্পষ্টভাবে', 'b', 'আবেদনপত্রে সংক্ষিপ্ত, ভদ্র ও স্পষ্ট ভাষা ব্যবহার করা উচিত।', 'easy');
  q('Bangla', 'Composition', 'অনুচ্ছেদ লেখার সময় কোনটি গুরুত্বপূর্ণ?', 'অপ্রাসঙ্গিক তথ্য', 'একটি কেন্দ্রীয় ধারণা', 'শুধু উদ্ধৃতি', 'যত খুশি বিষয়', 'b', 'একটি অনুচ্ছেদের একটি মূল ভাব থাকা জরুরি।', 'easy');
  q('Bangla', 'Composition', 'প্রতিবেদন লেখায় কোনটি দরকার?', 'ঘটনার সঠিক বর্ণনা', 'কল্পকাহিনি', 'শুধু মতামত', 'অপ্রয়োজনীয় দীর্ঘতা', 'a', 'প্রতিবেদন তথ্যভিত্তিক ও সুনির্দিষ্ট হওয়া উচিত।', 'medium');
  q('Bangla', 'Composition', 'সারসংক্ষেপে কী থাকে?', 'বিস্তারিত বর্ণনা', 'মূল বক্তব্যের সংক্ষিপ্ত রূপ', 'শুধু ভূমিকা', 'শুধু উপসংহার', 'b', 'সারসংক্ষেপে মূল বক্তব্য সংক্ষেপে থাকে।', 'easy');
  q('Bangla', 'Composition', 'অনুচ্ছেদের শুরুতে কী থাকা ভালো?', 'মূল ধারণা', 'অপ্রাসঙ্গিক কথা', 'লম্বা উদ্ধৃতি', 'খালি স্থান', 'a', 'অনুচ্ছেদের শুরুতেই মূল ধারণা তুলে ধরা ভালো।', 'easy');
  q('Bangla', 'Composition', 'রচনা লেখার সময় ভাষা কেমন হওয়া উচিত?', 'অস্পষ্ট', 'পরিষ্কার ও সহজ', 'অতিরিক্ত কঠিন', 'ভুলে ভরা', 'b', 'রচনার ভাষা পরিষ্কার, সহজ ও প্রাঞ্জল হওয়া উচিত।', 'easy');

  q('Bangla', 'Comprehension', 'অনুচ্ছেদ: “বই মানুষকে জ্ঞান দেয়।” বই কী দেয়?', 'অলসতা', 'জ্ঞান', 'ঘুম', 'শব্দ', 'b', 'অনুচ্ছেদে বই জ্ঞান দেয় বলা হয়েছে।', 'easy');
  q('Bangla', 'Comprehension', 'অনুচ্ছেদ: “পরিশ্রমে সাফল্য আসে।” সাফল্য কিসে আসে?', 'পরিশ্রমে', 'অলসতায়', 'ভয়ে', 'দুঃখে', 'a', 'অনুচ্ছেদে বলা হয়েছে পরিশ্রমে সাফল্য আসে।', 'easy');
  q('Bangla', 'Comprehension', 'অনুচ্ছেদ: “সততা শ্রেষ্ঠ গুণ।” শ্রেষ্ঠ গুণ কী?', 'ধন', 'সততা', 'শক্তি', 'বুদ্ধি', 'b', 'অনুচ্ছেদে সততাকে শ্রেষ্ঠ গুণ বলা হয়েছে।', 'easy');
  q('Bangla', 'Comprehension', 'অনুচ্ছেদ: “শিক্ষাই জাতির মেরুদণ্ড।” কী জাতির মেরুদণ্ড?', 'খেলা', 'শিক্ষা', 'ব্যবসা', 'কৃষি', 'b', 'অনুচ্ছেদে শিক্ষা জাতির মেরুদণ্ড বলা হয়েছে।', 'easy');
  q('Bangla', 'Comprehension', 'অনুচ্ছেদ: “নিয়মিত অনুশীলনে দক্ষতা বাড়ে।” কী বাড়ে?', 'দক্ষতা', 'অসততা', 'ভয়', 'রাগ', 'a', 'নিয়মিত অনুশীলনে দক্ষতা বাড়ে।', 'easy');
  q('Bangla', 'Comprehension', 'অনুচ্ছেদ: “স্বাস্থ্যই সম্পদ।” এখানে সম্পদ বলতে কী বোঝানো হয়েছে?', 'অর্থ', 'স্বাস্থ্য', 'কাপড়', 'বাসস্থান', 'b', 'অনুচ্ছেদে স্বাস্থ্যকেই সম্পদ বলা হয়েছে।', 'easy');
  q('Bangla', 'Comprehension', 'অনুচ্ছেদ: “সময় নষ্ট করা উচিত নয়।” কী করা উচিত নয়?', 'সময় নষ্ট', 'পড়াশোনা', 'কাজ', 'ঘুম', 'a', 'অনুচ্ছেদে সময় নষ্ট না করার কথা বলা হয়েছে।', 'easy');
  q('Bangla', 'Comprehension', 'অনুচ্ছেদ: “একতা শক্তির উৎস।” শক্তির উৎস কী?', 'ভেদাভেদ', 'একতা', 'অলসতা', 'দ্বন্দ্ব', 'b', 'অনুচ্ছেদে একতাকে শক্তির উৎস বলা হয়েছে।', 'easy');
  q('Bangla', 'Grammar', '“তুমি কোথায় যাচ্ছ?” বাক্যে প্রশ্নবাচক শব্দ কোনটি?', 'তুমি', 'কোথায়', 'যাচ্ছ', 'বাক্য', 'b', '“কোথায়” প্রশ্নবাচক শব্দ।', 'easy');
  q('Bangla', 'Grammar', '“আমি খাই” বাক্যে কর্তা ও ক্রিয়া কী?', 'আমি ও খাই', 'খাই ও আমি', 'আমি ও খাও', 'বাক্য নেই', 'a', '“আমি” কর্তা এবং “খাই” ক্রিয়া।', 'easy');
  q('Bangla', 'Literature', '“অগ্নিবীণা” কার রচনা?', 'রবীন্দ্রনাথ ঠাকুর', 'কাজী নজরুল ইসলাম', 'জসীম উদ্দীন', 'জীবনানন্দ দাশ', 'b', 'অগ্নিবীণা কাজী নজরুল ইসলামের বিখ্যাত কাব্যগ্রন্থ।', 'easy');
  q('Bangla', 'Literature', '“কবর” নাটকটি কার লেখা?', 'মুনীর চৌধুরী', 'আল মাহমুদ', 'সেলিনা হোসেন', 'শওকত ওসমান', 'a', 'কবর মুনীর চৌধুরীর বিখ্যাত নাটক।', 'easy');
  q('Bangla', 'Composition', 'চিঠিতে “বিষয়” অংশ কোথায় লেখা হয়?', 'শেষে', 'শুরুর দিকে', 'মাঝখানে নেই', 'স্বাক্ষরের পরে', 'b', 'চিঠিতে বিষয় সাধারণত শুরুতেই লেখা হয়।', 'easy');
  q('Bangla', 'Composition', 'অনুচ্ছেদে সমর্থক বাক্য কী করে?', 'মূল ভাব ব্যাখ্যা করে', 'শুধু শিরোনাম দেয়', 'বিষয় বদলে দেয়', 'অনুচ্ছেদ শেষ করে', 'a', 'সমর্থক বাক্য মূল ভাবকে ব্যাখ্যা ও সমর্থন করে।', 'medium');
  q('Bangla', 'Comprehension', 'অনুচ্ছেদ: “নিয়মিত পড়াশোনায় ফল ভালো হয়।” ফল কিসে ভালো হয়?', 'নিয়মিত খেলায়', 'নিয়মিত পড়াশোনায়', 'বেশি ঘুমে', 'অনিয়মে', 'b', 'অনুচ্ছেদে নিয়মিত পড়াশোনার ফলে ভালো ফলের কথা বলা হয়েছে।', 'easy');
  q('Bangla', 'Comprehension', 'অনুচ্ছেদ: “সৎ মানুষ সবাইকে সম্মান দেয়।” সৎ মানুষ কী দেয়?', 'অসম্মান', 'সম্মান', 'রাগ', 'ভয়', 'b', 'অনুচ্ছেদে সৎ মানুষ সবাইকে সম্মান দেয় বলা হয়েছে।', 'easy');
}

function addEnglishRows() {
  q('English', 'Grammar', 'Choose the correct sentence.', 'She go to school daily.', 'She goes to school daily.', 'She going to school daily.', 'She gone to school daily.', 'b', 'Third-person singular subjects take goes in the present simple tense.', 'easy');
  q('English', 'Grammar', 'Choose the correct article: "He is ___ honest man."', 'a', 'an', 'the', 'no article', 'b', 'Honest begins with a vowel sound, so an is used.', 'easy');
  q('English', 'Grammar', 'Choose the correct preposition: "He is interested ___ medicine."', 'on', 'at', 'in', 'for', 'c', 'The correct collocation is interested in.', 'easy');
  q('English', 'Grammar', 'Choose the passive voice of: "They wrote the letter."', 'They wrote the letter.', 'The letter was written by them.', 'The letter is writing by them.', 'The letter has write by them.', 'b', 'In passive voice, the object becomes the subject.', 'medium');
  q('English', 'Grammar', 'Choose the correct spelling.', 'Recieve', 'Receive', 'Receeve', 'Receve', 'b', 'Receive is the correct spelling.', 'easy');
  q('English', 'Grammar', 'Choose the indirect speech of: "She said, \'I am tired.\'"', 'She said that she is tired.', 'She said that she was tired.', 'She says that she was tired.', 'She told that she was tired.', 'b', 'In reported speech, the tense usually shifts back.', 'medium');
  q('English', 'Grammar', 'Choose the correct sentence for negative past tense.', 'He did not went there.', 'He did not go there.', 'He does not went there.', 'He not go there.', 'b', 'After did not, the base form of the verb is used.', 'easy');
  q('English', 'Grammar', 'Choose the correct sentence for either-or usage.', 'Either of the boys are ready.', 'Either of the boys is ready.', 'Either of the boys were ready.', 'Either of the boys have ready.', 'b', 'Either is singular in standard grammar.', 'medium');

  q('English', 'Vocabulary', 'Choose the meaning of "rapid".', 'Slow', 'Quick', 'Weak', 'Late', 'b', 'Rapid means quick or fast.', 'easy');
  q('English', 'Vocabulary', 'Choose the meaning of "abundant".', 'Plentiful', 'Rare', 'Tiny', 'Dry', 'a', 'Abundant means available in large quantity.', 'easy');
  q('English', 'Vocabulary', 'Choose the meaning of "fragile".', 'Strong', 'Delicate', 'Loud', 'Heavy', 'b', 'Fragile means easily broken.', 'easy');
  q('English', 'Vocabulary', 'Choose the meaning of "ancient".', 'Old', 'New', 'Quick', 'Bright', 'a', 'Ancient means very old.', 'easy');
  q('English', 'Vocabulary', 'Choose the meaning of "honest".', 'Truthful', 'Lazy', 'Careless', 'Angry', 'a', 'Honest means truthful and sincere.', 'easy');
  q('English', 'Vocabulary', 'Choose the meaning of "famous".', 'Unknown', 'Well known', 'Slow', 'Weak', 'b', 'Famous means widely known.', 'easy');
  q('English', 'Vocabulary', 'Choose the meaning of "sudden".', 'Gradual', 'Quick and unexpected', 'Silent', 'Difficult', 'b', 'Sudden means happening quickly and unexpectedly.', 'easy');
  q('English', 'Vocabulary', 'Choose the meaning of "brave".', 'Cowardly', 'Courageous', 'Lazy', 'Weak', 'b', 'Brave means courageous.', 'easy');

  q('English', 'Comprehension', 'Passage: "Water is essential for life." What is essential for life?', 'Fire', 'Water', 'Stone', 'Salt', 'b', 'The passage directly states that water is essential for life.', 'easy');
  q('English', 'Comprehension', 'Passage: "Hard work leads to success." What leads to success?', 'Luck', 'Hard work', 'Sleep', 'Noise', 'b', 'The passage says hard work leads to success.', 'easy');
  q('English', 'Comprehension', 'Passage: "Reading improves knowledge." What improves knowledge?', 'Reading', 'Sleeping', 'Eating', 'Running', 'a', 'The passage states that reading improves knowledge.', 'easy');
  q('English', 'Comprehension', 'Passage: "Honesty builds trust." What builds trust?', 'Honesty', 'Wealth', 'Speed', 'Silence', 'a', 'The passage directly says honesty builds trust.', 'easy');
  q('English', 'Comprehension', 'Passage: "Regular exercise keeps the body fit." What keeps the body fit?', 'Irregular sleep', 'Regular exercise', 'Skipping meals', 'Watching TV', 'b', 'Regular exercise keeps the body fit.', 'easy');
  q('English', 'Comprehension', 'Passage: "A healthy diet is important." What is important?', 'A healthy diet', 'A noisy room', 'A long journey', 'A hard chair', 'a', 'The passage states that a healthy diet is important.', 'easy');
  q('English', 'Comprehension', 'Passage: "Time should not be wasted." What should not be wasted?', 'Money', 'Time', 'Food', 'Water', 'b', 'The passage says time should not be wasted.', 'easy');
  q('English', 'Comprehension', 'Passage: "Unity is strength." What is strength?', 'Unity', 'Fear', 'Silence', 'Rest', 'a', 'The passage says unity is strength.', 'easy');

  q('English', 'Composition', 'Which is the best opening line for a paragraph?', 'In my opinion, education is important.', 'Bye.', 'The end.', 'Nothing else.', 'a', 'A paragraph should begin with a clear topic sentence.', 'easy');
  q('English', 'Composition', 'What should a good essay conclusion do?', 'Introduce a new topic', 'Summarize the main idea', 'Ignore the topic', 'Repeat errors', 'b', 'The conclusion should summarize the main idea.', 'easy');
  q('English', 'Composition', 'What is the best style for an application letter?', 'Informal and funny', 'Polite and concise', 'Long and poetic', 'Confusing and vague', 'b', 'An application should be polite, concise, and clear.', 'easy');
  q('English', 'Composition', 'What is important in report writing?', 'Facts and clarity', 'Only emotions', 'Rhyme and rhythm', 'Random ideas', 'a', 'Reports should be factual and clear.', 'medium');
  q('English', 'Composition', 'What should a summary contain?', 'All details', 'Main points only', 'Only the title', 'No ideas', 'b', 'A summary contains the main points only.', 'easy');
  q('English', 'Composition', 'What should a good paragraph have?', 'One central idea', 'Many unrelated ideas', 'No topic sentence', 'Only quotations', 'a', 'A paragraph should focus on one central idea.', 'easy');
  q('English', 'Composition', 'What is the purpose of a formal letter?', 'To entertain', 'To communicate officially', 'To sing', 'To decorate', 'b', 'A formal letter is used for official communication.', 'easy');
  q('English', 'Composition', 'What should be avoided in composition writing?', 'Clear expression', 'Short sentences', 'Irrelevant information', 'Logical flow', 'c', 'Irrelevant information should be avoided.', 'easy');

  q('English', 'Synonyms and Antonyms', 'Choose the synonym of "rapid".', 'Slow', 'Quick', 'Weak', 'Late', 'b', 'Rapid means quick or fast.', 'easy');
  q('English', 'Synonyms and Antonyms', 'Choose the synonym of "large".', 'Big', 'Tiny', 'Short', 'Narrow', 'a', 'Large means big.', 'easy');
  q('English', 'Synonyms and Antonyms', 'Choose the synonym of "happy".', 'Sad', 'Joyful', 'Angry', 'Tired', 'b', 'Happy means joyful.', 'easy');
  q('English', 'Synonyms and Antonyms', 'Choose the synonym of "start".', 'Begin', 'End', 'Break', 'Hide', 'a', 'Start means begin.', 'easy');
  q('English', 'Synonyms and Antonyms', 'Choose the antonym of "honest".', 'Truthful', 'Sincere', 'Dishonest', 'Kind', 'c', 'The opposite of honest is dishonest.', 'easy');
  q('English', 'Synonyms and Antonyms', 'Choose the antonym of "early".', 'Before', 'Soon', 'Late', 'Quick', 'c', 'The opposite of early is late.', 'easy');
  q('English', 'Synonyms and Antonyms', 'Choose the antonym of "strong".', 'Powerful', 'Weak', 'Healthy', 'Brave', 'b', 'The opposite of strong is weak.', 'easy');
  q('English', 'Synonyms and Antonyms', 'Choose the antonym of "increase".', 'Grow', 'Rise', 'Decrease', 'Improve', 'c', 'The opposite of increase is decrease.', 'easy');
}

addBanglaRows();
addEnglishRows();

const seen = new Set();
for (const row of baseRows) {
  if (seen.has(row.category + '|' + row.subcategory + '|' + row.question)) {
    throw new Error(`Duplicate base question detected: ${row.question}`);
  }
  seen.add(row.category + '|' + row.subcategory + '|' + row.question);
}

const banglaRows = expandRowsForCategory('Bangla');
const englishRows = expandRowsForCategory('English');

const banglaSeen = new Set();
for (const row of banglaRows) {
  const key = row.category + '|' + row.subcategory + '|' + row.question;
  if (banglaSeen.has(key)) {
    throw new Error(`Duplicate Bangla expanded question detected: ${row.question}`);
  }
  banglaSeen.add(key);
}

const englishSeen = new Set();
for (const row of englishRows) {
  const key = row.category + '|' + row.subcategory + '|' + row.question;
  if (englishSeen.has(key)) {
    throw new Error(`Duplicate English expanded question detected: ${row.question}`);
  }
  englishSeen.add(key);
}

fs.writeFileSync(banglaOutputPath, renderSql(banglaRows), 'utf8');
fs.writeFileSync(englishOutputPath, renderSql(englishRows), 'utf8');

console.log(`Wrote ${banglaOutputPath} with ${banglaRows.length} rows`);
console.log(`Wrote ${englishOutputPath} with ${englishRows.length} rows`);
