import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useExam } from '@/contexts/ExamContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveResult } from '@/lib/queries';
import { TimerBar } from '@/components/TimerBar';
import { OptionButton } from '@/components/OptionButton';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import type { AnswerOption } from '@/lib/types';

export default function ExamScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { session, submitExam, setAnswer, toggleMark, goToQuestion, clearExam } = useExam();
  const { mutateAsync: saveResult } = useSaveResult();
  const [showGrid, setShowGrid] = useState(false);
  const isPractice = session?.examType === 'practice';

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  useEffect(() => {
    if (!session) {
      router.replace('/(tabs)/mock');
    }
  }, []);

  if (!session) return null;

  const { questions, answers, markedForReview, currentIndex, timeLeft, examType } = session;
  const totalTime = examType === 'mock' ? 3600 :
    examType === 'daily_20' ? 1200 :
    examType === 'daily_50' ? 3000 :
    examType === 'daily_100' ? 6000 : 1800;

  const question = questions[currentIndex];
  if (!question) return null;

  const selectedAnswer = answers[question.id] ?? null;
  const isMarked = markedForReview.includes(question.id);

  const handleAnswer = (opt: AnswerOption) => {
    if (isPractice && selectedAnswer) return;
    setAnswer(question.id, opt);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmit = async () => {
    const attempted = Object.keys(answers).length;
    const unanswered = questions.length - attempted;

    Alert.alert(
      'Submit Exam',
      unanswered > 0
        ? `${unanswered} questions unanswered. Submit anyway?`
        : 'Are you sure you want to submit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          style: 'destructive',
          onPress: async () => {
            const result = submitExam();
            if (user?.id) {
              try {
                await saveResult({
                  user_id: user.id,
                  score: result.score,
                  correct: result.correct,
                  wrong: result.wrong,
                  skipped: result.skipped,
                  percentage: result.percentage,
                  time_taken: result.timeTaken,
                  exam_type: result.examType,
                });
              } catch (e) {
                console.error('Save result failed:', e);
              }
            }
            router.replace('/exam/result');
          },
        },
      ]
    );
  };

  const opts: AnswerOption[] = ['a', 'b', 'c', 'd'];
  const optTexts: Record<AnswerOption, string> = {
    a: question.option_a,
    b: question.option_b,
    c: question.option_c,
    d: question.option_d,
  };

  const answered = Object.keys(answers).length;
  const marked = markedForReview.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => {
            Alert.alert('Exit Exam', 'Exit without submitting? Progress will be lost.', [
              { text: 'Stay', style: 'cancel' },
              { text: 'Exit', style: 'destructive', onPress: () => { clearExam(); router.replace('/(tabs)/mock'); } },
            ]);
          }}>
            <MaterialCommunityIcons name="close" size={24} color={colors.foreground} />
          </Pressable>

          <View style={styles.examInfo}>
            <Text style={[styles.examType, { color: colors.foreground }]}>
              {examType === 'mock' ? 'Mock Test' : examType === 'practice' ? 'Practice' : 'Daily Practice'}
            </Text>
            <Text style={[styles.qNum, { color: colors.mutedForeground }]}>
              {currentIndex + 1} / {questions.length}
            </Text>
          </View>

          <Pressable onPress={() => setShowGrid(g => !g)}>
            <MaterialCommunityIcons
              name="view-grid-outline"
              size={24}
              color={showGrid ? colors.primary : colors.foreground}
            />
          </Pressable>
        </View>

        {!isPractice && (
          <View style={styles.timerWrap}>
            <TimerBar timeLeft={timeLeft} totalTime={totalTime} />
          </View>
        )}

        {/* Progress */}
        <View style={[styles.progTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progFill,
              { backgroundColor: colors.primary, width: `${((currentIndex + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>

        <View style={styles.statusRow}>
          <View style={styles.badge}>
            <View style={[styles.badgeDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>{answered} Answered</Text>
          </View>
          {marked > 0 && (
            <View style={styles.badge}>
              <View style={[styles.badgeDot, { backgroundColor: colors.warning }]} />
              <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>{marked} Marked</Text>
            </View>
          )}
          <View style={styles.badge}>
            <View style={[styles.badgeDot, { backgroundColor: colors.border }]} />
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
              {questions.length - answered} Left
            </Text>
          </View>
        </View>
      </View>

      {/* Question grid overlay */}
      {showGrid && (
        <View style={[styles.grid, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ScrollView style={{ maxHeight: 200 }} contentContainerStyle={styles.gridContent}>
            {questions.map((q, i) => {
              const ans = answers[q.id];
              const mark = markedForReview.includes(q.id);
              let bg = colors.secondary;
              let textCol = colors.mutedForeground;
              if (i === currentIndex) { bg = colors.primary; textCol = '#fff'; }
              else if (mark) { bg = '#FEF3C7'; textCol = '#D97706'; }
              else if (ans) { bg = '#D1FAE5'; textCol = '#059669'; }
              return (
                <Pressable
                  key={q.id}
                  style={[styles.gridCell, { backgroundColor: bg }]}
                  onPress={() => { goToQuestion(i); setShowGrid(false); }}
                >
                  <Text style={[styles.gridNum, { color: textCol }]}>{i + 1}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Question + Options */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.bodyContent, { paddingBottom: bottomPad + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.qHeader}>
            <Text style={[styles.qCategory, { color: colors.primary }]}>{question.subcategory}</Text>
            <DifficultyBadge difficulty={question.difficulty} />
          </View>
          <Text style={[styles.qText, { color: colors.foreground }]}>
            {currentIndex + 1}. {question.question}
          </Text>
        </View>

        <View style={styles.options}>
          {opts.map(opt => (
            <OptionButton
              key={opt}
              option={opt}
              text={optTexts[opt]}
              selected={selectedAnswer === opt}
              correctAnswer={isPractice && selectedAnswer ? question.correct_answer : undefined}
              revealed={isPractice && !!selectedAnswer}
              onPress={() => handleAnswer(opt)}
              disabled={isPractice && !!selectedAnswer}
            />
          ))}
        </View>

        {/* Explanation in practice mode */}
        {isPractice && selectedAnswer && question.explanation && (
          <View style={[styles.explanation, { backgroundColor: '#E0F2FE', borderColor: '#0891B2' }]}>
            <Text style={styles.explainTitle}>Explanation</Text>
            <Text style={styles.explainText}>{question.explanation}</Text>
            {question.reference && (
              <Text style={styles.explainRef}>Reference: {question.reference}</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom nav */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 8, backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.navBtn, { borderColor: colors.border }, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={() => currentIndex > 0 && goToQuestion(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <MaterialCommunityIcons name="chevron-left" size={22} color={currentIndex === 0 ? colors.border : colors.foreground} />
          <Text style={[styles.navBtnText, { color: currentIndex === 0 ? colors.border : colors.foreground }]}>Prev</Text>
        </Pressable>

        <Pressable
          style={[styles.markBtn, { backgroundColor: isMarked ? '#FEF3C7' : colors.secondary, borderColor: isMarked ? '#D97706' : colors.border }]}
          onPress={() => { toggleMark(question.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
        >
          <MaterialCommunityIcons
            name={isMarked ? 'flag' : 'flag-outline'}
            size={18}
            color={isMarked ? '#D97706' : colors.mutedForeground}
          />
        </Pressable>

        {currentIndex < questions.length - 1 ? (
          <Pressable
            style={[styles.navBtn, { borderColor: colors.border }]}
            onPress={() => goToQuestion(currentIndex + 1)}
          >
            <Text style={[styles.navBtnText, { color: colors.foreground }]}>Next</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.foreground} />
          </Pressable>
        ) : (
          <Pressable
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitText}>Submit</Text>
            <MaterialCommunityIcons name="check" size={18} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1, gap: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  examInfo: { alignItems: 'center' },
  examType: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  qNum: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  timerWrap: { paddingTop: 4 },
  progTrack: { height: 3, borderRadius: 2, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 2 },
  statusRow: { flexDirection: 'row', gap: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  grid: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: 1, paddingTop: 120, elevation: 10 },
  gridContent: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  gridCell: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  gridNum: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  body: { flex: 1 },
  bodyContent: { padding: 16, gap: 12 },
  questionCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qCategory: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  qText: { fontSize: 16, fontFamily: 'Inter_500Medium', lineHeight: 24 },
  options: { gap: 10 },
  explanation: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 8 },
  explainTitle: { color: '#0891B2', fontSize: 13, fontFamily: 'Inter_700Bold' },
  explainText: { color: '#0C4A6E', fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  explainRef: { color: '#64748B', fontSize: 11, fontFamily: 'Inter_400Regular', fontStyle: 'italic' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, gap: 8 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 14, flex: 1, justifyContent: 'center' },
  navBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  navBtnDisabled: { opacity: 0.4 },
  markBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, flex: 1, justifyContent: 'center' },
  submitText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' },
});
