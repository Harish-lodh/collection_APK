
import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  field: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputRow: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueText: { fontSize: 16, color: '#111' },
  placeholder: { color: '#888' },
  errorText: { color: 'red', fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  helper: { color: '#666', marginTop: 12 },
  dropdown: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  loaderContainer: { marginTop: 16, alignItems: 'center' },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  req: { color: '#e5484d' },
  hint: { fontSize: 12, color: '#888' },
  hintOk: { fontSize: 12, color: '#0a7' },

  segmentRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  segment: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  segmentActive: {
    borderColor: '#0a7',
    backgroundColor: '#eafff5',
  },
  segmentEmoji: { fontSize: 18, opacity: 0.7 },
  segmentEmojiActive: { opacity: 1 },
  segmentTitle: { color: '#333', fontWeight: '700' },
  segmentTitleActive: { color: '#0a7' },
  segmentSub: { color: '#666', fontSize: 12 },
  tick: { fontWeight: '900', fontSize: 14, color: '#0a7' },

  primaryBtn: {
    marginTop: 6,
    backgroundColor: '#0a7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  closePill: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  closeText: { color: '#fff', fontSize: 16, lineHeight: 16, fontWeight: '700' },
  previewCaption: { marginTop: 6, fontSize: 12, color: '#666' },
});



export default styles;