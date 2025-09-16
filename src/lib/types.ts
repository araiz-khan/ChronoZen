export type Task = {
  id: string;
  title: string;
  startTime: string; // "HH:mm" format
  duration: number; // in minutes
  isCompleted: boolean;
};
