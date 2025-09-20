// src/components/LabeledPhotoTile.jsx
import React, { useEffect, useRef, useState, memo } from 'react';
import { View, Text, TextInput, Pressable, Image, Keyboard } from 'react-native';
import { detectType } from '../utils';

function Tile({ id, file, styles, editingId, setEditingId, askPhotoSource, setPhotos }) {
  const [label, setLabel] = useState(file?.label ?? '');
  const inputRef = useRef(null);

  useEffect(() => { setLabel(file?.label ?? ''); }, [file?.label]);

  const hasImage = !!file?.uri;
  const typeChip = detectType(id);
  const isEditing = editingId === id;

  const commitLabel = () => {
    setPhotos((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), label: label.trim() } }));
  };

  const focusInput = () => {
    const inst = inputRef.current;
    if (inst && !inst.isFocused?.()) setTimeout(() => inst.focus?.(), 0);
  };

  return (
    <View style={styles.tileWrap} pointerEvents="box-none">
      <Pressable
        style={styles.photoTile}
        onPress={() => { if (!isEditing) askPhotoSource(id); }}
        pointerEvents={isEditing ? 'none' : 'auto'}
      >
        {hasImage ? (
          <Image source={{ uri: file.uri }} style={styles.photoImg} />
        ) : (
          <Text style={styles.photoPlaceholder}>+ Add</Text>
        )}
      </Pressable>

      {hasImage ? (
        <Pressable
          style={styles.closeBtn}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          onPress={() => {
            if (isEditing) return;
            setPhotos((p) => {
              const n = { ...p };
              delete n[id];
              return n;
            });
          }}
          pointerEvents={isEditing ? 'none' : 'auto'}
        >
          <Text style={styles.closeBtnText}>×</Text>
        </Pressable>
      ) : null}

      {/* <TextInput
        ref={inputRef}
        style={[styles.labelInput, !label?.trim() && file?.uri ? { borderColor: 'red' } : null]}
        placeholder="Label (required)"
        value={label}
        onChangeText={setLabel}
        multiline={false}
        blurOnSubmit={false}
        returnKeyType="done"
        onFocus={() => setEditingId(id)}
        onBlur={() => { setEditingId(null); commitLabel(); }}
        onSubmitEditing={() => { Keyboard.dismiss(); setEditingId(null); commitLabel(); }}
        onTouchStart={focusInput}
        onPressIn={focusInput}
        autoCorrect={false}
        importantForAutofill="no"
        textContentType="none"
      /> */}

      <TextInput
        ref={inputRef}
        style={[styles.labelInput, !label?.trim() && file?.uri ? { borderColor: 'red' } : null]}
        placeholder="Label (required)"
        value={label}
        onChangeText={(t) => {
          setLabel(t);
          setPhotos((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), label: t } }));
        }}
        multiline={false}
        blurOnSubmit={false}
        returnKeyType="done"
        onFocus={() => setEditingId(id)}
        onBlur={() => { setEditingId(null); commitLabel(); }}
        onSubmitEditing={() => { Keyboard.dismiss(); setEditingId(null); commitLabel(); }}
        onTouchStart={focusInput}
        onPressIn={focusInput}
        autoCorrect={false}
        importantForAutofill="no"
        textContentType="none"
      />


      <View style={styles.typeChip} pointerEvents="none">
        <Text style={styles.typeChipText}>{typeChip}</Text>
      </View>
    </View>
  );
}

export default memo(Tile);
