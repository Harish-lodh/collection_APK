import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { fetchPendingCashPayments } from '../utils/index.js';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatDate = (d) => {
  if (!d) return '-';
  // supports "YYYY-MM-DD" or ISO strings
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function PendingCashPaymentsScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  const getCollectorFromStorage = async () => {
    try {
      const raw = await AsyncStorage.getItem('user');
      if (!raw) return null;
      try {
        const obj = JSON.parse(raw);
        return obj?.name || obj?.username || null;
      } catch {
        return raw;
      }
    } catch {
      return null;
    }
  };

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const collectedBy = await getCollectorFromStorage();
      const list = await fetchPendingCashPayments(collectedBy);
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Fetch pending list error:', e);
      Alert.alert('Failed to load', 'Could not load pending payments. Please try again.');
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      String(it.customerName || '').toLowerCase().includes(q) ||
      String(it.loanId || '').toLowerCase().includes(q)
    );
  }, [items, query]);

  const onRefresh = useCallback(() => load(true), [load]);

  const renderItem = ({ item }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.name} numberOfLines={1}>{item.customerName || '-'}</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>Pending</Text>
        </View>
      </View>

      <View style={s.row}>
        <Text style={s.label}>LAN</Text>
        <Text style={s.value}>{item.loanId || '-'}</Text>
      </View>

      <View style={s.row}>
        <Text style={s.label}>Amount</Text>
        <Text style={[s.value, s.amount]}>{inr.format(Number(item.amount || 0))}</Text>
      </View>

      <View style={s.row}>
        <Text style={s.label}>Date</Text>
        <Text style={s.value}>{formatDate(item.paymentDate)}</Text>
      </View>

      <View style={s.row}>
        <Text style={s.label}>Mode</Text>
        <Text style={s.value}>{item.paymentMode || '-'}</Text>
      </View>

      <View style={s.row}>
        <Text style={s.label}>Collected By</Text>
        <Text style={s.value}>{item.collectedBy || '-'}</Text>
      </View>

      <View style={s.actions}>
        <Pressable
          onPress={() => navigation.navigate('PaymentImage2', { payment: item })}
          style={({ pressed }) => [s.btnPrimary, pressed && s.btnPressed]}
        >
          <Text style={s.btnPrimaryText}>View / Add Receipt Image</Text>
        </Pressable>
        <Pressable onPress={onRefresh} style={({ pressed }) => [s.btnGhost, pressed && s.btnGhostPressed]}>
          <Text style={s.btnGhostText}>Refresh</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={s.centerFill}>
        <ActivityIndicator size="large" />
        <Text style={s.muted}>Loading pending payments…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Cash Receipts to be deposited in bank</Text>
        <Text style={s.subtitle}>Receipts pending for cash collection!</Text>
      </View>

      <View style={s.searchWrap}>
        <TextInput
          placeholder="Search by customer or LAN…"
          value={query}
          onChangeText={setQuery}
          style={s.search}
          placeholderTextColor="#8A8A8E"
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        contentContainerStyle={filtered.length === 0 ? s.emptyPad : { paddingHorizontal: 12, paddingBottom: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🎉</Text>
            <Text style={s.emptyTitle}>All caught up</Text>
            <Text style={s.muted}>No pending second images.</Text>
            <Pressable onPress={onRefresh} style={({ pressed }) => [s.btnGhost, pressed && s.btnGhostPressed, { marginTop: 12 }]}>
              <Text style={s.btnGhostText}>Reload</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7FB' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827',marginVertical:8 },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 8 },
  search: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: '#92400E', fontWeight: '600', fontSize: 12 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: { color: '#6B7280', fontSize: 13 },
  value: { color: '#111827', fontSize: 14, fontWeight: '600' },
  amount: { color: '#065F46' },

  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: { color: 'white', fontWeight: '700' },
  btnGhost: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  btnGhostText: { color: '#374151', fontWeight: '600' },
  btnPressed: { opacity: 0.85 },
  btnGhostPressed: { backgroundColor: '#F3F4F6' },

  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F7FB' },
  muted: { color: '#6B7280', marginTop: 6 },
  emptyPad: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  empty: { alignItems: 'center' },
  emptyEmoji: { fontSize: 42, marginBottom: 6 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 2 },
});
