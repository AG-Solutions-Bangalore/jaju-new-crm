
import moment from "moment";


export const getTodayDate = () => {
  return moment().format("YYYY-MM-DD");
};


export const getFirstDayOfMonth = () => {
  return moment().startOf("month").format("YYYY-MM-DD");
};
