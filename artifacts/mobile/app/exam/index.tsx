import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useExamStore } from '@/src/store/examStore';
import type { AnswerOption } from '@/src/types';

export default function ExamScreen() {
  const insets = useSafeAreaInsets();
  const { session, submitExam, setAnswer, toggleMark, goToQuestion, clearExam, tickTimer } = useExamStore();
  const [showGrid, setShowGrid] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!session) { router.replace('/(tabs)/mock'); return; }
    if (session.examType === 'practice') return;

    timerRef.current = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.isRunning]);

  if (!session) return null;

  const { questions, answers, markedForReview, currentIndex, timeLeft, examType } = session;
  const totalTime = examType === 'mock' ? 3600 : examType === 'daily_20' ? 1200 : examType === 'daily_50' ? 3000 : examType === 'daily_100' ? 6000 : 1800;
  const isPractice = examType === 'practice';
  const question = questions[currentIndex];
  if (!question) return null;

  const selectedAnswer = answers[question.id] ?? null;
  const isMarked = markedForReview.includes(question.id);
  const answered = Object.keys(answers).length;
  const marked = markedForReview.length;

  const mm = Math.floor(timeLeft / 60);
  const ss = timeLeft % 60;
  const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;

  const handleAnswer = (opt: AnswerOption) => {
    if (isPractice && selectedAnswer) return;
    setAnswer(question.id, opt);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmit = () => {
    const unanswered = questions.length - answered;
    Alert.alert('Submit Exam', unanswered > 0 ? `${unanswered} questions unanswered. Submit anyway?` : 'Are you sure you want to submit?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Submit', style: 'destructive', onPress: () => { submitExam(); router.replace('/exam/result'); } },
    ]);
  };

  const opts: AnswerOption[] = ['a', 'b', 'c', 'd'];
  const optTexts: Record<AnswerOption, string> = { a: question.option_a, b: question.option_b, c: question.option_c, d: question.option_d };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => Alert.alert('Exit Exam', 'Exit without submitting? Progress will be lost.', [
            { text: 'Stay', style: 'cancel' },
            { text: 'Exit', style: 'destructive', onPress: () => { clearExam(); router.replace('/(tabs)/mock'); } },
          ])}>
            <MaterialCommunityIcons name="close" size={24} color="#0C1A2E" />
          </Pressable>
          <View style={styles.examInfo}>
            <Text style={styles.examType}>{examType === 'mock' ? 'Mock Test' : isPractice ? 'Practice' : 'Daily Practice'}</Text>
            <Text style={styles.qNum}>{currentIndex + 1} / {questions.length}</Text>
          </View>
          <Pressable onPress={() => setShowGrid(g => !g)}>
            <MaterialCommunityIcons name="view-grid-outline" size={24} color={showGrid ? '#0891B2' : '#0C1A2E'} />
          </Pressable>
        </View>

        {!isPractice && (
          <View style={styles.timerRow}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={timeLeft < 300 ? '#EF4444' : '#64748B'} />
            <Text style={[styles.timerText, { color: timeLeft < 300 ? '#EF4444' : '#0C1A2E' }]}>
              {mm}:{ss.toString().padStart(2, '0')}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: timeLeft < 300 ? '#EF4444' : '#0891B2' }]} />
            </View>
          </View>
        )}

        <View style={styles.statusRow}>
          <View style={styles.badge}><View style={[styles.badgeDot, { backgroundColor: '#10B981' }]} /><Text style={styles.badgeText}>{answered} Answered</Text></View>
          {marked > 0 && <View style={styles.badge}><View style={[styles.badgeDot, { backgroundColor: '#F59E0B' }]} /><Text style={styles.badgeText}>{marked} Marked</Text></View>}
          <View style={styles.badge}><View style={[styles.badgeDot, { backgroundColor: '#CBD5E1' }]} /><Text style={styles.badgeText}>{questions.length - answered} Left</Text></View>
        </View>
      </View>

      {/* Question Grid */}
      {showGrid && (
        <View style={styles.grid}>
          <ScrollView style={{ maxHeight: 200 }} contentContainerStyle={styles.gridContent}>
            {questions.map((q, i) => {
              const ans = answers[q.id];
              const mark = markedForReview.includes(q.id);
              let bg = '#F1F5F9', textCol = '#64748B';
              if (i === currentIndex) { bg = '#0891B2'; textCol = '#fff'; }
              else if (mark) { bg = '#FEF3C7'; textCol = '#D97706'; }
              else if (ans) { bg = '#D1FAE5'; textCol = '#059669'; }
              return (
                <Pressable key={q.id} style={[styles.gridCell, { backgroundColor: bg }]} onPress={() => { goToQuestion(i); setShowGrid(false); }}>
                  <Text style={[styles.gridNum, { color: textCol }]}>{i + 1}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Question */}
      <ScrollView style={styles.body} contentContainerStyle={[styles.bodyContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <View style={styles.qHeader}>
            <Text style={styles.qCategory}>{question.subcategory}</Text>
            <View style={[styles.diffBadge, { backgroundColor: question.difficulty === 'easy' ? '#D1FAE5' : question.difficulty === 'medium' ? '#FEF3C7' : '#FEE2E2' }]}>
              <Text style={[styles.diffText, { color: question.difficulty === 'easy' ? '#059669' : question.difficulty === 'medium' ? '#D97706' : '#DC2626' }]}>
                {question.difficulty}
              </Text>
            </View>
          </View>
          <Text style={styles.qText}>{currentIndex + 1}. {question.question}</Text>
        </View>

        <View style={styles.options}>
          {opts.map(opt => (
            <Pressable
              key={opt}
              style={[styles.optionBtn, selectedAnswer === opt && styles.optionSelected, isPractice && selectedAnswer && opt === question.correct_answer && { borderColor: '#059669', backgroundColor: '#D1FAE5' }, isPractice && selectedAnswer && opt === selectedAnswer && opt !== question.correct_answer && { borderColor: '#DC2626', backgroundColor: '#FEE2E2' }]}
              onPress={() => handleAnswer(opt)}
              disabled={isPractice && !!selectedAnswer}
            >
              <View style={[styles.optionCircle, selectedAnswer === opt && { backgroundColor: '#0891B2' }, isPractice && selectedAnswer && opt === question.correct_answer && { backgroundColor: '#059669' }, isPractice && selectedAnswer && opt === selectedAnswer && opt !== question.correct_answer && { backgroundColor: '#DC2626' }]}>
                <Text style={[styles.optionLetter, selectedAnswer === opt && { color: '#fff' }]}>{opt.toUpperCase()}</Text>
              </View>
              <Text style={[styles.optionText, selectedAnswer === opt && { color: '#0891B2', fontFamily: 'Inter_600SemiBold' }]}>{optTexts[opt]}</Text>
            </Pressable>
          ))}
        </View>

        {isPractice && selectedAnswer && question.explanation && (
          <View style={styles.explanation}>
            <Text style={styles.explainTitle}>Explanation</Text>
            <Text style={styles.explainText}>{question.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable style={[styles.navBtn, currentIndex === 0 && { opacity: 0.4 }]} onPress={() => currentIndex > 0 && goToQuestion(currentIndex - 1)} disabled={currentIndex === 0}>
          <MaterialCommunityIcons name="chevron-left" size={20} color="#0C1A2E" />
          <Text style={styles.navBtnText}>Prev</Text>
        </Pressable>
        <Pressable style={[styles.markBtn, isMarked && { backgroundColor: '#FEF3C7', borderColor: '#D97706' }]} onPress={() => { toggleMark(question.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
          <MaterialCommunityIcons name={isMarked ? 'flag' : 'flag-outline'} size={18} color={isMarked ? '#D97706' : '#64748B'} />
        </Pressable>
        {currentIndex < questions.length - 1 ? (
          <Pressable style={styles.navBtn} onPress={() => goToQuestion(currentIndex + 1)}>
            <Text style={styles.navBtnText}>Next</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#0C1A2E" />
          </Pressable>
        ) : (
          <Pressable style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
            <MaterialCommunityIcons name="check" size={18} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topBar: { paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', gap: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  examInfo: { alignItems: 'center' },
  examType: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  qNum: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B' },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timerText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  progressBar: { flex: 1, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  statusRow: { flexDirection: 'row', gap: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748B' },
  grid: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingTop: 120, elevation: 10 },
  gridContent: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  gridCell: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  gridNum: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  body: { flex: 1 },
  bodyContent: { padding: 16, gap: 12 },
  questionCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 10 },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qCategory: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#0891B2' },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  diffText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  qText: { fontSize: 16, fontFamily: 'Inter_500Medium', color: '#0C1A2E', lineHeight: 24 },
  options: { gap: 10 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', padding: 14 },
  optionSelected: { borderColor: '#0891B2', backgroundColor: '#F0F9FF' },
  optionCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  optionLetter: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#64748B' },
  optionText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', color: '#0C1A2E', lineHeight: 20 },
  explanation: { backgroundColor: '#E0F2FE', borderRadius: 14, borderWidth: 1, borderColor: '#BAE6FD', padding: 16, gap: 8 },
  explainTitle: { color: '#0891B2', fontSize: 13, fontFamily: 'Inter_700Bold' },
  explainText: { color: '#0C4A6E', fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0', gap: 8 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 10, paddingHorizontal: 14, flex: 1, justifyContent: 'center' },
  navBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#0C1A2E' },
  markBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, backgroundColor: '#0891B2', paddingVertical: 10, paddingHorizontal: 16, flex: 1, justifyContent: 'center' },
  submitText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' },
});