import React from 'react';
import { View, StyleSheet } from 'react-native';
import { lightGreenTheme } from '../utils/customerThemes';
import EmiSchedule from '../../components/EmiSchedule';

export default function CustomerEmiScheduleScreen() {
  const uiTheme = lightGreenTheme;
  return (
    <View style={styles.container}>
      <EmiSchedule 
        title="EMI Schedule" 
        isRM={false} 
        autoFetch={true}
      />
    </View>
  );
}

const uiTheme = lightGreenTheme;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: uiTheme.bg,
  },
});
