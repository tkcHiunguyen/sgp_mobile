import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { CalendarList, DateData } from "react-native-calendars";

import { BaseModal } from "./ui/BaseModal";
import { colors } from "../theme/theme";
import { textStyle } from "../theme/typography";

type Props = {
    fromDate: string; // dd-MM-yy
    toDate: string; // dd-MM-yy
    onChange: (next: { fromDate: string; toDate: string }) => void;
    onCloseOthers?: () => void; // để bạn đóng device filter khi mở date filter
};

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

// yyyy-MM-dd (calendar) -> dd-MM-yy (app)
const ymdToDdMmYy = (ymd: string) => {
    const [y, m, d] = ymd.split("-");
    return `${d}-${m}-${y.slice(2)}`;
};

// dd-MM-yy (app) -> yyyy-MM-dd (calendar)
const ddMmYyToYmd = (dmy: string) => {
    const [dd, mm, yy] = dmy.split("-");
    const yyyy = `20${yy}`;
    return `${yyyy}-${pad2(parseInt(mm, 10))}-${pad2(parseInt(dd, 10))}`;
};

const todayYmd = () => {
    const t = new Date();
    return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`;
};

export function DateRangeFilter({
    fromDate,
    toDate,
    onChange,
    onCloseOthers,
}: Props) {
    const [open, setOpen] = useState(false);

    // state tạm trong modal (chỉ áp dụng khi bấm "Áp dụng")
    const [tempFrom, setTempFrom] = useState(fromDate);
    const [tempTo, setTempTo] = useState(toDate);

    const hasValue = !!fromDate || !!toDate || open;

    const markedDates = useMemo(() => {
        const marks: any = {};

        if (!tempFrom && !tempTo) return marks;

        const start = tempFrom ? ddMmYyToYmd(tempFrom) : "";
        const end = tempTo ? ddMmYyToYmd(tempTo) : "";

        // chỉ chọn 1 ngày
        if (start && !end) {
            marks[start] = {
                startingDay: true,
                endingDay: true,
                color: "rgba(59,130,246,0.35)",
                textColor: colors.text,
            };
            return marks;
        }

        // start + end
        if (start && end) {
            const s = new Date(start);
            const e = new Date(end);

            // swap nếu user chọn ngược
            const startDate = s <= e ? s : e;
            const endDate = s <= e ? e : s;

            const cur = new Date(startDate);
            while (cur <= endDate) {
                const y = cur.getFullYear();
                const m = pad2(cur.getMonth() + 1);
                const d = pad2(cur.getDate());
                const key = `${y}-${m}-${d}`;

                const isStart =
                    key ===
                    `${startDate.getFullYear()}-${pad2(
                        startDate.getMonth() + 1
                    )}-${pad2(startDate.getDate())}`;
                const isEnd =
                    key ===
                    `${endDate.getFullYear()}-${pad2(
                        endDate.getMonth() + 1
                    )}-${pad2(endDate.getDate())}`;

                marks[key] = {
                    startingDay: isStart,
                    endingDay: isEnd,
                    color: "rgba(59,130,246,0.35)",
                    textColor: colors.text,
                };

                cur.setDate(cur.getDate() + 1);
            }
        }

        return marks;
    }, [tempFrom, tempTo]);

    const openModal = () => {
        // sync lại temp mỗi lần mở
        setTempFrom(fromDate);
        setTempTo(toDate);
        setOpen(true);
        onCloseOthers?.();
    };

    const closeModal = () => setOpen(false);

    const onDayPress = (day: DateData) => {
        const picked = ymdToDdMmYy(day.dateString);

        // chưa có from -> set from
        if (!tempFrom) {
            setTempFrom(picked);
            setTempTo("");
            return;
        }

        // có from nhưng chưa có to -> set to
        if (tempFrom && !tempTo) {
            setTempTo(picked);
            return;
        }

        // đã có cả 2 -> chọn lại từ đầu
        setTempFrom(picked);
        setTempTo("");
    };

    const apply = () => {
        // nếu chọn ngược thì swap trước khi apply
        if (tempFrom && tempTo) {
            const a = ddMmYyToYmd(tempFrom);
            const b = ddMmYyToYmd(tempTo);
            if (a > b) {
                onChange({ fromDate: tempTo, toDate: tempFrom });
                setOpen(false);
                return;
            }
        }

        onChange({ fromDate: tempFrom, toDate: tempTo });
        setOpen(false);
    };

    const reset = () => {
        setTempFrom("");
        setTempTo("");
        onChange({ fromDate: "", toDate: "" });
        setOpen(false);
    };

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity
                style={[styles.filterBox, hasValue && styles.filterBoxActive]}
                onPress={openModal}
                activeOpacity={0.7}
            >
                <Ionicons name="calendar-outline" style={styles.filterIcon} />
            </TouchableOpacity>

            <BaseModal visible={open} onRequestClose={closeModal} width="92%">
                <Text style={styles.title}>Chọn khoảng thời gian</Text>

                <View style={styles.pillsRow}>
                    <View style={styles.pill}>
                        <Text style={styles.pillLabel}>Từ</Text>
                        <Text style={styles.pillValue}>{tempFrom || "--"}</Text>
                    </View>
                    <View style={styles.pill}>
                        <Text style={styles.pillLabel}>Đến</Text>
                        <Text style={styles.pillValue}>{tempTo || "--"}</Text>
                    </View>
                </View>

                {/* CalendarList: scroll tháng/năm (có thể lướt nhiều năm) */}
                <View style={styles.calendarWrap}>
                    <CalendarList
                        current={tempFrom ? ddMmYyToYmd(tempFrom) : todayYmd()}
                        pastScrollRange={24} // lùi 24 tháng (2 năm)
                        futureScrollRange={24} // tiến 24 tháng (2 năm)
                        scrollEnabled
                        showScrollIndicator
                        onDayPress={onDayPress}
                        markingType="period"
                        markedDates={markedDates}
                        theme={{
                            backgroundColor: colors.background,
                            calendarBackground: colors.background,
                            monthTextColor: colors.text,
                            dayTextColor: colors.text,
                            textDisabledColor: colors.textMuted,
                            arrowColor: colors.textAccent,
                            todayTextColor: colors.textAccent,
                        }}
                    />
                </View>

                <View style={styles.actionsRow}>
                    <TouchableOpacity onPress={reset}>
                        <Text style={styles.actionText}>Đặt lại</Text>
                    </TouchableOpacity>

                    <View style={{ flex: 1 }} />

                    <TouchableOpacity onPress={closeModal}>
                        <Text
                            style={[
                                styles.actionText,
                                { color: colors.textMuted },
                            ]}
                        >
                            Hủy
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={apply}>
                        <Text style={styles.actionText}>Áp dụng</Text>
                    </TouchableOpacity>
                </View>
            </BaseModal>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: 50,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    filterBox: {
        width: 42,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(96,165,250,0.8)",
        backgroundColor: colors.surface,
        justifyContent: "center",
        alignItems: "center",
    },
    filterBoxActive: {
        backgroundColor: "rgba(37,99,235,0.2)",
    },
    filterIcon: {
        fontSize: 20,
        color: colors.textAccent,
    },

    title: {
        ...textStyle(16, { weight: "700", lineHeightPreset: "tight" }),
        color: colors.text,
        textAlign: "center",
        marginBottom: 10,
    },

    pillsRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 10,
    },
    pill: {
        flex: 1,
        borderWidth: 1,
        borderColor: "rgba(75,85,99,0.9)",
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    pillLabel: {
        color: colors.textMuted,
        ...textStyle(11, { lineHeightPreset: "tight" }),
        marginBottom: 4,
    },
    pillValue: {
        color: colors.text,
        ...textStyle(13, { weight: "600", lineHeightPreset: "tight" }),
    },

    calendarWrap: {
        borderWidth: 1,
        borderColor: "rgba(75,85,99,0.6)",
        borderRadius: 12,
        overflow: "hidden",
        maxHeight: 360,
        marginBottom: 10,
    },

    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginTop: 6,
    },
    actionText: {
        color: colors.textAccent,
        ...textStyle(13, { weight: "700", lineHeightPreset: "tight" }),
    },
});
