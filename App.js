import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

// ─── Data Awal (Contoh Transaksi) ───────────────────────────────────────────
const INITIAL_TRANSAKSI = [
  { id: '1', ket: 'Uang Saku Bulanan', nominal: 500000, tipe: 'masuk' },
  { id: '2', ket: 'Beli Makan Siang', nominal: 25000, tipe: 'keluar' },
  { id: '3', ket: 'Transfer dari Ortu', nominal: 200000, tipe: 'masuk' },
  { id: '4', ket: 'Beli Pulsa', nominal: 50000, tipe: 'keluar' },
];

// ─── Helper: Format Rupiah ───────────────────────────────────────────────────
const formatRupiah = (angka) => {
  return 'Rp ' + Math.abs(angka).toLocaleString('id-ID');
};

// ─── Komponen Item Transaksi ─────────────────────────────────────────────────
const TransaksiItem = ({ item, onDelete }) => {
  const isMasuk = item.tipe === 'masuk';
  return (
    <View style={styles.itemCard}>
      <View style={[styles.itemIcon, { backgroundColor: isMasuk ? '#E8F5E9' : '#FFEBEE' }]}>
        <Text style={{ fontSize: 20 }}>{isMasuk ? '📥' : '📤'}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemKet} numberOfLines={1}>{item.ket}</Text>
        <Text style={styles.itemTipe}>{isMasuk ? 'Pemasukan' : 'Pengeluaran'}</Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={[styles.itemNominal, { color: isMasuk ? '#2E7D32' : '#C62828' }]}>
          {isMasuk ? '+' : '-'} {formatRupiah(item.nominal)}
        </Text>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Komponen Utama ──────────────────────────────────────────────────────────
export default function App() {
  const [transaksi, setTransaksi] = useState(INITIAL_TRANSAKSI);
  const [deskripsi, setDeskripsi] = useState('');
  const [nominal, setNominal] = useState('');

  // ── Hitung Total Saldo ──
  const totalSaldo = transaksi.reduce((acc, item) => {
    return item.tipe === 'masuk' ? acc + item.nominal : acc - item.nominal;
  }, 0);

  // ── Hitung Total Pemasukan & Pengeluaran ──
  const totalMasuk = transaksi
    .filter((t) => t.tipe === 'masuk')
    .reduce((acc, t) => acc + t.nominal, 0);

  const totalKeluar = transaksi
    .filter((t) => t.tipe === 'keluar')
    .reduce((acc, t) => acc + t.nominal, 0);

  // ── Tambah Transaksi ──
  const tambahTransaksi = (tipe) => {
    if (!deskripsi.trim()) {
      Alert.alert('Oops!', 'Deskripsi transaksi tidak boleh kosong.');
      return;
    }
    const nominalAngka = parseFloat(nominal);
    if (!nominal || isNaN(nominalAngka) || nominalAngka <= 0) {
      Alert.alert('Oops!', 'Nominal harus berupa angka lebih dari 0.');
      return;
    }
    const transaksieBaru = {
      id: Date.now().toString(),
      ket: deskripsi.trim(),
      nominal: nominalAngka,
      tipe: tipe,
    };
    setTransaksi([transaksieBaru, ...transaksi]);
    setDeskripsi('');
    setNominal('');
  };

  // ── Hapus Transaksi ──
  const hapusTransaksi = (id) => {
    Alert.alert(
      'Hapus Transaksi',
      'Apakah kamu yakin ingin menghapus transaksi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => setTransaksi(transaksi.filter((t) => t.id !== id)),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1A237E" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <FlatList
          data={transaksi}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransaksiItem item={item} onDelete={hapusTransaksi} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>💸</Text>
              <Text style={styles.emptyLabel}>Belum ada transaksi</Text>
              <Text style={styles.emptySubLabel}>Tambahkan transaksi pertamamu!</Text>
            </View>
          }
          ListHeaderComponent={
            <View>
              {/* ── Header Saldo ── */}
              <View style={styles.header}>
                <Text style={styles.appTitle}>💳 DompetKu</Text>
                <Text style={styles.saldoLabel}>Saldo Saat Ini</Text>
                <Text
                  style={[
                    styles.saldoNominal,
                    { color: totalSaldo >= 0 ? '#A5D6A7' : '#EF9A9A' },
                  ]}
                >
                  {formatRupiah(totalSaldo)}
                </Text>

                {/* ── Ringkasan Masuk / Keluar ── */}
                <View style={styles.summaryRow}>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryIcon}>📈</Text>
                    <Text style={styles.summaryLabel}>Pemasukan</Text>
                    <Text style={[styles.summaryNominal, { color: '#A5D6A7' }]}>
                      {formatRupiah(totalMasuk)}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryIcon}>📉</Text>
                    <Text style={styles.summaryLabel}>Pengeluaran</Text>
                    <Text style={[styles.summaryNominal, { color: '#EF9A9A' }]}>
                      {formatRupiah(totalKeluar)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* ── Form Input ── */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Tambah Transaksi</Text>

                <Text style={styles.inputLabel}>Deskripsi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Beli Makan, Uang Bulanan..."
                  placeholderTextColor="#BDBDBD"
                  value={deskripsi}
                  onChangeText={setDeskripsi}
                  maxLength={50}
                />

                <Text style={styles.inputLabel}>Nominal (Rp)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 50000"
                  placeholderTextColor="#BDBDBD"
                  value={nominal}
                  onChangeText={setNominal}
                  keyboardType="numeric"
                />

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnMasuk]}
                    onPress={() => tambahTransaksi('masuk')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnText}>+ Pemasukan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnKeluar]}
                    onPress={() => tambahTransaksi('keluar')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnText}>- Pengeluaran</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ── Label Riwayat ── */}
              <View style={styles.riwayatHeader}>
                <Text style={styles.riwayatTitle}>Riwayat Transaksi</Text>
                <Text style={styles.riwayatCount}>{transaksi.length} transaksi</Text>
              </View>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header Saldo
  header: {
    backgroundColor: '#1A237E',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    color: '#C5CAE9',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  saldoLabel: {
    color: '#9FA8DA',
    fontSize: 13,
    marginBottom: 6,
  },
  saldoNominal: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: '#283593',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#3F51B5',
    marginVertical: 4,
  },
  summaryIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#9FA8DA',
    fontSize: 12,
    marginBottom: 4,
  },
  summaryNominal: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Form
  formCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A237E',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#616161',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#212121',
    backgroundColor: '#FAFAFA',
    marginBottom: 14,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnMasuk: {
    backgroundColor: '#2E7D32',
  },
  btnKeluar: {
    backgroundColor: '#C62828',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Riwayat Header
  riwayatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  riwayatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  riwayatCount: {
    fontSize: 13,
    color: '#9E9E9E',
  },

  // Item Transaksi
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemKet: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 3,
  },
  itemTipe: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  itemNominal: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: '#C62828',
    fontSize: 11,
    fontWeight: '700',
  },

  // List
  listContent: {
    paddingBottom: 30,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#616161',
    marginBottom: 4,
  },
  emptySubLabel: {
    fontSize: 13,
    color: '#BDBDBD',
  },
});
