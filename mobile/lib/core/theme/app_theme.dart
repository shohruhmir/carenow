import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Brand tokens ported 1:1 from frontend/assets/css/main.css so the app
/// reads as the same product as the web client.
class AppColors {
  static const sky = Color(0xFF0EA5E9);
  static const skyLight = Color(0xFFE0F2FE);
  static const skyBorder = Color(0xFFBAE6FD);
  static const emerald = Color(0xFF10B981);
  static const emeraldLight = Color(0xFFD1FAE5);
  static const emeraldText = Color(0xFF047857);
  static const amber = Color(0xFFF59E0B);
  static const amberLight = Color(0xFFFEF3C7);
  static const amberText = Color(0xFFB45309);
  static const pink = Color(0xFFDB2777);
  static const pinkLight = Color(0xFFFCE7F3);

  static const inkLight = Color(0xFF0F172A);
  static const inkSoftLight = Color(0xFF475569);
  static const surfaceLight = Color(0xFFF8FAFC);
  static const cardLight = Color(0xFFFFFFFF);
  static const lineLight = Color(0xFFE2E8F0);

  static const inkDark = Color(0xFFF1F5F9);
  static const inkSoftDark = Color(0xFFCBD5E1);
  static const surfaceDark = Color(0xFF1E293B);
  static const cardDark = Color(0xFF16213A);
  static const lineDark = Color(0xFF334155);
  static const bgDark = Color(0xFF0F172A);
}

class AppTheme {
  static ThemeData light() {
    final textTheme = GoogleFonts.interTextTheme();
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.surfaceLight,
      textTheme: textTheme.apply(bodyColor: AppColors.inkLight, displayColor: AppColors.inkLight),
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.sky,
        brightness: Brightness.light,
        primary: AppColors.sky,
        secondary: AppColors.emerald,
        surface: AppColors.cardLight,
        error: const Color(0xFFDC2626),
      ),
      cardColor: AppColors.cardLight,
      dividerColor: AppColors.lineLight,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.cardLight,
        foregroundColor: AppColors.inkLight,
        elevation: 0,
        centerTitle: false,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.sky,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceLight,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  static ThemeData dark() {
    final textTheme = GoogleFonts.interTextTheme(ThemeData(brightness: Brightness.dark).textTheme);
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.bgDark,
      textTheme: textTheme.apply(bodyColor: AppColors.inkDark, displayColor: AppColors.inkDark),
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.sky,
        brightness: Brightness.dark,
        primary: AppColors.sky,
        secondary: AppColors.emerald,
        surface: AppColors.cardDark,
        error: const Color(0xFFF87171),
      ),
      cardColor: AppColors.cardDark,
      dividerColor: AppColors.lineDark,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.cardDark,
        foregroundColor: AppColors.inkDark,
        elevation: 0,
        centerTitle: false,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.sky,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceDark,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }
}
