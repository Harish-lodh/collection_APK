import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';
import styles from '../utils/style';
import { Dropdown } from 'react-native-element-dropdown';
import Loader from '../components/loader';
import apiClient from '../server/apiClient';
import { getReceiptPdfUrl } from '../utils/index.js';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';


const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const formatDate = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function ReceiptDownloadScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchType, setSearchType] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const searchOptions = [
    { label: 'Customer Name', value: 'customerName' },
    { label: 'Mobile Number', value: 'mobileNumber' },
    { label: 'PAN Number', value: 'panNumber' },
    { label: 'Partner LoanId', value: 'partnerLoanId' },
    { label: 'LAN', value: 'lan' },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user && Array.isArray(user.permissions)) {
          const productItems = user.permissions.map(perm => ({
            label: perm.charAt(0).toUpperCase() + perm.slice(1),
            value: perm,
          }));
          setProducts(productItems);
          if (productItems.length > 0) {
            setSelectedProduct(productItems[0].value);
          }
        } else {
          setProducts([{ label: 'Embifi', value: 'embifi' }]);
          setSelectedProduct('embifi');
        }
      } else {
        setProducts([{ label: 'Embifi', value: 'embifi' }]);
        setSelectedProduct('embifi');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([{ label: 'Embifi', value: 'embifi' }]);
      setSelectedProduct('embifi');
    }

    if (searchOptions.length > 0) {
      setSearchType(searchOptions[0].value);
    }
  };

  const handleSearch = async () => {
    if (!selectedProduct || !searchType || !searchValue.trim()) {
      Alert.alert('Required', 'Please select a product, search type, and enter a value');
      return;
    }

    setIsLoading(true);
    setCustomerData(null);
    setReceipts([]);
    setSearchResults([]);
    setModalVisible(false);

    try {
      const response = await apiClient.get('/lms/user-Details', {
        params: {
          product: selectedProduct,
          [searchType]: searchValue.trim(),
        },
      });

      const data = response.data?.data ?? [];

      if (data.length === 0) {
        Alert.alert('No Data', 'No customer found');
      } else if (data.length === 1) {
        setCustomerData(data[0]);
        fetchReceipts(data[0]);
      } else {
        setSearchResults(data);
        setModalVisible(true);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        Alert.alert('No Data', 'No customer found');
      } else {
        console.error('API error:', error);
        Alert.alert('Error', 'Failed to fetch customer data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReceipts = async (customer) => {
    setIsLoading(true);
    try {
      const lanId = customer.lan || customer.loanId;
      console.log(lanId)
     const response = await apiClient.get(`/loanDetails/getReceiptList/${lanId}`);
     console.log(response.data)
      const receiptsData = response.data?.data || [];
      setReceipts(receiptsData);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setReceipts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectResult = (item) => {
    setCustomerData(item);
    setModalVisible(false);
    setSearchResults([]);
    fetchReceipts(item);
  };

  const handleViewReceipt = async (receipt) => {
    try {
      const url = getReceiptPdfUrl(receipt.id);
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open PDF. Please try downloading instead.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open receipt');
    }
  };

const handleDownloadPdf = async (receipt) => {
  try {
    setDownloadingId(receipt.id);

    const response = await apiClient.get(
      `/web/collection/${receipt.id}/receipt?partner=${selectedProduct}`,
      { responseType: 'arraybuffer' }
    );

    const path =
      `${RNFS.DownloadDirectoryPath}/receipt-${receipt.id}.pdf`;

    await RNFS.writeFile(
      path,
      Buffer.from(response.data, 'binary').toString('base64'),
      'base64'
    );

    Alert.alert('Success', 'Receipt downloaded to Downloads folder');

  } catch (err) {
    console.log(err);
    Alert.alert('Error', 'Download failed');
  } finally {
    setDownloadingId(null);
  }
};

  const renderResultRow = ({ item }) => (
    <TouchableOpacity
      style={resultStyles.row}
      onPress={() => selectResult(item)}
    >
      <View style={{ flex: 1 }}>
        <Text style={resultStyles.name}>
          {item.customerName || item.name || 'Unknown name'}
        </Text>
        <Text style={resultStyles.sub}>
          {item.mobileNumber || item.mobile || 'No mobile'} •{' '}
          {item.lan ? `LAN: ${item.lan}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderReceiptItem = ({ item, index }) => (
    <View
      style={[
        tableStyles.row,
        index % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd,
      ]}
    >
      <Text style={[tableStyles.cell, tableStyles.amountCell]}>
        {inr.format(Number(item.amount || 0))}
      </Text>
      <Text style={[tableStyles.cell, tableStyles.dateCell]}>
        {formatDate(item.paymentDate)}
      </Text>
      <Text style={[tableStyles.cell, tableStyles.modeCell]}>
        {item.paymentMode || '-'}
      </Text>
      <TouchableOpacity
        onPress={() => handleDownloadPdf(item)}
        style={tableStyles.downloadBtn}
        disabled={downloadingId === item.id}
      >
        {downloadingId === item.id ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={tableStyles.downloadBtnText}>Download</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Receipt Download</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Select Product</Text>
          <Dropdown
            style={styles.dropdown}
            data={products}
            labelField="label"
            valueField="value"
            placeholder="Select product"
            value={selectedProduct}
            onChange={item => {
              setSelectedProduct(item.value);
              setSearchType(null);
              setSearchValue('');
              setCustomerData(null);
              setReceipts([]);
            }}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Search By</Text>
          <Dropdown
            style={styles.dropdown}
            data={searchOptions}
            labelField="label"
            valueField="value"
            placeholder="Select search type"
            value={searchType}
            onChange={item => {
              setSearchType(item.value);
              setSearchValue('');
              setCustomerData(null);
              setReceipts([]);
            }}
          />
        </View>

        {searchType && (
          <View style={styles.field}>
            <Text style={styles.label}>
              Enter {searchOptions.find(o => o.value === searchType)?.label}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter ${
                searchOptions.find(o => o.value === searchType)?.label
              }`}
              value={searchValue}
              onChangeText={setSearchValue}
              keyboardType={
                searchType === 'mobileNumber' ? 'number-pad' : 'default'
              }
              autoCapitalize={
                searchType === 'panNumber' ? 'characters' : 'none'
              }
            />
          </View>
        )}

        <Button label="Search" onPress={handleSearch} />

        {customerData && (
          <View style={customerStyles.container}>
            <Text style={customerStyles.title}>Customer Details</Text>
            <View style={customerStyles.row}>
              <Text style={customerStyles.label}>Name</Text>
              <Text style={customerStyles.value}>{customerData.customerName || '-'}</Text>
            </View>
            <View style={customerStyles.row}>
              <Text style={customerStyles.label}>Mobile</Text>
              <Text style={customerStyles.value}>{customerData.mobileNumber || '-'}</Text>
            </View>
            <View style={customerStyles.row}>
              <Text style={customerStyles.label}>LAN</Text>
              <Text style={customerStyles.value}>{customerData.lan || '-'}</Text>
            </View>
            <View style={customerStyles.row}>
              <Text style={customerStyles.label}>PAN</Text>
              <Text style={customerStyles.value}>{customerData.panNumber || '-'}</Text>
            </View>
          </View>
        )}

        {receipts.length > 0 && (
          <View style={receiptsSectionStyles.container}>
            <Text style={receiptsSectionStyles.title}>Receipts ({receipts.length})</Text>
            <View style={tableStyles.header}>
              {/* <Text style={[tableStyles.headerCell, tableStyles.lanCell]}>LAN</Text> */}
              <Text style={[tableStyles.headerCell, tableStyles.amountCell]}>Amount</Text>
              <Text style={[tableStyles.headerCell, tableStyles.dateCell]}>Date</Text>
              <Text style={[tableStyles.headerCell, tableStyles.modeCell]}>Mode</Text>
              <Text style={[tableStyles.headerCell, tableStyles.downloadHeaderCell]}>Download</Text>
            </View>
            <FlatList
              data={receipts}
              keyExtractor={item => `${item.id}`}
              renderItem={renderReceiptItem}
            />
          </View>
        )}

        {customerData && receipts.length === 0 && !isLoading && (
          <View style={noReceiptStyles.container}>
            <Text style={noReceiptStyles.text}>No receipts found for this customer</Text>
          </View>
        )}
      </ScrollView>

      <Loader visible={isLoading} />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={resultStyles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={resultStyles.modalContainer}>
            <Text style={resultStyles.modalTitle}>
              Multiple matches found — select one
            </Text>

            <FlatList
              data={searchResults}
              keyExtractor={(item, idx) =>
                item.lan || item.partnerLoanId || item.mobileNumber || String(idx)
              }
              renderItem={renderResultRow}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: '#eee' }} />
              )}
              style={{ maxHeight: 340 }}
            />

            <TouchableOpacity
              style={resultStyles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={resultStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const customerStyles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    minHeight: 40,
  },
  label: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
    fontWeight: '600',
    color: '#495057',
  },
  value: {
    flex: 2,
    padding: 12,
    justifyContent: 'center',
    color: '#333',
  },
});

