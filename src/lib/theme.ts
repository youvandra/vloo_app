
import { 
  MuseoModerno_600SemiBold, 
  MuseoModerno_700Bold, 
  MuseoModerno_900Black 
} from '@expo-google-fonts/museomoderno';
import { 
  BeVietnamPro_400Regular, 
  BeVietnamPro_600SemiBold, 
  BeVietnamPro_700Bold 
} from '@expo-google-fonts/be-vietnam-pro';

export const COLORS = {
  background: '#e3d9c2', // Bone/Beige
  primary: '#0b1cc4',    // Vloo Blue
  accent: '#d199f9',     // Pale Violet
  foreground: '#000000', // Black
  inverse: '#FFFFFF',    // White
  
  // Translucency for Glassmorphism fallbacks
  glassWhite: 'rgba(255, 255, 255, 0.9)',
  glassBlack: 'rgba(0, 0, 0, 0.9)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
};

export const FONTS = {
  displayBlack: 'MuseoModerno_900Black',
  displayBold: 'MuseoModerno_700Bold',
  displaySemiBold: 'MuseoModerno_600SemiBold',
  bodyRegular: 'BeVietnamPro_400Regular',
  bodySemiBold: 'BeVietnamPro_600SemiBold',
  bodyBold: 'BeVietnamPro_700Bold',
};

export const STYLES = {
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  }
};
