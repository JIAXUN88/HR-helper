
export interface Participant {
  id: string;
  name: string;
}

export interface Winner {
  id: string;
  name: string;
  prize: string;
  timestamp: Date;
}

export interface Group {
  id: string;
  name: string;
  theme?: string;
  members: Participant[];
}

export enum Tab {
  Participants = 'participants',
  LuckyDraw = 'luckydraw',
  Grouping = 'grouping'
}
