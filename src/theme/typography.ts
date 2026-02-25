import { Platform, TextStyle } from "react-native";

type LineHeightPreset = "tight" | "normal" | "loose";

const isIOS = Platform.OS === "ios";

const IOS_WEIGHT_MAP: Partial<Record<string, TextStyle["fontWeight"]>> = {
    "900": "800",
    "800": "700",
};

const LINE_HEIGHT_RATIO: Record<LineHeightPreset, number> = {
    tight: 1.2,
    normal: 1.35,
    loose: 1.5,
};

export function normalizeWeight(
    weight: TextStyle["fontWeight"] = "400"
): TextStyle["fontWeight"] {
    if (!isIOS || typeof weight !== "string") return weight;
    return IOS_WEIGHT_MAP[weight] ?? weight;
}

export function lineHeightFor(
    fontSize: number,
    preset: LineHeightPreset = "normal"
): number {
    return Math.round(fontSize * LINE_HEIGHT_RATIO[preset]);
}

type TextStyleOptions = {
    weight?: TextStyle["fontWeight"];
    lineHeightPreset?: LineHeightPreset;
    letterSpacing?: number;
};

export function textStyle(
    fontSize: number,
    options: TextStyleOptions = {}
): TextStyle {
    const {
        weight = "400",
        lineHeightPreset = "normal",
        letterSpacing,
    } = options;

    return {
        fontSize,
        fontWeight: normalizeWeight(weight),
        lineHeight: lineHeightFor(fontSize, lineHeightPreset),
        ...(Platform.OS === "android"
            ? ({ includeFontPadding: false } as TextStyle)
            : null),
        ...(typeof letterSpacing === "number" ? { letterSpacing } : null),
    };
}

export const inputMetrics = {
    height: isIOS ? 50 : 48,
    paddingVertical: isIOS ? 12 : 0,
};

