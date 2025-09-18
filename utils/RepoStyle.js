

import {StyleSheet} from 'react-native'

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f8fb' },
  scrollContent: { padding: 16 },

  h1: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e6e9ef',
  },

  section: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },
  subsection: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
    color: '#333',
  },
  label: {
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
    fontSize: 12,
  },

  input: {
    backgroundColor: '#fff',
    borderColor: '#d7ddea',
    borderWidth: 1,
    borderRadius: 8,
    color: '#111',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    marginBottom: 10,
  },
  textarea: { minHeight: 90, textAlignVertical: 'top' },

  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  btn: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d6dcff',
  },
  btnText: { color: '#1f35c5', fontWeight: '600', fontSize: 12 },
  dateText: { color: '#333', marginLeft: 12, fontSize: 12 },

  helper: { color: '#666', fontSize: 12, marginTop: 10 },

  // 3-column grid
  grid3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginTop: 8,
  },
  tileWrapper3: {
    width: '33.3333%',
    paddingHorizontal: 8,
    marginBottom: 14,
  },

  tileWrap: { position: 'relative' },
  photoTile: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#f2f4f9',
    borderWidth: 1,
    borderColor: '#e0e5f2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImg: { width: '100%', height: '100%' },
  photoPlaceholder: {
    color: '#5b6aa1',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 6,
  },

  closeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dfe5f3',
  },
  closeBtnText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '700',
  },

  labelInput: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderColor: '#d7ddea',
    borderWidth: 1,
    borderRadius: 8,
    color: '#111',
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 12,
    position: 'relative',
    zIndex: 10, // keep input above overlapping views
  },

  typeChip: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d6dcff',
    // pointerEvents: 'none' is set inline where used
  },
  typeChipText: { color: '#1f35c5', fontSize: 10, fontWeight: '700' },

  btnPrimary: {
    backgroundColor: '#1f35c5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  btnPrimaryText: { color: 'white', fontWeight: '700', fontSize: 15 },

  dropdown: {
    height: 46,
    borderColor: '#d7ddea',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  dropdownPlaceholder: { color: '#777', fontSize: 14 },
  dropdownSelected: { color: '#111', fontSize: 14 },
});


export default styles;