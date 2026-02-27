export const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export const dmyToDate = (dmy: string) => {
    if (!dmy) return null;
    const m = dmy.match(/^\d{2}-\d{2}-\d{2}$/);
    if (!m) return null;

    const [dd, mm, yy] = dmy.split("-").map((x) => parseInt(x, 10));
    if (!dd || !mm) return null;

    return new Date(2000 + yy, mm - 1, dd);
};

export const dateToDmy = (d: Date) => {
    const dd = pad2(d.getDate());
    const mm = pad2(d.getMonth() + 1);
    const yy = String(d.getFullYear()).slice(2);
    return `${dd}-${mm}-${yy}`;
};

export const clampDate = (d: Date, min: Date, max: Date) => {
    const t = d.getTime();
    if (t < min.getTime()) return new Date(min);
    if (t > max.getTime()) return new Date(max);
    return d;
};

export const startOfMonth = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), 1);

export const addDays = (d: Date, days: number) =>
    new Date(d.getTime() + days * 86400000);
