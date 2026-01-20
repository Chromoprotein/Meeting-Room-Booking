export const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sun
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Mon start
    return new Date(d.setDate(diff));
};

export const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};