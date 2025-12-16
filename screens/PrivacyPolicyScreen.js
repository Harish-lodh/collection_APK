import React from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.subTitle}>Fintree Finance Pvt. Ltd.</Text>

      <Text style={styles.text}>
        Effective Date: 15 September 2025
        {"\n\n"}

        Fintree Finance Pvt. Ltd. (“we”, “our”, “us”) operates the Collection App (“App”).
        This Privacy Policy explains how we collect, use, disclose, and protect user
        information when you use our App.
      </Text>

      <Text style={styles.heading}>1. Information We Collect</Text>
      <Text style={styles.text}>
        We may collect the following types of information:
        {"\n\n"}
        <Text style={styles.bold}>a. Personal Information</Text>
        {"\n"}• Name
        {"\n"}• Phone number
        {"\n"}• Employee or agent identification details (if applicable)
        {"\n\n"}

        <Text style={styles.bold}>b. Location Information</Text>
        {"\n"}• Real-time location collected at the time of collection activity to verify collection location.
        {"\n\n"}

        <Text style={styles.bold}>c. Camera & Image Data</Text>
        {"\n"}• Photos captured using the device camera for collection proof and verification purposes.
        {"\n\n"}

        <Text style={styles.bold}>d. Device & App Information</Text>
        {"\n"}• Device model
        {"\n"}• Operating system version
        {"\n"}• App usage logs (for security and troubleshooting)
      </Text>

      <Text style={styles.heading}>2. How We Use Your Information</Text>
      <Text style={styles.text}>
        • Verify collection activities
        {"\n"}• Capture proof of collection
        {"\n"}• Tag collection location
        {"\n"}• Improve app performance and reliability
        {"\n"}• Ensure compliance with internal and regulatory requirements
      </Text>

      <Text style={styles.heading}>3. Permissions We Use</Text>
      <Text style={styles.text}>
        <Text style={styles.bold}>Camera Permission</Text>
        {"\n"}Used to capture images as proof during collection activities.
        {"\n\n"}
        <Text style={styles.bold}>Location Permission (Foreground only)</Text>
        {"\n"}Used to capture the location where the collection activity is performed.
        {"\n\n"}
        We do not access location or camera data when the App is not in use.
      </Text>

      <Text style={styles.heading}>4. Data Sharing & Disclosure</Text>
      <Text style={styles.text}>
        We do not sell or rent user data.
        {"\n\n"}
        Data may be shared only:
        {"\n"}• With authorized internal teams of Fintree Finance Pvt. Ltd.
        {"\n"}• When required by law or regulatory authorities
        {"\n"}• With secure service providers strictly for app functionality
      </Text>

      <Text style={styles.heading}>5. Data Security</Text>
      <Text style={styles.text}>
        • Secure (HTTPS) network communication
        {"\n"}• Restricted access to collected data
        {"\n"}• Data used strictly for business purposes
      </Text>

      <Text style={styles.heading}>6. Data Retention</Text>
      <Text style={styles.text}>
        We retain user data only for as long as necessary to:
        {"\n"}• Fulfill business and legal requirements
        {"\n"}• Comply with regulatory obligations
        {"\n\n"}
        Once no longer required, data is securely deleted or anonymized.
      </Text>

      <Text style={styles.heading}>7. User Rights</Text>
      <Text style={styles.text}>
        Users may:
        {"\n"}• Request access to their data
        {"\n"}• Request correction or deletion of data (subject to legal requirements)
        {"\n\n"}
        Requests can be made by contacting us using the details below.
      </Text>

      <Text style={styles.heading}>8. Children’s Privacy</Text>
      <Text style={styles.text}>
        This App is not intended for use by children under 18 years of age.
        {"\n"}We do not knowingly collect data from children.
      </Text>

      <Text style={styles.heading}>9. Changes to This Privacy Policy</Text>
      <Text style={styles.text}>
        We may update this Privacy Policy from time to time.
        {"\n"}Changes will be effective immediately upon posting in the App or Play Store listing.
      </Text>

      <Text style={styles.heading}>10. Contact Us</Text>
      <Text style={styles.text}>
        Fintree Finance Pvt. Ltd.
        {"\n"}📧 Email: wecarefintree@gmail.com
        {"\n"}📍 Address:
        {"\n"}Engineering Centre, 4th Floor,
        {"\n"}9 Matthew Road, Opera House,
        {"\n"}Mumbai – 400004
      </Text>

      {/* 🔗 WEBSITE PRIVACY POLICY LINK */}
      <TouchableOpacity
        onPress={() =>
          Linking.openURL('https://fintreefinance.com/finCollect/privacy-policy')
        }
        activeOpacity={0.7}
        style={styles.websiteLinkContainer}
      >
        <Text style={styles.websiteLink}>
          View Official Privacy Policy on Website
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  subTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    color: '#555',
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
  websiteLinkContainer: {
    marginTop: 24,
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  websiteLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
