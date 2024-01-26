const maxTime = 59 * 59;

const convertToTime = (timeNum: number): string => {
  if (timeNum < 59) {
    return timeNum.toString();
  }

  let result = "";
  let hours;
  if (timeNum > maxTime) {
    hours = Math.floor(timeNum / 3600);
    timeNum /= 60;
    result += `${hours}:`;
  }
  let minutes = Math.floor(timeNum / 60);
  let seconds: any = timeNum % 60;
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  result += `${minutes}:${seconds}`;
  return result;
};

const convertToSeconds = (timeText: string): number => {
  const temp = timeText.split(":");
  let sum = 0;

  for (let i = 0; i < temp.length; i++) {
    if (i < temp.length - 1) {
      sum += (sum + parseInt(temp[i])) * 60;
    } else {
      sum += parseInt(temp[i]);
    }
  }
  return sum;
};

export const SliderPosition = (songLength: string, currentPos: string) => {
  const totalLength = convertToSeconds(songLength);
  const current = convertToSeconds(currentPos);
  return {
    length: convertToTime(totalLength),
    current: convertToTime(current),
    percent: Math.floor(current / (totalLength / 100)),
  };
};
