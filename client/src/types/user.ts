
export interface DeviceDetails {
    id: string,
    name: string,
    type: string
}

export interface User {
    _id: string,
    name: string,
    email: string,
    image?: string,
    isVerified?: boolean,
}