import React from 'react';
import { Modal, Text, View, TouchableOpacity, StyleSheet } from 'react-native';

const PaymentModal = ({
  isVisible,
  onClose,
  paymentStatus,
  transactionDetails,
}) => {
  const renderStatus = () => {
    if (paymentStatus === 'PROCESSING') {
      return (
        <View style={styles.loaderContainer}>
          <Text style={styles.processingText}>Processing Payment...</Text>
          <Text style={styles.subText}>
            We have sent an SMS to your registered mobile number with the
            payment details.{' '}
          </Text>
        </View>
      );
    }

    if (paymentStatus === 'SUCCESS') {
      return (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>Payment Successful!</Text>
          {transactionDetails?.transactionId && (
            <Text style={styles.transactionText}>
              Transaction ID: {transactionDetails.transactionId}
            </Text>
          )}
          {transactionDetails?.amount && (
            <Text style={styles.amountText}>
              Amount: ₹{transactionDetails.amount}
            </Text>
          )}
        </View>
      );
    }

    if (paymentStatus === 'FAILED') {
      return (
        <Text style={styles.errorText}>Payment Failed. Please try again.</Text>
      );
    }

    return null;
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Payment Status</Text>
          {renderStatus()}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>
              {paymentStatus === 'SUCCESS' ? 'Done' : 'Close'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loaderContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  processingText: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: '600',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  successContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  successText: {
    fontSize: 18,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  transactionText: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
  },
  amountText: {
    fontSize: 16,
    color: '#1565c0',
    fontWeight: '600',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
  },
  closeButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 100,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PaymentModal;
