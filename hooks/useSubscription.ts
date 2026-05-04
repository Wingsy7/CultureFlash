import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

import {
  configureRevenueCat,
  findPackageByProductId,
  getCurrentOffering,
  hasProEntitlement,
  MONTHLY_PRODUCT_ID,
  YEARLY_PRODUCT_ID,
} from '@/lib/revenuecat';
import { useUserStore } from '@/store/userStore';

type UseSubscriptionResult = {
  isPro: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  monthlyPackage: PurchasesPackage | null;
  yearlyPackage: PurchasesPackage | null;
  purchaseMonthly: () => Promise<void>;
  purchaseYearly: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
};

const isUserCancelledPurchase = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return Boolean((error as { userCancelled?: unknown }).userCancelled);
};

export const useSubscription = (): UseSubscriptionResult => {
  const user = useUserStore((state) => state.user);
  const subscriptionStatus = useUserStore((state) => state.subscriptionStatus);
  const setSubscriptionStatus = useUserStore((state) => state.setSubscriptionStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [monthlyPackage, setMonthlyPackage] = useState<PurchasesPackage | null>(null);
  const [yearlyPackage, setYearlyPackage] = useState<PurchasesPackage | null>(null);

  const refreshSubscription = useCallback(async (): Promise<void> => {
    if (Platform.OS === 'web') {
      setSubscriptionStatus('free');
      return;
    }

    if (!user) {
      setSubscriptionStatus('free');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await configureRevenueCat(user.id);

      const [customerInfo, offering] = await Promise.all([
        Purchases.getCustomerInfo(),
        getCurrentOffering(),
      ]);

      setSubscriptionStatus(hasProEntitlement(customerInfo) ? 'pro' : 'free');
      setMonthlyPackage(findPackageByProductId(offering, MONTHLY_PRODUCT_ID));
      setYearlyPackage(findPackageByProductId(offering, YEARLY_PRODUCT_ID));
    } catch (error) {
      setSubscriptionStatus('free');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de verifier l’abonnement Pro.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [setSubscriptionStatus, user]);

  const purchasePackage = useCallback(
    async (revenueCatPackage: PurchasesPackage | null): Promise<void> => {
      if (!revenueCatPackage) {
        throw new Error('Cette offre Pro n’est pas disponible pour le moment.');
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { customerInfo } = await Purchases.purchasePackage(revenueCatPackage);
        setSubscriptionStatus(hasProEntitlement(customerInfo) ? 'pro' : 'free');
      } catch (error) {
        if (!isUserCancelledPurchase(error)) {
          setErrorMessage(
            error instanceof Error ? error.message : 'L’achat a echoue.',
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [setSubscriptionStatus],
  );

  const purchaseMonthly = useCallback(
    async (): Promise<void> => purchasePackage(monthlyPackage),
    [monthlyPackage, purchasePackage],
  );

  const purchaseYearly = useCallback(
    async (): Promise<void> => purchasePackage(yearlyPackage),
    [purchasePackage, yearlyPackage],
  );

  const restorePurchases = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const customerInfo = await Purchases.restorePurchases();
      setSubscriptionStatus(hasProEntitlement(customerInfo) ? 'pro' : 'free');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'La restauration a echoue.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [setSubscriptionStatus]);

  useEffect(() => {
    void refreshSubscription();
  }, [refreshSubscription]);

  return {
    isPro: subscriptionStatus === 'pro',
    isLoading,
    errorMessage,
    monthlyPackage,
    yearlyPackage,
    purchaseMonthly,
    purchaseYearly,
    restorePurchases,
    refreshSubscription,
  };
};