const receiptsSectionStyles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
});

const receiptStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  completedBadge: { backgroundColor: '#D1FAE5' },
  incompleteBadge: { backgroundColor: '#FEF3C7' },
  statusText: { fontWeight: '600', fontSize: 12 },
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
  btnSecondary: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  btnSecondaryText: { color: '#374151', fontWeight: '600' },
  btnPressed: { opacity: 0.85 },
});

const noReceiptStyles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 20,
    alignItems: 'center',
  },
  text: {
    color: '#6B7280',
    fontSize: 14,
  },
});

const resultStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalTitle: {
    fontWeight: '700',
    fontSize: 16,
    paddingVertical: 10,
    textAlign: 'center',
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  sub: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#007bff',
    fontWeight: '600',
  },
});

const tableStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    fontWeight: '700',
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  rowEven: {
    backgroundColor: '#FFFFFF',
  },
  rowOdd: {
    backgroundColor: '#F9FAFB',
  },
  cell: {
    fontSize: 13,
    color: '#111827',
    textAlign: 'center',
  },
  lanCell: {
    flex: 1.5,
    textAlign: 'left',
  },
  amountCell: {
    flex: 1,
    color: '#065F46',
    fontWeight: '600',
  },
  dateCell: {
    flex: 1,
  },
  modeCell: {
    flex: 0.8,
  },
  downloadBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  downloadHeaderCell: {
    flex: 0.7,
    textAlign: 'center',
  },
});