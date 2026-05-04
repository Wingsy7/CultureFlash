import { memo } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

type PaywallModalProps = {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
};

export const PaywallModal = memo(function PaywallModal({
  visible,
  onClose,
  onUpgrade,
}: PaywallModalProps) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View className="flex-1 justify-end bg-black/30">
        <View className="gap-5 rounded-t-lg bg-white p-6">
          <View className="gap-2">
            <Text className="text-2xl font-black text-slate-950">
              Passez a Quiz Pro
            </Text>
            <Text className="text-base leading-6 text-slate-600">
              Debloquez le classement, les categories avancees et les defis entre amis.
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Voir les offres Pro"
            accessibilityRole="button"
            className="rounded-lg bg-emerald-600 px-5 py-4"
            onPress={onUpgrade}
          >
            <Text className="text-center text-base font-black text-white">
              Voir les offres
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Fermer la modale Pro"
            accessibilityRole="button"
            className="py-2"
            onPress={onClose}
          >
            <Text className="text-center text-sm font-bold text-slate-500">
              Plus tard
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});
