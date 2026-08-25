export const formatDate = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

export const formatDay = (index: number) => {
	const days = ["일", "월", "화", "수", "목", "금", "토"];
	return days[index];
};

export const getWeekDates = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);

  const monday = new Date(today);
  monday.setDate(diff);

  const weekDates = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    weekDates.push(date);
  }

  return weekDates;
};