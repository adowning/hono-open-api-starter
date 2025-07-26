// types.ts

export interface User {
  name: string;
  avatar: string;
  online: boolean;
}

export interface Message {
  id: string;
  userId: string;
  text: string;
  time: string;
}
