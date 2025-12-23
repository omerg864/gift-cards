export interface Device {
  id: string;
  name: string;
  type: string;
}

export interface IToken {
  token: string;
  device_id: string;
  createdAt: Date;
  name: string;
  type: string;
  unique: string;
}
