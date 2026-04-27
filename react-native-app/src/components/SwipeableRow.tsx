import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import { LightTheme as C, Spacing } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;

type Props = {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  itemName?: string;
};

export default function SwipeableRow({ children, onEdit, onDelete, itemName }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderMove: (_, gestureState) => {
        const clampedX = Math.max(-160, Math.min(160, gestureState.dx));
        translateX.setValue(clampedX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          onEdit();
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          Alert.alert(
            'Delete',
            `Are you sure you want to delete ${itemName || 'this item'}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: onDelete },
            ]
          );
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.actionsContainer}>
        <View style={[styles.action, styles.editAction]}>
          <Text style={styles.actionText}>Edit</Text>
        </View>
        <View style={[styles.action, styles.deleteAction]}>
          <Text style={styles.actionText}>Delete</Text>
        </View>
      </View>
      <Animated.View
        style={[styles.foreground, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', marginBottom: 1 },
  actionsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  action: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAction: { backgroundColor: C.accent },
  deleteAction: { backgroundColor: C.red },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  foreground: { backgroundColor: C.surface },
});
