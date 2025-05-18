import { Trainer } from "../../../features/trainer/models/trainer.interface";

export interface TrainersState {
    loading: boolean;
    error: string | null;
    trainers: Trainer[];
  }

  export const initialTrainersState: TrainersState = {
    loading: false,
    error: null,
    trainers: [],
  };