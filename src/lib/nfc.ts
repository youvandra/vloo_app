import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { Platform, Alert } from 'react-native';

// Initialize NFC
export const initNfc = async () => {
  try {
    const supported = await NfcManager.isSupported();
    if (supported) {
      await NfcManager.start();
    }
    return supported;
  } catch (e) {
    console.warn('NFC Init Error:', e);
    return false;
  }
};

// Scan for an NFC tag and return its ID
export const scanNfcTag = async (): Promise<string | null> => {
  try {
    // Ensure NFC is supported
    const supported = await NfcManager.isSupported();
    if (!supported) {
      Alert.alert('NFC Not Supported', 'Your device does not support NFC.');
      return null;
    }

    // Request technology
    // Ndef is the most common for standard tags
    // We use try/catch specifically for the request to handle cancellation
    try {
      // IOS requires a message for the scanning UI
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: 'Hold your VLOO card near the top of your phone'
      });
    } catch (e) {
      console.warn('NFC Request Cancelled or Failed', e);
      return null;
    }

    const tag = await NfcManager.getTag();
    console.log('NFC Tag Found:', tag);
    
    // Return the Tag ID (UID)
    return tag?.id || null;

  } catch (ex) {
    console.warn('NFC Scan Error:', ex);
    return null;
  } finally {
    // Stop processing
    NfcManager.cancelTechnologyRequest();
  }
};

// Cancel any pending scan
export const cancelNfcScan = async () => {
  NfcManager.cancelTechnologyRequest();
};
