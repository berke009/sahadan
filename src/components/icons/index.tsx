import React from 'react';
import Svg, { Path, Polygon, Circle, Rect, Line, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export function ArrowUpIcon({ size = 10, color = '#00FF87' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10">
      <Polygon points="5,1 9,9 1,9" fill={color} />
    </Svg>
  );
}

export function ArrowDownIcon({ size = 10, color = '#FF453A' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10">
      <Polygon points="1,1 9,1 5,9" fill={color} />
    </Svg>
  );
}

export function SendIcon({ size = 20, color = '#080808' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill={color} />
    </Svg>
  );
}

export function ChevronDownIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" fill={color} />
    </Svg>
  );
}

export function ChevronUpIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" fill={color} />
    </Svg>
  );
}

export function BallIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" />
      <Path
        d="M12 2 L12 6 M6 6 L9 9 M18 6 L15 9 M4 14 L7 12 M20 14 L17 12 M8 20 L10 17 M16 20 L14 17"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M12 6 L9 9 L10 13 L14 13 L15 9 Z" fill={color} opacity={0.6} />
    </Svg>
  );
}

export function SoccerPitchWatermark() {
  const stroke = 'rgba(255,255,255,0.07)';
  const sw = 1.5;

  return (
    <Svg width="100%" height="100%" viewBox="0 0 220 390" preserveAspectRatio="xMidYMid meet">
      <G>
        {/* Outer boundary */}
        <Rect x="4" y="4" width="212" height="382" stroke={stroke} strokeWidth={sw} fill="none" />

        {/* Center line */}
        <Line x1="4" y1="195" x2="216" y2="195" stroke={stroke} strokeWidth={sw} />

        {/* Center circle */}
        <Circle cx="110" cy="195" r="46" stroke={stroke} strokeWidth={sw} fill="none" />

        {/* Center spot */}
        <Circle cx="110" cy="195" r="3" fill={stroke} />

        {/* Top penalty area */}
        <Rect x="47" y="4" width="126" height="68" stroke={stroke} strokeWidth={sw} fill="none" />

        {/* Top 6-yard box */}
        <Rect x="78" y="4" width="64" height="24" stroke={stroke} strokeWidth={sw} fill="none" />

        {/* Top penalty spot */}
        <Circle cx="110" cy="52" r="2.5" fill={stroke} />

        {/* Bottom penalty area */}
        <Rect x="47" y="318" width="126" height="68" stroke={stroke} strokeWidth={sw} fill="none" />

        {/* Bottom 6-yard box */}
        <Rect x="78" y="362" width="64" height="24" stroke={stroke} strokeWidth={sw} fill="none" />

        {/* Bottom penalty spot */}
        <Circle cx="110" cy="338" r="2.5" fill={stroke} />

        {/* Top goal */}
        <Rect x="88" y="0" width="44" height="8" stroke={stroke} strokeWidth={sw} fill="none" />

        {/* Bottom goal */}
        <Rect x="88" y="382" width="44" height="8" stroke={stroke} strokeWidth={sw} fill="none" />

        {/* Top-left corner arc */}
        <Path d="M 4,14 A 10,10 0 0 1 14,4" stroke={stroke} strokeWidth={sw} fill="none" />
        {/* Top-right corner arc */}
        <Path d="M 206,4 A 10,10 0 0 1 216,14" stroke={stroke} strokeWidth={sw} fill="none" />
        {/* Bottom-left corner arc */}
        <Path d="M 4,376 A 10,10 0 0 0 14,386" stroke={stroke} strokeWidth={sw} fill="none" />
        {/* Bottom-right corner arc */}
        <Path d="M 216,376 A 10,10 0 0 1 206,386" stroke={stroke} strokeWidth={sw} fill="none" />
      </G>
    </Svg>
  );
}

export function ChatBetLogo({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="18" fill="#00FF87" opacity={0.15} />
      <Circle cx="20" cy="20" r="18" stroke="#00FF87" strokeWidth="1.5" fill="none" />
      <Path
        d="M11 16h3v10h-3zM16 12h3v14h-3zM21 17h3v9h-3zM26 14h3v12h-3z"
        fill="#00FF87"
      />
    </Svg>
  );
}

export function MinimizeIcon({ size = 18, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M19 13H5v-2h14v2z" fill={color} />
    </Svg>
  );
}

export function ExpandIcon({ size = 18, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M19 11H5v2h14v-2z" fill={color} />
      <Path d="M11 5v14h2V5h-2z" fill={color} />
    </Svg>
  );
}
