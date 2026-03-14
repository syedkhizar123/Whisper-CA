import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(localizedFormat);

export const formatChatDate = (date: string | Date) => {
    const d = dayjs(date);

    if (d.isToday()) return d.format("hh:mm A");           // 10:30 AM
    if (d.isYesterday()) return "Yesterday";                // Yesterday
    if (dayjs().diff(d, "day") < 7) return d.format("dddd"); // Monday
    return d.format("DD/MM/YY");                            // 12/03/25
};