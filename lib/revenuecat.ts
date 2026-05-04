import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

export const PRO_ENTITLEMENT_ID = 'pro';
export const MONTHLY_PRODUCT_ID = 'quiz_pro_monthly';
export const YEARLY_PRODUCT_ID = 'quiz_pro_yearly';

let hasConfiguredRevenueCat = false;
let configuredAppUserId: string | null = null;

const readRevenueCatKey = (): string | null => {
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? null;
  }

  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? null;
  }

  return null;
};

export const configureRevenueCat = async (appUserId: string): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  const apiKey = readRevenueCatKey();

  if (!apiKey) {
    throw new Error('La clé RevenueCat publique est manquante pour cette plateforme.');
  }

  if (!hasConfiguredRevenueCat) {
    Purchases.setLogLevel(LOG_LEVEL.WARN);
    Purchases.configure({ apiKey, appUserID: appUserId });
    hasConfiguredRevenueCat = true;
    configuredAppUserId = appUserId;
    return;
  }

  if (configuredAppUserId !== appUserId) {
    await Purchases.logIn(appUserId);
    configuredAppUserId = appUserId;
  }
};

export const hasProEntitlement = (customerInfo: CustomerInfo): boolean =>
  Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);

export const getCurrentOffering = async (): Promise<PurchasesOffering | null> => {
  const offerings = await Purchases.getOfferings();

  return offerings.current ?? null;
};

export const findPackageByProductId = (
  offering: PurchasesOffering | null,
  productId: string,
): PurchasesPackage | null => {
  if (!offering) {
    return null;
  }

  return offering.availablePackages.find(
    (revenueCatPackage) => revenueCatPackage.product.identifier === productId,
  ) ?? null;
};
