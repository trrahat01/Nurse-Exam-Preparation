import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { ChapterItem } from '@/components/ChapterItem';
import { CATEGORY_CONFIG } from '@/lib/types';

const CATEGORIES = Object.values(CATEGORY_CONFIG);

export default function PracticeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].name);

  const activeCfg = CATEGORY_CONFIG[activeCategory];
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Practice</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          Select a subject and chapter
        </Text>

        {/* Category tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          <View style={styles.tabs}>
            {CATEGORIES.map(cat => {
              const active = cat.name === activeCategory;
              return (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.tab,
                    active
                      ? { backgroundColor: cat.color, borderColor: cat.color }
                      : { backgroundColor: colors.secondary, borderColor: colors.border },
                  ]}
                  onPress={() => setActiveCategory(cat.name)}
                >
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={14}
                    color={active ? '#fff' : cat.color}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: active ? '#fff' : colors.foreground },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Chapter list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.catBanner, { backgroundColor: activeCfg.bgColor }]}>
          <MaterialCommunityIcons name={activeCfg.icon as any} size={32} color={activeCfg.color} />
          <View>
            <Text style={[styles.catName, { color: activeCfg.color }]}>{activeCfg.name}</Text>
            <Text style={[styles.catDesc, { color: activeCfg.color + 'AA' }]}>
              {activeCfg.chapters.length} Chapters
            </Text>
          </View>
        </View>

        {activeCfg.chapters.map((chapter, i) => (
          <ChapterItem
            key={chapter}
            name={chapter}
            index={i}
            accentColor={activeCfg.color}
            onPress={() =>
              router.push({
                pathname: '/category/[id]',
                params: {
                  id: activeCfg.name,
                  chapter,
                  category: activeCfg.name,
                },
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  tabScroll: { marginHorizontal: -16 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  list: { flex: 1 },
  catBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    marginBottom: 4,
  },
  catName: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  catDesc: { fontSize: 13, fontFamily: 'Inter_400Regular' },
});
